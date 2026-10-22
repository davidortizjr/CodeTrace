import type { QuizItem } from '../types.js';
import { mcq, OUT, short, ts } from './quiz-helpers.js';

const U = 'ts-real';

export const U8_EXAM: QuizItem[] = [
  mcq(`${U}.e1`, 'ts-tsconfig', 'With `strict` on, which line reports an error?', ['Line 1', 'Line 2', 'No error, the type is worked out from the body'], 0,
    'The parameter `n` has no annotation and nothing to infer it from, so `noImplicitAny` reports it on line 1.',
    ts(`function double(n) {\n  return n * 2;\n}`), { kind: 'ts-error', line: 1, code: 7006 }),
  short(`${U}.e2`, 'ts-tsconfig', 'Type what this prints.', ['no score'],
    'Index 2 does not exist, so the lookup is undefined at runtime. The check handles that case and prints "no score".',
    ts(`const scores: number[] = [4, 8];\nconst missing: number | undefined = scores[2];\nconsole.log(missing === undefined ? 'no score' : missing + 1);`), OUT),
  mcq(`${U}.e3`, 'ts-null-errors', 'What does this print?', ['3 untitled', '3 ', '0 untitled', '0 '], 2,
    '`??` only replaces null and undefined, so the 0 is kept. `||` replaces any falsy value, so the empty string becomes "untitled".',
    ts(`const config = { retries: 0, label: '' };\nconsole.log(config.retries ?? 3, config.label || 'untitled');`), OUT),
  mcq(`${U}.e4`, 'ts-null-errors', 'Why does line 9 report an error?',
    ['`yellow` is not handled, so `light` can still be "yellow" in the default branch', 'A variable can never be declared with the type `never`', 'A switch must list its cases in the same order as the type', 'The function is missing a return statement'], 0,
    'After the two cases, `light` is narrowed to "yellow", which is not assignable to `never`. That error is the reminder to handle the new case.',
    ts(`type Light = 'red' | 'yellow' | 'green';\nfunction stop(light: Light): boolean {\n  switch (light) {\n    case 'red':\n      return true;\n    case 'green':\n      return false;\n    default: {\n      const check: never = light;\n      return check;\n    }\n  }\n}`), { kind: 'ts-error', line: 9, code: 2322 }),
  mcq(`${U}.e5`, 'ts-async-data', 'What does this print?', ['2 3 4', '[2, 3, 4]', 'Promise { <pending> }', '2-3-4'], 3,
    '`Promise.all` waits for all three and gives back their results in order. `join("-")` then glues them with dashes.',
    ts(`const addOne = async (n: number): Promise<number> => n + 1;\nasync function main() {\n  const results = await Promise.all([addOne(1), addOne(2), addOne(3)]);\n  console.log(results.join('-'));\n}\nmain();`), OUT),
  short(`${U}.e6`, 'ts-async-data', 'Type what this prints.', ['2'],
    'The guard keeps only non-empty strings. Of `"a"`, `""`, `7` and `"b"`, that leaves two.',
    ts(`function isTag(value: unknown): value is string {\n  return typeof value === 'string' && value.length > 0;\n}\nconst items: unknown[] = ['a', '', 7, 'b'];\nconsole.log(items.filter(isTag).length);`), OUT),
  mcq(`${U}.e7`, 'ts-modules', 'Which line reports a type error?', ['Line 1', 'Line 2', 'Line 3', 'No error'], 2,
    'For the key `"score"` the payload type is `Events["score"]`, which is a number, so passing the string "high" is rejected on the call.',
    ts(`type Events = { score: number; name: string };\nfunction emit<K extends keyof Events>(key: K, payload: Events[K]): void {\n  console.log(key, payload);\n}\nemit('score', 'high');`), { kind: 'ts-error', line: 5, code: 2345 }),
  mcq(`${U}.e8`, 'ts-modules', 'You install a JavaScript library that ships no types. Where do you write `declare module "legacy-lib" { ... }` so TypeScript accepts imports of it?',
    ['In tsconfig.json under compilerOptions', 'In a .d.ts declaration file that the project includes', 'At the top of the library file inside node_modules', 'In a comment above each import'], 1,
    'A `declare module` block is an ambient declaration, so it belongs in a `.d.ts` file that `include` picks up.'),
];

export const U8_BONUS: QuizItem[] = [
  mcq(`${U}.b1`, 'ts-async-data', 'What does this print?', ['2,0', '2,undefined', '6,3', '2,zero'], 3,
    'Each call returns a Promise of a Result. After `Promise.all` the results are plain values, and the ternary picks `value` for the success and `error` for the failure.',
    ts(`type Result<T> = { ok: true; value: T } | { ok: false; error: string };\nasync function safeDivide(a: number, b: number): Promise<Result<number>> {\n  if (b === 0) return { ok: false, error: 'zero' };\n  return { ok: true, value: a / b };\n}\nasync function main() {\n  const results = await Promise.all([safeDivide(6, 3), safeDivide(1, 0)]);\n  console.log(results.map((r) => (r.ok ? r.value : r.error)).join(','));\n}\nmain();`), OUT),
  short(`${U}.b2`, 'ts-null-errors', 'Type the two values this prints, separated by a space.', ['true true'],
    'A custom error class that extends `Error` is an instance of both: its own class and `Error`. The first call succeeds, the second throws.',
    ts(`class NotFoundError extends Error {}\nfunction find(id: number): string {\n  if (id > 2) throw new NotFoundError('missing ' + id);\n  return 'item' + id;\n}\ntry {\n  find(1);\n  find(5);\n} catch (e) {\n  console.log(e instanceof NotFoundError, e instanceof Error);\n}`), OUT),
  mcq(`${U}.b3`, 'ts-tsconfig', 'Which line reports a type error under `strict`?', ['Line 1', 'Line 2', 'Line 3', 'No error, `Map` always returns a number'], 2,
    '`Map.get` returns `number | undefined` because the key may be missing. Adding 1 to a value that might be undefined is the error, on line 3.',
    ts(`const stock = new Map<string, number>([['tea', 4]]);\nconst count = stock.get('coffee');\nconsole.log(count + 1);`), { kind: 'ts-error', line: 3, code: 18048 }),
  mcq(`${U}.b4`, 'ts-async-data', 'Line 5 reports an error. What is the fix?',
    ['Change line 1 so the function is not async', 'Use `Awaited<ReturnType<typeof load>>` on line 4', 'Add `as Loaded` to line 5', 'Give `sample` the type `any`'], 1,
    'An async function returns a Promise, so `ReturnType` gives `Promise<...>`. `Awaited` unwraps it to the object that the promise resolves to.',
    ts(`async function load() {\n  return { id: 1, tags: ['a'] };\n}\ntype Loaded = ReturnType<typeof load>;\nconst sample: Loaded = { id: 2, tags: [] };`), { kind: 'ts-error', line: 5 }),
];
