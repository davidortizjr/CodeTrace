import { fmtArgs, fmtEncoded } from './display.js';
import { ERROR_TYPES, type ErrorCategory, type ErrorTypeId } from './errors.js';
import { instrument } from './instrument.js';
import { runJobs, type Job, type JobResult, type RunOutcome, type TraceEvent } from './sandbox.js';
import { staticFindings } from './static-rules.js';
import { classifyTsCode, findForbidden, stripTypes, typecheck, type TsDiagnostic } from './typescript.js';
import type { Problem, TestCategory } from '../problems/types.js';

/**
 * The deterministic checker. Every verdict, test result, error type and
 * "first step that went wrong" comes from here. The AI layer only ever
 * receives what this module decided.
 */

export interface TestOutcome {
  id: number;
  cat: TestCategory;
  args: string;
  expected: string;
  got: string;
  pass: boolean;
  note?: string;
}

export interface Mistake {
  type: ErrorTypeId;
  label: string;
  category: ErrorCategory;
  /** exact: matches a known wrong approach test-for-test. likely: nearly. heuristic: a source pattern. generic: from how it failed. */
  confidence: 'exact' | 'likely' | 'heuristic' | 'generic' | 'compiler';
  why: string;
  fix: string;
  ask: string[];
  line?: number;
  detail?: string;
}

export interface Divergence {
  variable: string;
  expectedVariable: string;
  step: number;
  line: number;
  expected: string | null;
  got: string | null;
  expectedSeq: string[];
  gotSeq: string[];
  summary: string;
}

export interface TraceRow {
  step: number;
  line: number;
  kind: string;
  vars: Record<string, string>;
  flag?: boolean;
}

export interface TypeErrorOut {
  line: number;
  col: number;
  code: number;
  message: string;
}

export interface AnalysisResult {
  /** run: tests call the function. types: the compiler checks the types. */
  kind: 'run' | 'types';
  verdict: 'correct' | 'incorrect' | 'error';
  passed: number;
  total: number;
  tests: TestOutcome[];
  error?: { kind: 'syntax' | 'runtime' | 'timeout' | 'missing-function' | 'internal'; message: string; line?: number };
  mistake?: Mistake;
  divergence?: Divergence;
  trace?: { columns: string[]; rows: TraceRow[]; omittedBefore: number; truncated: boolean };
  /** TypeScript problems: errors the compiler reported in the student's own code. */
  typeErrors?: TypeErrorOut[];
  /** True when the checker itself failed; the attempt is not recorded. */
  internal?: boolean;
}

interface Change {
  value: string;
  step: number;
  line: number;
}

interface ProblemCache {
  /** Encoded expected output per test (run mode). Empty in types mode. */
  expected: string[];
  refChanges: Record<string, Change[]>;
  variantSigs: { id: string; sigs: string[] }[];
}

const caches = new Map<string, Promise<ProblemCache>>();

export function sig(run: RunOutcome): string {
  if (run.timedOut) return 'TIMEOUT';
  if (run.error) return 'ERR:' + run.error.name;
  return (run.out ?? 'none') + (run.mutated ? '|M' : '');
}

const isTs = (problem: Problem) => problem.lang === 'ts';

/** TypeScript becomes JavaScript before it runs. Line numbers are kept. */
function toJs(problem: Problem, code: string): string {
  if (!isTs(problem)) return code;
  const r = stripTypes(code);
  return r.ok ? r.code : code;
}

function testJob(code: string, problem: Problem): Job {
  return { code: toJs(problem, code), fn: problem.fn, argsList: problem.tests.map((t) => JSON.stringify(t.args)) };
}

/** Compact fingerprint of a program's type errors, so a known wrong typing can be recognised. */
const typeSig = (diags: { code: number }[]) => 'TYPE:' + (diags.length ? [...new Set(diags.map((d) => d.code))].sort().join(',') : 'ok');

function computeChanges(events: TraceEvent[], names: string[]): Record<string, Change[]> {
  const out: Record<string, Change[]> = {};
  const last: Record<string, string | undefined> = {};
  for (const n of names) out[n] = [];
  for (const ev of events) {
    for (const n of names) {
      const val = ev.vars?.[n];
      if (val === undefined) continue;
      if (last[n] !== val) {
        out[n].push({ value: val, step: ev.step, line: ev.line });
        last[n] = val;
      }
    }
  }
  return out;
}

export function getCache(problem: Problem): Promise<ProblemCache> {
  let p = caches.get(problem.id);
  if (!p) {
    p = buildCache(problem);
    caches.set(problem.id, p);
    p.catch(() => caches.delete(problem.id));
  }
  return p;
}

async function buildCache(problem: Problem): Promise<ProblemCache> {
  if (problem.mode === 'types') return buildTypesCache(problem);
  const jobs: Job[] = [testJob(problem.reference, problem)];
  let traceIndex = -1;
  if (problem.track.length > 0) {
    const inst = instrument(toJs(problem, problem.reference), problem.fn, problem.track);
    if (inst.ok) {
      traceIndex = jobs.length;
      jobs.push({ code: inst.code, fn: problem.fn, argsList: [JSON.stringify(problem.traceArgs)], trace: true });
    }
  }
  const variantStart = jobs.length;
  for (const v of problem.variants) jobs.push(testJob(v.code, problem));

  const results = await runJobs(jobs, 20000);
  const ref = results[0];
  if (ref.phase !== 'ok' || ref.runs.some((r) => r.error || r.timedOut || r.out === undefined)) {
    throw new Error(`Reference solution for ${problem.id} did not run cleanly`);
  }
  return {
    expected: ref.runs.map((r) => r.out as string),
    refChanges: traceIndex >= 0 ? computeChanges(results[traceIndex].events, problem.track) : {},
    variantSigs: problem.variants.map((v, i) => ({
      id: v.id,
      sigs: [...results[variantStart + i].runs.map(sig), ...(isTs(problem) ? [typeSig(typecheck(v.code).diagnostics)] : [])],
    })),
  };
}

// ── Types mode: the TypeScript compiler is the test ──────────────────────────

interface TypeRunResult {
  /** The first parse error, if the student's code is not valid TypeScript. */
  syntax?: TsDiagnostic;
  /** Errors inside the student's own code. */
  studentErrors: TsDiagnostic[];
  /** One entry per hidden check. */
  checks: { pass: boolean; diag?: TsDiagnostic }[];
}

function runTypeChecks(problem: Problem, code: string): TypeRunResult {
  const checks = problem.typeChecks ?? [];
  const student = code.replace(/\r\n/g, '\n').replace(/\s+$/, '');
  let text = student + '\n';
  let line = text.split('\n').length;
  const firstCheckLine = line;
  const ranges: [number, number][] = [];
  for (const c of checks) {
    const body = `{\n${c.code.trim()}\n}\n`;
    const n = body.split('\n').length - 1;
    ranges.push([line, line + n - 1]);
    text += body;
    line += n;
  }
  const { diagnostics } = typecheck(text);
  const syntax = diagnostics.find((d) => d.syntactic);
  const studentErrors = diagnostics.filter((d) => d.line < firstCheckLine);
  return {
    syntax,
    studentErrors,
    checks: ranges.map(([from, to]) => {
      const diag = diagnostics.find((d) => d.line >= from && d.line <= to);
      return { pass: !diag, diag };
    }),
  };
}

const typesSig = (r: TypeRunResult): string[] => [
  ...r.checks.map((c) => (c.pass ? 'ok' : 'FAIL:' + c.diag!.code)),
  typeSig(r.studentErrors),
];

async function buildTypesCache(problem: Problem): Promise<ProblemCache> {
  const ref = runTypeChecks(problem, problem.reference);
  if (ref.syntax || ref.studentErrors.length > 0 || ref.checks.some((c) => !c.pass)) {
    const why = ref.syntax ?? ref.studentErrors[0] ?? ref.checks.find((c) => !c.pass)?.diag;
    throw new Error(`Reference solution for ${problem.id} does not satisfy its own checks: ${why ? `line ${why.line}: ${why.message}` : ''}`);
  }
  return {
    expected: [],
    refChanges: {},
    variantSigs: problem.variants.map((v) => ({ id: v.id, sigs: typesSig(runTypeChecks(problem, v.code)) })),
  };
}

function runNote(run: RunOutcome): string | undefined {
  if (run.timedOut) return 'Took too long (more than about a second).';
  if (run.error) return `${run.error.name}: ${run.error.message}`;
  if (run.mutated) return 'The input array or object was changed by your function.';
  return undefined;
}

function mistakeOf(
  type: ErrorTypeId,
  confidence: Mistake['confidence'],
  extra: Partial<Pick<Mistake, 'why' | 'fix' | 'ask' | 'line' | 'detail'>> = {},
): Mistake {
  const base = ERROR_TYPES[type];
  return {
    type,
    label: base.label,
    category: base.category,
    confidence,
    why: extra.why ?? base.why,
    fix: extra.fix ?? base.fix,
    ask: extra.ask ?? base.ask,
    line: extra.line,
    detail: extra.detail,
  };
}

function findDivergence(
  refChanges: Record<string, Change[]>,
  studentChanges: Record<string, Change[]>,
  track: string[],
): Divergence | undefined {
  type Cand = { rv: string; sv: string; R: Change[]; S: Change[]; p: number; at: number; byShape: boolean };
  const cands: Cand[] = [];

  for (const rv of track) {
    const R = refChanges[rv];
    if (!R || R.length === 0) continue;
    let best: { sv: string; S: Change[]; p: number; score: number } | null = null;
    for (const [sv, S] of Object.entries(studentChanges)) {
      if (S.length === 0) continue;
      let p = 0;
      while (p < R.length && p < S.length && R[p].value === S[p].value) p++;
      const score = p + (sv === rv ? 0.5 : 0) - Math.abs(R.length - S.length) * 0.01;
      if (!best || score > best.score) best = { sv, S, p, score };
    }
    if (!best) continue;
    let aligned = best.p >= 2 || best.sv === rv || (R.length <= 2 && best.p >= 1);
    let byShape = false;
    if (!aligned) {
      // No variable shares a history with the reference. If exactly one student
      // variable is updated the same number of times, treat it as the same role.
      const sameLength = Object.entries(studentChanges).filter(([, S]) => S.length === R.length);
      if (R.length >= 3 && sameLength.length === 1) {
        const [sv, S] = sameLength[0];
        best = { sv, S, p: 0, score: 0 };
        aligned = true;
        byShape = true;
      }
    }
    if (!aligned) continue;
    if (best.p === R.length && best.p === best.S.length) continue; // identical history
    const at = best.S[best.p] ?? best.S[best.S.length - 1];
    cands.push({ rv, sv: best.sv, R, S: best.S, p: best.p, at: at.step, byShape });
  }
  if (cands.length === 0) return undefined;
  cands.sort((a, b) => a.at - b.at);
  const c = cands[0];

  const exp = c.R[c.p];
  const got = c.S[c.p];
  const anchor = got ?? c.S[c.S.length - 1];
  const seq = (list: Change[]) => list.slice(0, 8).map((x) => fmtEncoded(x.value, 40));
  const f = (x?: Change) => (x ? fmtEncoded(x.value, 60) : null);
  const name = c.sv;
  const who = c.byShape ? `\`${name}\` (the variable that plays the role of \`${c.rv}\`)` : `\`${name}\``;

  let summary: string;
  if (exp && got) {
    summary = `On the trace input, ${who} first goes wrong on line ${anchor.line}: it becomes ${f(got)} where a correct run has ${f(exp)}.`;
  } else if (exp && !got) {
    summary = `On the trace input, ${who} stops changing at ${f(anchor)} on line ${anchor.line}. A correct run goes on to ${f(exp)}.`;
  } else {
    summary = `On the trace input, ${who} keeps changing past the point where a correct run stops, to ${f(got)} on line ${anchor.line}.`;
  }

  return {
    variable: name,
    expectedVariable: c.rv,
    step: anchor.step,
    line: anchor.line,
    expected: f(exp),
    got: f(got),
    expectedSeq: seq(c.R),
    gotSeq: seq(c.S),
    summary,
  };
}

function buildTrace(
  events: TraceEvent[],
  truncated: boolean,
  changes: Record<string, Change[]>,
  div: Divergence | undefined,
) {
  const ranked = Object.entries(changes)
    .filter(([, c]) => c.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([n]) => n);
  const columns: string[] = [];
  if (div) columns.push(div.variable);
  for (const n of ranked) if (!columns.includes(n) && columns.length < 5) columns.push(n);

  const start = div ? Math.max(0, div.step - 24) : 0;
  const slice = events.slice(start, start + 48);
  const rows: TraceRow[] = slice.map((ev) => ({
    step: ev.step,
    line: ev.line,
    kind: ev.kind,
    vars: Object.fromEntries(
      columns.map((c) => [c, ev.vars?.[c] === undefined ? '—' : fmtEncoded(ev.vars[c], 48)]),
    ),
    flag: div ? ev.step === div.step : false,
  }));
  return { columns, rows, omittedBefore: start, truncated: truncated || events.length > start + 48 };
}

const toOut = (d: TsDiagnostic): TypeErrorOut => ({ line: d.line, col: d.col, code: d.code, message: d.message });

/** The mistake to report when TypeScript, not the tests, found the problem. */
function typeProblemMistake(
  problem: Problem,
  cache: ProblemCache,
  sigs: string[],
  diag: TsDiagnostic | undefined,
  forbidden: { line: number; what: string }[],
  detailPrefix?: string,
  line?: number,
): Mistake {
  for (const vs of cache.variantSigs) {
    if (vs.sigs.length === sigs.length && vs.sigs.every((x, i) => x === sigs[i])) {
      const variant = problem.variants.find((v) => v.id === vs.id)!;
      return mistakeOf(variant.type, 'exact', { why: variant.why, fix: variant.fix, ask: variant.ask, detail: variant.label, line });
    }
  }
  if (forbidden.length > 0) {
    const f = forbidden[0];
    return mistakeOf('ts-any', 'exact', { line: f.line, detail: `Line ${f.line} uses ${f.what}.` });
  }
  if (diag) {
    const text = `TS${diag.code}: ${diag.message}`;
    return mistakeOf(classifyTsCode(diag.code), 'compiler', {
      line,
      detail: detailPrefix ? `${detailPrefix} ${text}` : text,
    });
  }
  return mistakeOf('ts-other', 'compiler');
}

async function analyzeTypes(problem: Problem, code: string): Promise<AnalysisResult> {
  const cache = await getCache(problem);
  const checks = problem.typeChecks ?? [];
  const total = checks.length;
  const run = runTypeChecks(problem, code);

  if (run.syntax) {
    return {
      kind: 'types',
      verdict: 'error',
      passed: 0,
      total,
      tests: [],
      error: { kind: 'syntax', message: run.syntax.message, line: run.syntax.line },
      mistake: mistakeOf('syntax', 'compiler', { line: run.syntax.line, detail: run.syntax.message }),
    };
  }

  const tests: TestOutcome[] = checks.map((c, i) => {
    const r = run.checks[i];
    return {
      id: i + 1,
      cat: c.cat,
      args: c.label,
      expected: 'TypeScript accepts this',
      got: r.pass ? 'accepted' : r.diag!.code === 2578 ? 'The compiler accepted this, but it should be rejected' : `TS${r.diag!.code}: ${r.diag!.message}`,
      pass: r.pass,
    };
  });
  const passed = tests.filter((t) => t.pass).length;
  const forbidden = problem.allowAny ? [] : findForbidden(code);
  const typeErrors = run.studentErrors.map(toOut);

  if (passed === total && typeErrors.length === 0 && forbidden.length === 0) {
    return { kind: 'types', verdict: 'correct', passed, total, tests };
  }

  const failingCheck = run.checks.findIndex((c) => !c.pass);
  const own = run.studentErrors[0];
  const mistake = own
    ? typeProblemMistake(problem, cache, typesSig(run), own, forbidden, undefined, own.line)
    : typeProblemMistake(problem, cache, typesSig(run), run.checks[failingCheck]?.diag, forbidden, failingCheck >= 0 ? `Check "${checks[failingCheck].label}" failed.` : undefined);
  return { kind: 'types', verdict: 'incorrect', passed, total, tests, mistake, typeErrors: typeErrors.length ? typeErrors : undefined };
}

export async function analyze(problem: Problem, code: string): Promise<AnalysisResult> {
  if (problem.mode === 'types') return analyzeTypes(problem, code);
  const r = await analyzeRun(problem, code);
  return { ...r, kind: 'run' };
}

async function analyzeRun(problem: Problem, code: string): Promise<Omit<AnalysisResult, 'kind'>> {
  const cache = await getCache(problem);
  const total = problem.tests.length;
  const none = { passed: 0, total, tests: [] as TestOutcome[] };

  // TypeScript: the compiler speaks first, then the types are removed so the code can run.
  let js = code;
  let typeDiags: TsDiagnostic[] = [];
  let forbidden: { line: number; what: string }[] = [];
  if (isTs(problem)) {
    const tc = typecheck(code);
    const syn = tc.diagnostics.find((d) => d.syntactic);
    if (syn) {
      return {
        verdict: 'error',
        ...none,
        error: { kind: 'syntax', message: syn.message, line: syn.line },
        mistake: mistakeOf('syntax', 'compiler', { line: syn.line, detail: syn.message }),
      };
    }
    typeDiags = tc.diagnostics;
    if (!problem.allowAny) forbidden = findForbidden(code);
    const st = stripTypes(code);
    if (!st.ok) {
      return {
        verdict: 'error',
        ...none,
        error: { kind: 'syntax', message: st.message },
        mistake: mistakeOf('syntax', 'generic', { detail: st.message }),
      };
    }
    js = st.code;
  }
  const typeExtra = typeDiags.length ? { typeErrors: typeDiags.map(toOut) } : {};

  const jobs: Job[] = [{ code: js, fn: problem.fn, argsList: problem.tests.map((t) => JSON.stringify(t.args)) }];
  const inst = instrument(js, problem.fn, 'auto');
  if (inst.ok && inst.vars.length > 0) {
    jobs.push({ code: inst.code, fn: problem.fn, argsList: [JSON.stringify(problem.traceArgs)], trace: true });
  }
  const results: JobResult[] = await runJobs(jobs);
  const main = results[0];
  const traceRes = results[1];

  if (main.phase === 'internal') {
    return {
      verdict: 'error',
      ...none,
      internal: true,
      error: { kind: 'internal', message: 'The checker had a problem running your code. Try again in a moment.' },
    };
  }
  if (main.phase === 'compile') {
    const line = main.compileError?.line;
    return {
      verdict: 'error',
      ...none,
      ...typeExtra,
      error: { kind: 'syntax', message: main.compileError?.message ?? 'Syntax error', line },
      mistake: mistakeOf('syntax', 'exact', { line, detail: main.compileError?.message }),
    };
  }
  if (main.phase === 'load') {
    const e = main.loadError!;
    return {
      verdict: 'error',
      ...none,
      ...typeExtra,
      error: { kind: e.timedOut ? 'timeout' : 'runtime', message: e.timedOut ? 'The code ran forever before any test started.' : `${e.name}: ${e.message}` },
      mistake: mistakeOf(e.timedOut ? 'timeout' : 'runtime', 'generic', { detail: `${e.name}: ${e.message}` }),
    };
  }
  if (main.phase === 'missing') {
    return {
      verdict: 'error',
      ...none,
      ...typeExtra,
      error: { kind: 'missing-function', message: `No function named ${problem.fn} was found.` },
      mistake: mistakeOf('missing-function', 'exact', { detail: `Expected a function called ${problem.fn}.` }),
    };
  }

  const runs: RunOutcome[] =
    main.phase === 'timeout' ? problem.tests.map(() => ({ timedOut: true })) : main.runs;

  const tests: TestOutcome[] = problem.tests.map((t, i) => {
    const run = runs[i] ?? { timedOut: true };
    const pass = !run.timedOut && !run.error && !run.mutated && run.out === cache.expected[i];
    return {
      id: i + 1,
      cat: t.cat,
      args: fmtArgs(t.args),
      expected: fmtEncoded(cache.expected[i]),
      got: run.timedOut ? 'no result' : run.error ? 'error' : fmtEncoded(run.out),
      pass,
      note: runNote(run),
    };
  });
  const passed = tests.filter((t) => t.pass).length;
  const sigs = runs.map(sig);
  if (isTs(problem)) sigs.push(typeSig(typeDiags));

  if (passed === total) {
    if (typeDiags.length === 0 && forbidden.length === 0) {
      return { verdict: 'correct', passed, total, tests };
    }
    // Every test passes, but TypeScript is not happy with the types.
    const diag = typeDiags[0];
    return {
      verdict: 'incorrect',
      passed,
      total,
      tests,
      ...typeExtra,
      mistake: typeProblemMistake(problem, cache, sigs, diag, forbidden, undefined, diag?.line),
    };
  }

  // ── Classify the failure ────────────────────────────────────────────────
  const failing = tests.filter((t) => !t.pass).map((t) => t.id - 1);
  let mistake: Mistake | undefined;

  // 1. Same behaviour, test for test, as a known wrong approach.
  for (const vs of cache.variantSigs) {
    if (vs.sigs.length === sigs.length && vs.sigs.every((s, i) => s === sigs[i])) {
      const variant = problem.variants.find((v) => v.id === vs.id)!;
      mistake = mistakeOf(variant.type, 'exact', {
        why: variant.why,
        fix: variant.fix,
        ask: variant.ask,
        detail: variant.label,
      });
      break;
    }
  }
  // 2. Nearly the same behaviour.
  if (!mistake) {
    let best: { id: string; score: number } | null = null;
    for (const vs of cache.variantSigs) {
      const sameOnFailing = failing.filter((i) => vs.sigs[i] === sigs[i]).length / failing.length;
      const sameOverall = sigs.filter((s, i) => vs.sigs[i] === s).length / sigs.length;
      if (sameOnFailing >= 0.8 && sameOverall >= 0.75) {
        const score = sameOnFailing + sameOverall;
        if (!best || score > best.score) best = { id: vs.id, score };
      }
    }
    if (best) {
      const variant = problem.variants.find((v) => v.id === best!.id)!;
      mistake = mistakeOf(variant.type, 'likely', {
        why: variant.why,
        fix: variant.fix,
        ask: variant.ask,
        detail: variant.label,
      });
    }
  }
  // 3. A run that never finishes is hard evidence, whatever the source looks like.
  if (!mistake && runs.some((r) => r.timedOut)) {
    mistake = mistakeOf('timeout', 'generic');
  }
  // 4. A pattern in the source.
  if (!mistake) {
    const finding = staticFindings(js, problem.fn)[0];
    if (finding) {
      mistake = mistakeOf(finding.type, 'heuristic', { line: finding.line, detail: finding.note });
    }
  }
  // 5. How it failed.
  if (!mistake) {
    const errRun = runs.find((r) => r.error);
    const firstFail = tests.find((t) => !t.pass)!;
    if (errRun?.error) {
      const stack = /call stack/i.test(errRun.error.message);
      mistake = mistakeOf(stack ? 'base-case' : 'runtime', 'generic', {
        detail: `${errRun.error.name}: ${errRun.error.message}`,
      });
    } else if (runs.every((r) => r.out === '{"$":"undefined"}')) {
      mistake = mistakeOf('no-return', 'generic');
    } else if (runs.some((r) => r.mutated)) {
      mistake = mistakeOf('mutation', 'generic');
    } else if (failing.every((i) => problem.tests[i].cat === 'edge')) {
      mistake = mistakeOf('edge-case', 'generic', {
        detail: `Typical inputs pass. Failing: ${firstFail.args}`,
      });
    } else {
      mistake = mistakeOf('logic', 'generic', { detail: `Smallest failing input: ${firstFail.args}` });
    }
  }

  // ── Where did the student's run first leave the expected path? ──────────
  let divergence: Divergence | undefined;
  let trace: AnalysisResult['trace'];
  if (traceRes && traceRes.phase === 'ok' && traceRes.events.length > 0) {
    const studentChanges = computeChanges(traceRes.events, inst.vars);
    if (problem.track.length > 0) {
      divergence = findDivergence(cache.refChanges, studentChanges, problem.track);
    }
    trace = buildTrace(traceRes.events, traceRes.truncated, studentChanges, divergence);
    if (divergence && !mistake.line) mistake.line = divergence.line;
  }

  return {
    verdict: 'incorrect',
    passed,
    total,
    tests,
    mistake,
    divergence,
    trace,
    ...typeExtra,
  };
}
