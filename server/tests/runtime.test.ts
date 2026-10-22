import util from 'node:util';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { runSnippet } from '../src/course/run.js';
import { findForbidden, stripTypes, typecheck } from '../src/engine/typescript.js';

/** What real Node prints for the same code. The sandbox's console must match it. */
function nodeLines(code: string): string[] {
  const lines: string[] = [];
  const ctx = vm.createContext({ console: { log: (...a: unknown[]) => lines.push(util.format(...a)) }, setTimeout: undefined });
  vm.runInContext(code, ctx);
  return lines;
}

describe('sandbox console matches Node', () => {
  const cases: Record<string, string> = {
    primitives: `console.log(1, 'two', true, null, undefined, 10n, -0, NaN, Symbol('s'));`,
    strings: `console.log(['a', "it's", 'say "hi"', 'new\\nline', "both ' and \\""]);`,
    'small object': `console.log({ a: 1, b: 'x', c: [1, 2, 3], 'needs-quotes': true });`,
    nested: `console.log({ a: { b: { c: { d: 1 } } }, list: [[1, [2, [3, [4]]]]] });`,
    'long object wraps': `console.log({ name: 'Ada Lovelace', email: 'ada@example.com', roles: ['admin', 'editor', 'viewer'], active: true });`,
    'short array of numbers': `console.log([1, 2, 3, 4, 5, 6]);`,
    'array over six groups': `console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);`,
    'array of words over six': `console.log(['apple', 'banana', 'cherry', 'date', 'elder', 'fig', 'grape', 'honeydew']);`,
    'array of 30': `console.log(Array.from({ length: 30 }, (_, i) => i * 3));`,
    'array of 120': `console.log(Array.from({ length: 120 }, (_, i) => i));`,
    'array of objects': `console.log([{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }]);`,
    sparse: `console.log([1, , , 4]);`,
    empty: `console.log([], {}, new Map(), new Set(), '');`,
    map: `console.log(new Map([['a', 1], ['b', { x: 1 }]]));`,
    set: `console.log(new Set([1, 'two', [3]]));`,
    functions: `function foo() {}\nclass A {}\nclass B extends A {}\nconsole.log(foo, () => 1, A, B, async function bar() {}, function* gen() {}, class {});`,
    'function with props': `function f() {}\nf.x = 1;\nconsole.log(f);`,
    'class instance': `class Point { constructor(x, y) { this.x = x; this.y = y; } }\nconsole.log(new Point(1, 2), [new Point(3, 4)]);`,
    'null prototype': `console.log(Object.create(null));`,
    date: `console.log(new Date(0), [new Date(86400000)]);`,
    regexp: `console.log(/ab+c/gi, [/x/]);`,
    getters: `console.log({ get a() { return 1; }, set b(v) {}, get c() { return 1; }, set c(v) {} });`,
    symbols: `console.log({ [Symbol('k')]: 1, a: 2 });`,
    circular: `const a = { name: 'a' }; a.self = a; console.log(a);`,
    boxed: `console.log(new Number(3), new String('s'), new Boolean(false));`,
    'format specifiers': `console.log('%s is %d years and %i, %f, %j %O %%', 'Ann', 30.5, 7.9, '1.5', { a: 1 }, [1]);`,
    'extra args': `console.log('value:', 42, { a: 1 }, ['x']);`,
    'string first then object': `console.log('user', { id: 1, tags: ['a', 'b'] });`,
    'negative numbers in array': `console.log([-1, 20, -300, 4000, 5, 6, 7]);`,
    'mixed array over six': `console.log([1, 'a', true, null, undefined, 2, 'b']);`,
    'long strings in array': `console.log(['this is a fairly long string number one', 'this is a fairly long string number two']);`,
    'nested arrays of numbers': `console.log([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);`,
    'object with array over six': `console.log({ values: [1, 2, 3, 4, 5, 6, 7, 8] });`,
    'object in array in object': `console.log({ users: [{ name: 'a', tags: ['x', 'y'] }, { name: 'b', tags: [] }] });`,
    'array extra props': `const a = [1, 2]; a.extra = 'x'; console.log(a);`,
    'unicode and escapes': `console.log(['é', '😀', 'tab\\t', 'back\\\\slash']);`,
  };
  for (const [name, code] of Object.entries(cases)) {
    it(name, async () => {
      const res = await runSnippet('js', code);
      expect(res.error).toBeUndefined();
      expect(res.output).toEqual(nodeLines(code));
    });
  }
});

describe('runSnippet', () => {
  it('reports the line and message of an uncaught error', async () => {
    const r = await runSnippet('js', `console.log('before');\nconst x = 1;\nx = 2;\n`);
    expect(r.output).toEqual(['before']);
    expect(r.error?.name).toBe('TypeError');
    expect(r.error?.message).toContain('constant');
    expect(r.error?.line).toBe(3);
  });

  it('reports a syntax error with its line', async () => {
    const r = await runSnippet('js', `let a = 1;\nlet b = ;\n`);
    expect(r.syntaxError?.line).toBe(2);
  });

  it('stops an infinite loop', async () => {
    const r = await runSnippet('js', `while (true) {}`);
    expect(r.error?.timedOut).toBe(true);
  });

  it('settles promises and timers in time order, instantly', async () => {
    const code = `
      const wait = (ms, v) => new Promise((res) => setTimeout(() => res(v), ms));
      async function main() {
        console.log('start');
        const [a, b] = await Promise.all([wait(300, 'slow'), wait(100, 'fast')]);
        console.log(a, b);
        setTimeout(() => console.log('late'), 1000);
        setTimeout(() => console.log('early'), 10);
      }
      main().then(() => console.log('done'));
      console.log('sync end');
    `;
    const r = await runSnippet('js', code);
    expect(r.output).toEqual(['start', 'sync end', 'slow fast', 'done', 'early', 'late']);
  });

  it('turns an unhandled rejection into the run error', async () => {
    const r = await runSnippet('js', `Promise.reject(new Error('nope'));`);
    expect(r.error?.message).toContain('nope');
  });

  it('runs TypeScript with its types removed and reports type errors without blocking the run', async () => {
    const r = await runSnippet('ts', `const n: number = 'five';\nconsole.log(typeof n);\n`);
    expect(r.output).toEqual(['string']);
    expect(r.diagnostics.map((d) => d.code)).toEqual([2322]);
    expect(r.diagnostics[0].line).toBe(1);
  });

  it('keeps line numbers when types are stripped', async () => {
    const code = `interface A {\n  x: number;\n}\ntype B = string;\nfunction f(a: A): B {\n  throw new Error('boom');\n}\nf({ x: 1 });\n`;
    const r = await runSnippet('ts', code);
    expect(r.error?.line).toBe(6);
  });

  it('does not expose host objects or the filesystem', async () => {
    const r = await runSnippet('js', `console.log(typeof process, typeof require, typeof globalThis.constructor.constructor('return typeof process')());`);
    expect(r.error?.message ?? '').toMatch(/code generation|EvalError|disallowed/i);
  });
});

describe('typescript helpers', () => {
  it('finds any and ts-ignore', () => {
    const f = findForbidden('let a: any = 1;\n// @ts-ignore\nconst b = a as any;\n');
    expect(f.map((x) => x.line)).toEqual([1, 2, 3]);
  });
  it('keeps enum line numbers', () => {
    const r = stripTypes('enum Color {\n  Red,\n  Green,\n}\nconsole.log(Color.Green);\n');
    expect(r.ok && r.code.split('\n').findIndex((l) => l.includes('console.log'))).toBe(4);
  });
  it('type-checks in strict mode', () => {
    expect(typecheck('function f(x) { return x; }').diagnostics.map((d) => d.code)).toEqual([7006]);
    expect(typecheck('let s: string | undefined; s.length;').diagnostics.map((d) => d.code)).toEqual([18048]);
  });
});
