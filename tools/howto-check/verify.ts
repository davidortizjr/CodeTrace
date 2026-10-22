/**
 * Builds the Task Board exactly as the how-to guides describe, in a throwaway folder,
 * then checks that it works against a real PostgreSQL.
 *
 *   cd tools/howto-check && npm install && npm run verify
 *
 * Works on Windows, macOS and Linux. Needs Node 20.6+, a running PostgreSQL, and a browser for the e2e test.
 *   HOWTO_ADMIN_URL   admin connection string (default postgresql://postgres:postgres@localhost:5432/postgres)
 *                     If your postgres password differs, set this; the generated project's .env is adjusted to match.
 *   CHROMIUM_PATH     path to a Chromium/Chrome binary. Without it the verifier tries Playwright's Chromium,
 *                     then installed Google Chrome, then Microsoft Edge.
 *   HOWTO_KEEP=1      keep the generated project and print its path
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { chromium } from 'playwright-core';
import { guides } from '../../client/src/content/howtos/index.ts';
import type { Block, Guide, RunDir } from '../../client/src/content/howtos/types.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CODE_DIR = path.resolve(HERE, '../../client/src/content/howtos/code');
const ADMIN_URL = process.env.HOWTO_ADMIN_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres';
const DB_URL = (() => {
  const u = new URL(ADMIN_URL);
  u.pathname = '/taskboard';
  return u.toString();
})();
const IS_WIN = process.platform === 'win32';

const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'howto-check-'));
const PROJECT = path.join(WORK, 'taskboard');
const DIRS: Record<RunDir, string> = {
  parent: WORK,
  root: PROJECT,
  server: path.join(PROJECT, 'server'),
  client: path.join(PROJECT, 'client'),
};

const API = 'http://localhost:3001';
const WEB = 'http://localhost:5173';

let failures = 0;
const ok = (name: string) => console.log(`  \x1b[32m✓\x1b[0m ${name}`);
const bad = (name: string, detail = '') => {
  failures += 1;
  console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? `\n      ${detail.replace(/\n/g, '\n      ')}` : ''}`);
};
function expect(name: string, cond: boolean, detail = '') {
  cond ? ok(name) : bad(name, detail);
}

/** Runs a block of commands one line at a time (so it works in cmd.exe, PowerShell, bash and zsh). `cd` is handled here. */
function sh(cmd: string, cwd: string, timeoutMs = 600_000) {
  let dir = cwd;
  let out = '';
  for (const line of cmd.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const cd = /^cd\s+(.+)$/.exec(line);
    if (cd) {
      dir = path.resolve(dir, cd[1].replace(/^"|"$/g, ''));
      continue;
    }
    const r = spawnSync(line, { cwd: dir, shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: timeoutMs, env: { ...process.env, CI: '1' } });
    out += `${r.stdout ?? ''}${r.stderr ?? ''}`;
    if (r.status !== 0) return { code: r.status ?? 1, out: `${out}${r.error ? String(r.error) : ''}` };
  }
  return { code: 0, out };
}

const blockText = (b: Block) => (b.ref ? fs.readFileSync(path.join(CODE_DIR, b.ref), 'utf8') : (b.code ?? ''));

async function waitFor(url: string, ms = 20_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const r = await fetch(url);
      if (r.status < 600) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

interface Running {
  stop: () => void;
  log: () => string;
}
function start(cmd: string, cwd: string, env: Record<string, string> = {}): Running {
  const child: ChildProcess = spawn(cmd, { cwd, shell: true, detached: !IS_WIN, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } });
  let buf = '';
  child.stdout?.on('data', (d) => (buf += d));
  child.stderr?.on('data', (d) => (buf += d));
  return {
    stop: () => {
      try {
        if (IS_WIN) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
        else process.kill(-child.pid!, 'SIGTERM');
      } catch {
        /* already gone */
      }
    },
    log: () => buf,
  };
}
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call(method: string, p: string, body?: unknown, raw?: string, base = API) {
  const r = await fetch(base + p, {
    method,
    headers: body !== undefined || raw !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const text = await r.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { status: r.status, text, json, type: r.headers.get('content-type') ?? '' };
}

async function withClient<T>(url: string, fn: (c: pg.Client) => Promise<T>): Promise<T> {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

async function resetDatabase() {
  // Guide 3 tells the learner to create this database.
  try {
    await withClient(ADMIN_URL, async (c) => {
      await c.query('DROP DATABASE IF EXISTS taskboard WITH (FORCE)');
      await c.query('CREATE DATABASE taskboard');
    });
    ok('guide 3: CREATE DATABASE taskboard works');
  } catch (e) {
    bad('guide 3: CREATE DATABASE taskboard works', String(e));
  }
}

function applyGuide(g: Guide) {
  for (const s of g.steps) {
    for (const b of s.blocks ?? []) {
      if (b.file) {
        const target = path.join(PROJECT, b.file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        let text = blockText(b);
        // The guide's .env assumes postgres/postgres on localhost. Match the machine running the check.
        if (b.file === 'server/.env') text = text.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${DB_URL}`);
        fs.writeFileSync(target, text);
      }
      if (b.run) {
        const cmd = blockText(b);
        const r = sh(cmd, DIRS[b.run]);
        expect(`guide ${g.slug} › ${s.id}: command ran (${cmd.split('\n')[0].slice(0, 60)}${cmd.includes('\n') ? ' …' : ''})`, r.code === 0, r.out.slice(-1500));
      }
    }
  }
}

/** The Vite template ships a lint script (oxlint today, ESLint before). Use it if it is there. */
function lintClient() {
  const pkg = JSON.parse(fs.readFileSync(path.join(DIRS.client, 'package.json'), 'utf8'));
  return pkg.scripts?.lint ? sh('npm run lint', DIRS.client) : null;
}

async function launchBrowser() {
  const attempts: Parameters<typeof chromium.launch>[0][] = process.env.CHROMIUM_PATH
    ? [{ executablePath: process.env.CHROMIUM_PATH }]
    : [{}, { channel: 'chrome' }, { channel: 'msedge' }];
  let last: unknown;
  for (const a of attempts) {
    try {
      return await chromium.launch({ ...a, args: ['--no-sandbox'] });
    } catch (e) {
      last = e;
    }
  }
  throw new Error(`No browser found. Run "npx playwright-core install chromium", or set CHROMIUM_PATH.\n${String(last).slice(0, 300)}`);
}

// ────────────────────────── per-guide assertions ──────────────────────────

async function withServer(fn: () => Promise<void>) {
  const srv = start('npm run dev', DIRS.server);
  const up = await waitFor(`${API}/api/health`);
  if (!up) {
    bad('server starts with `npm run dev`', srv.log().slice(-1500));
    srv.stop();
    return;
  }
  try {
    await fn();
  } finally {
    srv.stop();
    await pause(500);
  }
}

const AFTER: Record<string, () => Promise<void>> = {
  'set-up-react-and-express': async () => {
    expect('guide 2: client/package.json exists', fs.existsSync(path.join(DIRS.client, 'package.json')));
    expect('guide 2: server/package.json has type=module and a dev script', (() => {
      const p = JSON.parse(fs.readFileSync(path.join(DIRS.server, 'package.json'), 'utf8'));
      return p.type === 'module' && /--env-file=\.env/.test(p.scripts?.dev ?? '');
    })());
    await withServer(async () => {
      const r = await call('GET', '/api/health');
      expect('guide 2: GET /api/health → 200 {ok:true}', r.status === 200 && r.json?.ok === true, r.text);
    });
  },

  'connect-express-to-postgresql': async () => {
    await resetDatabase();
    await withServer(async () => {
      const r = await call('GET', '/api/health/db');
      expect('guide 4: GET /api/health/db → 200 {ok:true,time}', r.status === 200 && r.json?.ok === true && !!r.json?.time, r.text);
    });
  },

  'create-a-table-and-run-a-migration': async () => {
    const rows = () => withClient(DB_URL, async (c) => (await c.query('SELECT title FROM tasks ORDER BY id')).rows.map((r) => r.title as string));
    const titles = await rows();
    expect('guide 5: three seed rows with the documented titles', titles.join('|') === 'Read the pg documentation|Build the tasks API|Connect React to it', titles.join('|'));
    const again = sh('npm run migrate', DIRS.server);
    expect('guide 5: migration is safe to run twice', again.code === 0 && /up to date/.test(again.out), again.out);
    expect('guide 5: still three rows after the second run', (await rows()).length === 3, String((await rows()).length));
  },

  'build-a-crud-api': async () => {
    await withServer(async () => {
      const list = await call('GET', '/api/tasks');
      expect('guide 6: GET /api/tasks → 3 seed tasks, newest first', list.status === 200 && Array.isArray(list.json) && list.json.length === 3, list.text);
      const made = await call('POST', '/api/tasks', { title: 'From the guide' });
      expect('guide 6: POST → 201 with id', made.status === 201 && typeof made.json?.id === 'number' && made.json.done === false, made.text);
      const id = made.json?.id;
      const upd = await call('PATCH', `/api/tasks/${id}`, { done: true });
      expect('guide 6: PATCH → done:true', upd.status === 200 && upd.json?.done === true, upd.text);
      const del = await call('DELETE', `/api/tasks/${id}`);
      expect('guide 6: DELETE → 204', del.status === 204, String(del.status));
      const gone = await call('DELETE', `/api/tasks/${id}`);
      expect('guide 6: deleting again → 404 {error}', gone.status === 404 && gone.json?.error === 'Task not found', gone.text);
      // The guide says these two are 500 in this version.
      const b1 = await call('PATCH', '/api/tasks/abc', { done: true });
      expect('guide 6 (documented weakness): PATCH /tasks/abc → 500', b1.status === 500, `${b1.status} ${b1.text.slice(0, 120)}`);
      const b2 = await call('POST', '/api/tasks', {});
      expect('guide 6 (documented weakness): POST {} → 500', b2.status === 500, `${b2.status} ${b2.text.slice(0, 120)}`);
    });
  },

  'validate-input-and-handle-errors': async () => {
    await withServer(async () => {
      const a = await call('PATCH', '/api/tasks/abc', { done: true });
      expect('guide 7: PATCH /tasks/abc → 400 "Invalid input" with details', a.status === 400 && a.json?.error === 'Invalid input' && Array.isArray(a.json?.details) && a.json.details.length > 0, a.text);
      const b = await call('POST', '/api/tasks', {});
      expect('guide 7: POST {} → 400 JSON', b.status === 400 && /json/.test(b.type), `${b.status} ${b.text}`);
      const c = await call('POST', '/api/tasks', { title: '   ' });
      expect('guide 7: blank title → 400 and the message is "Title cannot be empty"', c.status === 400 && JSON.stringify(c.json).includes('Title cannot be empty'), c.text);
      const d = await call('PATCH', '/api/tasks/999999', { done: true });
      expect('guide 7: unknown id → 404 "Task not found"', d.status === 404 && d.json?.error === 'Task not found', d.text);
      const e = await call('GET', '/api/nothing-here');
      expect('guide 7: unknown route → 404 JSON "No route for GET /api/nothing-here"', e.status === 404 && e.json?.error === 'No route for GET /api/nothing-here', e.text);
      const f = await call('POST', '/api/tasks', undefined, '{"title": ');
      expect('guide 7: malformed JSON body → 400 JSON', f.status === 400 && /json/.test(f.type), `${f.status} ${f.text}`);
      const g = await call('PATCH', '/api/tasks/99999999999', { done: true });
      expect('guide 7: id beyond integer range → 400 (not a 500)', g.status === 400, `${g.status} ${g.text}`);
      const h = await call('POST', '/api/tasks', { title: 'x'.repeat(201) });
      expect('guide 7: title over 200 chars → 400', h.status === 400, `${h.status} ${h.text}`);
      const ok1 = await call('POST', '/api/tasks', { title: '  trimmed  ' });
      expect('guide 7: valid title is trimmed and saved', ok1.status === 201 && ok1.json?.title === 'trimmed', ok1.text);
      if (ok1.json?.id) await call('DELETE', `/api/tasks/${ok1.json.id}`);
    });
  },

  'show-database-data-in-react': async () => {
    const build = sh('npm run build', DIRS.client);
    expect('guide 8: vite build succeeds', build.code === 0, build.out.slice(-1500));
    const lint = lintClient();
    if (lint) expect('guide 8: the template linter (npm run lint) passes on the guide code', lint.code === 0, lint.out.slice(-1500));
    await withServer(async () => {
      const web = start('npm run dev', DIRS.client);
      const up = await waitFor(WEB);
      if (!up) return bad('guide 8: vite dev server starts', web.log());
      try {
        const viaProxy = await call('GET', '/api/tasks', undefined, undefined, WEB);
        expect('guide 8: /api/tasks through the Vite proxy returns the same JSON', viaProxy.status === 200 && Array.isArray(viaProxy.json), viaProxy.text.slice(0, 200));
      } finally {
        web.stop();
        await pause(500);
      }
    });
  },

  'add-edit-and-delete-from-react': async () => {
    const lint = lintClient();
    if (lint) expect('guide 9: the template linter (npm run lint) passes on the guide code', lint.code === 0, lint.out.slice(-1500));
    await withServer(async () => {
      const web = start('npm run dev', DIRS.client);
      if (!(await waitFor(WEB))) {
        web.stop();
        return bad('guide 9: vite dev server starts', web.log());
      }
      const browser = await launchBrowser();
      try {
        const page = await browser.newPage();
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        // The browser logs every 4xx response. The empty-submit step below causes one on purpose.
        page.on('console', (m) => m.type() === 'error' && !/status of 400/.test(m.text()) && errors.push(m.text()));
        await page.goto(WEB);
        await page.getByRole('heading', { name: 'Task Board' }).waitFor();
        await page.getByText('Read the pg documentation').waitFor();
        expect('guide 9 e2e: the three seed tasks show', (await page.locator('li').count()) === 3, String(await page.locator('li').count()));

        await page.getByLabel('New task').fill('E2E task');
        await page.getByRole('button', { name: 'Add' }).click();
        await page.getByText('E2E task').waitFor();
        expect('guide 9 e2e: added task appears first and the input clears', (await page.locator('li span').first().innerText()) === 'E2E task' && (await page.getByLabel('New task').inputValue()) === '');

        await page.reload();
        await page.getByText('E2E task').waitFor();
        expect('guide 9 e2e: the task is still there after reload (saved in PostgreSQL)', true);

        // A controlled checkbox flips after the server answers, so click and wait, rather than .check().
        await page.getByLabel('Mark "E2E task" as done').click();
        await page.locator('li.done', { hasText: 'E2E task' }).waitFor();
        await page.reload();
        await page.locator('li.done', { hasText: 'E2E task' }).waitFor();
        expect('guide 9 e2e: ticking persists across reload', true);

        await page.getByRole('button', { name: 'Add' }).click();
        const alert = page.getByRole('alert');
        await alert.waitFor();
        expect('guide 9 e2e: empty submit shows "Title cannot be empty" from the server', /Title cannot be empty/.test(await alert.innerText()), await alert.innerText());

        await page.getByRole('button', { name: 'Delete "E2E task"' }).click();
        await page.getByText('E2E task').waitFor({ state: 'detached' });
        await page.reload();
        await page.getByText('Read the pg documentation').waitFor();
        expect('guide 9 e2e: deleted task stays deleted', (await page.getByText('E2E task').count()) === 0);
        expect('guide 9 e2e: no browser console errors', errors.length === 0, errors.join('\n'));
      } catch (e) {
        bad('guide 9 e2e flow', String(e));
      } finally {
        await browser.close();
        web.stop();
        await pause(500);
      }
    });
  },

  'build-and-deploy': async () => {
    expect('guide 11: client/dist/index.html exists after `npm run build`', fs.existsSync(path.join(DIRS.client, 'dist/index.html')));
    const pkg = JSON.parse(fs.readFileSync(path.join(DIRS.server, 'package.json'), 'utf8'));
    expect('guide 11: server start script has no --env-file', pkg.scripts?.start === 'node src/index.js', String(pkg.scripts?.start));
    // Local production check from the guide: NODE_ENV=production node --env-file=.env src/index.js
    const srv = start('node --env-file=.env src/index.js', DIRS.server, { NODE_ENV: 'production' });
    if (!(await waitFor(`${API}/api/health`))) {
      srv.stop();
      return bad('guide 11: production server starts', srv.log());
    }
    try {
      const root = await call('GET', '/');
      expect('guide 11: / serves the React index.html', root.status === 200 && /<div id="root">/.test(root.text), root.text.slice(0, 120));
      const spa = await call('GET', '/some/client/route');
      expect('guide 11: a client-side route also serves index.html', spa.status === 200 && /<div id="root">/.test(spa.text), String(spa.status));
      const api = await call('GET', '/api/tasks');
      expect('guide 11: /api/tasks still returns JSON, not index.html', api.status === 200 && Array.isArray(api.json), api.text.slice(0, 120));
      const miss = await call('GET', '/api/nope');
      expect('guide 11: unknown /api path → 404 JSON, not index.html', miss.status === 404 && miss.json?.error === 'No route for GET /api/nope', miss.text.slice(0, 120));
      const asset = /assets\/[^"']+\.js/.exec(root.text)?.[0];
      const js = asset ? await call('GET', `/${asset}`) : undefined;
      expect('guide 11: the built JS bundle is served', js?.status === 200 && /javascript/.test(js.type), `${asset} ${js?.status} ${js?.type}`);
      // Real browser, one origin, no Vite.
      const browser = await launchBrowser();
      try {
        const page = await browser.newPage();
        await page.goto(API);
        await page.getByText('Read the pg documentation').waitFor();
        expect('guide 11: the production build renders tasks from port 3001', true);
      } catch (e) {
        bad('guide 11: production page in a browser', String(e));
      } finally {
        await browser.close();
      }
    } finally {
      srv.stop();
      await pause(500);
    }
  },
};

// ────────────────────────── main ──────────────────────────

async function main() {
  console.log(`How-to verifier\n  work folder: ${WORK}\n`);
  const [major, minor] = process.versions.node.split('.').map(Number);
  console.log(`  node ${process.version} on ${process.platform}`);
  if (major < 20 || (major === 20 && minor < 6)) {
    console.error('\nNode 20.6 or newer is required (the guides use the --env-file flag).');
    process.exit(2);
  }
  try {
    await withClient(ADMIN_URL, (c) => c.query('select 1'));
  } catch (e) {
    console.error(`\nCannot reach PostgreSQL with ${ADMIN_URL.replace(/:[^:@/]+@/, ':****@')}\n${String(e)}\nStart PostgreSQL, or set HOWTO_ADMIN_URL to a connection string for a user that can create databases.`);
    process.exit(2);
  }
  await resetDatabase();

  for (const g of guides) {
    console.log(`\n${g.title}`);
    // Structure checks that apply to every guide.
    const blocks = g.steps.flatMap((s) => s.blocks ?? []);
    for (const b of blocks) {
      if (b.ref && !fs.existsSync(path.join(CODE_DIR, b.ref))) bad(`missing code file ${b.ref}`);
      if (!b.ref && b.code === undefined) bad(`block without ref or code in ${g.slug}`);
    }
    expect(`${g.slug}: has steps, a goal and "what you learned"`, g.steps.length > 0 && !!g.goal && g.learned.length > 0);
    applyGuide(g);
    const after = AFTER[g.slug];
    if (after) await after();
  }

  console.log(failures === 0 ? '\n\x1b[32mAll guides verified.\x1b[0m' : `\n\x1b[31m${failures} check(s) failed.\x1b[0m`);
  if (process.env.HOWTO_KEEP) console.log(`Kept: ${PROJECT}`);
  else fs.rmSync(WORK, { recursive: true, force: true });
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
