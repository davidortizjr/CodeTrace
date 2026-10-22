import { Worker } from 'node:worker_threads';
import { GUEST_RUNTIME } from './prelude.js';

/**
 * Runs student code in a worker thread, inside a fresh vm context.
 *
 * Everything the student code touches (the test driver, the encoder, the trace
 * recorder) is defined *inside* the context, and only plain strings come back
 * out. No host objects are shared with the guest.
 *
 * This is a practice-tool sandbox, not a security boundary. If you deploy this
 * publicly, run the server itself in a container with no secrets in its
 * environment and a read-only filesystem.
 */

export interface Job {
  code: string;
  /** Name of the function the tests call. Not used for script jobs. */
  fn: string;
  /** Run the code as a plain script and record what it prints with console.log. */
  script?: boolean;
  /** One JSON string per test: the arguments array. */
  argsList: string[];
  trace?: boolean;
  timeoutMs?: number;
}

export interface RunOutcome {
  /** Encoded return value (see PRELUDE), absent when the call threw. */
  out?: string;
  mutated?: boolean;
  error?: { name: string; message: string } | null;
  timedOut?: boolean;
}

export interface TraceEvent {
  step: number;
  line: number;
  kind: string;
  vars: Record<string, string>;
}

export interface JobResult {
  phase: 'ok' | 'compile' | 'load' | 'missing' | 'timeout' | 'internal';
  /** Script jobs: lines printed by console.log, and the error the script ended with, if any. */
  output?: string[];
  outputCut?: boolean;
  uncaught?: { name: string; message: string; line?: number; timedOut?: boolean };
  compileError?: { message: string; line?: number };
  loadError?: { name: string; message: string; timedOut?: boolean };
  runs: RunOutcome[];
  events: TraceEvent[];
  truncated: boolean;
}

const IDENT = /^[A-Za-z_$][\w$]*$/;
export const isIdentifier = (s: string) => IDENT.test(s);

/** Defined inside every context before the student code runs. */
const PRELUDE = GUEST_RUNTIME + `
globalThis.__enc = function (v) {
  try {
    return JSON.stringify(v, function (k, x) {
      if (x === undefined) return { $: 'undefined' };
      if (typeof x === 'number') {
        if (x !== x) return { $: 'NaN' };
        if (x === Infinity) return { $: 'Infinity' };
        if (x === -Infinity) return { $: '-Infinity' };
      }
      if (typeof x === 'function') return { $: 'function' };
      if (typeof x === 'bigint') return { $: 'bigint', v: x.toString() };
      if (typeof x === 'symbol') return { $: 'symbol' };
      if (x instanceof Map) return { $: 'Map', v: Array.from(x) };
      if (x instanceof Set) return { $: 'Set', v: Array.from(x) };
      return x;
    });
  } catch (e) {
    return '{"$":"unserializable"}';
  }
};
globalThis.__events = [];
globalThis.__truncated = false;
globalThis.__v = function (f) {
  try {
    var s = __enc(f());
    if (typeof s !== 'string') return undefined;
    if (s === '{"$":"undefined"}') return undefined;
    return s.length > 90 ? s.slice(0, 87) + '...' : s;
  } catch (e) {
    return undefined;
  }
};
globalThis.__t = function (line, kind, vars) {
  if (__events.length >= 600) { __truncated = true; return; }
  __events.push({ step: __events.length, line: line, kind: kind, vars: vars });
};
globalThis.__runTest = function (argsJson) {
  var args = JSON.parse(argsJson);
  var before = __enc(args);
  var out = null, err = null;
  try {
    out = __fn.apply(undefined, args);
    if (out && typeof out.then === 'function') {
      var pend = { done: false, before: before, args: args };
      globalThis.__pend = pend;
      out.then(function (v) { pend.done = true; pend.v = v; }, function (e) { pend.done = true; pend.err = e; });
      return JSON.stringify({ pending: true });
    }
  } catch (e) {
    err = {
      name: (e && typeof e.name === 'string') ? e.name : 'Error',
      message: (e && typeof e.message === 'string') ? e.message.slice(0, 200) : 'Unknown error'
    };
  }
  return JSON.stringify({
    out: err ? null : __enc(out),
    mutated: __enc(args) !== before,
    error: err
  });
};
globalThis.__settled = function () {
  var p = globalThis.__pend;
  if (!p || !p.done) return JSON.stringify({ pending: true });
  var err = null;
  if ('err' in p) {
    var e = p.err;
    err = {
      name: (e && typeof e.name === 'string') ? e.name : 'Error',
      message: (e && typeof e.message === 'string') ? e.message.slice(0, 200) : 'The promise was rejected'
    };
  }
  return JSON.stringify({ out: err ? null : __enc(p.v), mutated: __enc(p.args) !== p.before, error: err });
};
`;

const WORKER_SOURCE = `
const { parentPort, workerData } = require('node:worker_threads');
const vm = require('node:vm');

let unhandled = null;
process.on('unhandledRejection', (reason) => { if (!unhandled) unhandled = reason; });
const tick = () => new Promise((resolve) => setImmediate(resolve));

// Lets promises settle and fires virtual timers in order, instantly.
async function settle(ctx) {
  await tick();
  for (let i = 0; i < 500; i++) {
    let fired = false;
    try { fired = vm.runInContext('__fire()', ctx, { timeout: 300 }); }
    catch (e) { return { error: e }; }
    if (!fired) break;
    await tick();
  }
  return {};
}
function describe(e) {
  let name = 'Error', message = '';
  try { name = safeStr(e && e.name, 'Error'); message = safeStr(e && e.message, typeof e === 'string' ? e : 'Unknown error'); } catch (x) {}
  return { name, message, line: lineFrom(e), timedOut: isTimeout(e) };
}

function lineFrom(e) {
  const stack = e && typeof e.stack === 'string' ? e.stack : '';
  const m = /student\\.js:(\\d+)/.exec(stack);
  return m ? Number(m[1]) : undefined;
}
function safeStr(x, fallback) { return typeof x === 'string' ? x.slice(0, 200) : fallback; }
function isTimeout(e) { return !!e && e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT'; }

async function runScript(job, ctx, res) {
  let script;
  try {
    script = new vm.Script(job.code, { filename: 'student.js' });
  } catch (e) {
    res.phase = 'compile';
    res.compileError = { message: safeStr(e && e.message, 'Syntax error'), line: lineFrom(e) };
    return res;
  }
  unhandled = null;
  try {
    script.runInContext(ctx, { timeout: 1000 });
  } catch (e) {
    res.uncaught = describe(e);
  }
  if (!res.uncaught) {
    const s = await settle(ctx);
    if (s.error) res.uncaught = describe(s.error);
    else if (unhandled) res.uncaught = describe(unhandled);
  }
  if (res.uncaught && res.uncaught.timedOut) res.uncaught.message = 'The code ran for more than a second, so it was stopped. Is there a loop that never ends?';
  try {
    const parsed = JSON.parse(vm.runInContext('JSON.stringify({ o: __out, c: __outCut })', ctx, { timeout: 500 }));
    res.output = Array.isArray(parsed.o) ? parsed.o.map(String) : [];
    res.outputCut = parsed.c === true;
  } catch (e) { res.output = []; }
  return res;
}

async function runJob(job) {
  const res = { phase: 'ok', runs: [], events: [], truncated: false };
  const ctx = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false } });
  vm.runInContext(workerData.prelude, ctx);
  vm.runInContext('__setupConsole(' + (job.script === true) + ')', ctx);
  if (job.script) return runScript(job, ctx, res);

  let script;
  try {
    script = new vm.Script(job.code, { filename: 'student.js' });
  } catch (e) {
    res.phase = 'compile';
    res.compileError = { message: safeStr(e && e.message, 'Syntax error'), line: lineFrom(e) };
    return res;
  }
  try {
    script.runInContext(ctx, { timeout: 1000 });
  } catch (e) {
    res.phase = 'load';
    res.loadError = { name: safeStr(e && e.name, 'Error'), message: safeStr(e && e.message, 'Error while loading the code'), timedOut: isTimeout(e) };
    return res;
  }
  let found = false;
  try {
    found = vm.runInContext('typeof ' + job.fn + ' === "function" ? (globalThis.__fn = ' + job.fn + ', true) : false', ctx, { timeout: 200 });
  } catch (e) { found = false; }
  if (found !== true) { res.phase = 'missing'; return res; }

  let timeouts = 0;
  for (const argsJson of job.argsList) {
    if (timeouts >= 2) { res.runs.push({ timedOut: true }); continue; }
    try {
      const raw = vm.runInContext('__runTest(' + JSON.stringify(argsJson) + ')', ctx, { timeout: job.timeoutMs || 700 });
      if (typeof raw !== 'string') throw new Error('bad result');
      let parsed = JSON.parse(raw);
      if (parsed.pending) {
        unhandled = null;
        const s = await settle(ctx);
        if (s.error) throw s.error;
        parsed = JSON.parse(vm.runInContext('__settled()', ctx, { timeout: 300 }));
        if (parsed.pending) parsed = { out: null, mutated: false, error: { name: 'Error', message: 'The promise never settled (nothing resolved or rejected it).' } };
      }
      res.runs.push({
        out: typeof parsed.out === 'string' ? parsed.out : undefined,
        mutated: parsed.mutated === true,
        error: parsed.error ? { name: safeStr(parsed.error.name, 'Error'), message: safeStr(parsed.error.message, '') } : null
      });
    } catch (e) {
      if (isTimeout(e)) { timeouts++; res.runs.push({ timedOut: true }); }
      else res.runs.push({ error: { name: 'Error', message: safeStr(e && e.message, 'Unknown error') } });
    }
  }
  if (job.trace) {
    try {
      const raw = vm.runInContext('JSON.stringify({ e: __events, t: __truncated })', ctx, { timeout: 500 });
      const parsed = JSON.parse(raw);
      res.events = Array.isArray(parsed.e) ? parsed.e : [];
      res.truncated = parsed.t === true;
    } catch (e) { /* no trace available */ }
  }
  return res;
}

(async () => {
  try {
    const results = [];
    for (const job of workerData.jobs) results.push(await runJob(job));
    parentPort.postMessage({ ok: true, results });
  } catch (e) {
    parentPort.postMessage({ ok: false, message: String(e && e.message) });
  }
})();
`;

let active = 0;
const waiting: Array<() => void> = [];
const MAX_WORKERS = 4;

async function acquire() {
  if (active < MAX_WORKERS) {
    active++;
    return;
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
  active++;
}
function release() {
  active--;
  waiting.shift()?.();
}

export async function runJobs(jobs: Job[], totalTimeoutMs = 9000): Promise<JobResult[]> {
  for (const j of jobs) {
    if (!j.script && !isIdentifier(j.fn)) throw new Error('Invalid function name');
  }
  await acquire();
  try {
    return await new Promise<JobResult[]>((resolve) => {
      const empty = (phase: JobResult['phase']): JobResult[] =>
        jobs.map(() => ({ phase, runs: [], events: [], truncated: false }));

      const worker = new Worker(WORKER_SOURCE, {
        eval: true,
        workerData: { jobs, prelude: PRELUDE },
        resourceLimits: { maxOldGenerationSizeMb: 160, maxYoungGenerationSizeMb: 32, stackSizeMb: 4 },
      });
      let settled = false;
      const finish = (r: JobResult[]) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        void worker.terminate();
        resolve(r);
      };
      const timer = setTimeout(() => finish(empty('timeout')), totalTimeoutMs);
      worker.once('message', (m: { ok: boolean; results?: JobResult[] }) =>
        finish(m.ok && m.results ? m.results : empty('internal')),
      );
      worker.once('error', () => finish(empty('internal')));
      worker.once('exit', () => finish(empty('internal')));
    });
  } finally {
    release();
  }
}
