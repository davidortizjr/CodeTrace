import type { QuizItem } from '../types.js';
import { mcq, OUT, short, ts } from './quiz-helpers.js';

const U = 'ts-generics';

export const U7_EXAM: QuizItem[] = [
  mcq(`${U}.e1`, 'ts-generic-functions', 'What does this print?', ['1 1', '1 2', '2 2', '1 undefined'], 1,
    '`wrap` puts its argument in a list, so `wrap(3).length` is 1. `wrap("ab")[0]` is the string "ab", whose length is 2.',
    ts(`function wrap<T>(value: T): T[] {\n  return [value];\n}\nconsole.log(wrap(3).length, wrap('ab')[0].length);`), OUT),
  short(`${U}.e2`, 'ts-generic-functions', 'Type what this prints.', ['10+20+30'],
    'T is number and U is number, so the callback multiplies each item by 10 and the result is `[10, 20, 30]`. join("+") glues them together.',
    ts(`function mapItems<T, U>(items: T[], transform: (item: T) => U): U[] {\n  return items.map(transform);\n}\nconsole.log(mapItems([1, 2, 3], (n) => n * 10).join('+'));`), OUT),
  mcq(`${U}.e3`, 'ts-generic-types', 'Which line is the type error?', ['Line 3', 'Line 2', 'Line 4', 'There is no error'], 0,
    '`Box<number>` holds a number, but line 3 gives it the string "y". Lines 2 and 4 match their type arguments.',
    ts(`interface Box<T> { value: T }\nconst a: Box<string> = { value: 'x' };\nconst b: Box<number> = { value: 'y' };\nconst c: Box<boolean> = { value: true };`),
    { kind: 'ts-error', line: 3, code: 2322 }),
  mcq(`${U}.e4`, 'ts-generic-types', 'What does this print?', ['4121', 'NaN', '412 1', '413'], 3,
    '`getProp(item, "pages")` has the type `T["pages"]`, which is number, so the 1 is added as a number: 412 + 1 is 413.',
    ts(`function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\nconst item = { title: 'Dune', pages: 412 };\nconsole.log(getProp(item, 'pages') + 1);`), OUT),
  mcq(`${U}.e5`, 'ts-mapped-conditional', 'Which line is the type error?', ['Line 1', 'Line 2', 'Line 3', 'There is no error'], 2,
    '`Flags<Settings>` turns every property into a boolean. Line 3 sets `compact` to the number 1, which is not a boolean.',
    ts(`type Flags<T> = { [K in keyof T]: boolean };\ninterface Settings { dark: string; compact: number }\nconst f: Flags<Settings> = { dark: true, compact: 1 };`),
    { kind: 'ts-error', line: 3, code: 2322 }),
  short(`${U}.e6`, 'ts-mapped-conditional', 'Type what this prints.', ['3'],
    '`ElementOf<string[]>` matches `(infer E)[]` with E as string, so `item` is a string and "tea".length is 3.',
    ts(`type ElementOf<T> = T extends (infer E)[] ? E : never;\nconst item: ElementOf<string[]> = 'tea';\nconsole.log(item.length);`), OUT),
  mcq(`${U}.e7`, 'ts-type-guards', 'What does this print?', ['2', '4', '1', '3'], 0,
    '`isNumber` is a type guard, and `filter` keeps only the items for which it returns true: 1 and 2. So the length is 2.',
    ts(`function isNumber(value: unknown): value is number {\n  return typeof value === 'number';\n}\nconst items: unknown[] = [1, 'a', 2, null];\nconsole.log(items.filter(isNumber).length);`), OUT),
  short(`${U}.e8`, 'ts-type-guards', 'Type the error name this prints.', ['TypeError'],
    '`assertString(5)` throws, because 5 is not a string. The catch block prints the name of that error, which is TypeError.',
    ts(`function assertString(value: unknown): asserts value is string {\n  if (typeof value !== 'string') throw new TypeError('not a string');\n}\ntry {\n  assertString(5);\n  console.log('ok');\n} catch (error) {\n  console.log((error as Error).name);\n}`), OUT),
];

export const U7_BONUS: QuizItem[] = [
  mcq(`${U}.b1`, 'ts-generic-types', 'What does this print?', ['8136', '45', '81', 'undefined'], 2,
    '`pluck(people, "age")` is the list `[36, 45]`, typed `number[]`, so reduce adds them as numbers: 36 + 45 is 81.',
    ts(`function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {\n  return items.map((item) => item[key]);\n}\nconst people = [{ name: 'Ada', age: 36 }, { name: 'Grace', age: 45 }];\nconsole.log(pluck(people, 'age').reduce((sum, age) => sum + age, 0));`), OUT),
  mcq(`${U}.b2`, 'ts-mapped-conditional', 'Which line is the type error?', ['Line 2', 'Line 3', 'Lines 2 and 3', 'There is no error'], 1,
    'The conditional is distributive, so `Wrap<string | number>` is `string[] | number[]`. A list of only numbers fits, but a mixed list is neither, so line 3 fails.',
    ts(`type Wrap<T> = T extends unknown ? T[] : never;\nconst x: Wrap<string | number> = [1, 2];\nconst y: Wrap<string | number> = [1, 'a'];`),
    { kind: 'ts-error', line: 3, code: 2322 }),
  short(`${U}.b3`, 'ts-type-guards', 'Type what this prints.', ['ab'],
    '`data` is a list of strings, so `isArrayOf(data, isString)` is true and narrows `data` to `string[]`. join("") gives "ab".',
    ts(`function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {\n  return Array.isArray(value) && value.every(guard);\n}\nconst isString = (item: unknown): item is string => typeof item === 'string';\nconst data: unknown = JSON.parse('["a", "b"]');\nconsole.log(isArrayOf(data, isString) ? data.join('') : 'invalid');`), OUT),
  mcq(`${U}.b4`, 'ts-mapped-conditional', 'Which line is the type error?', ['Line 1', 'Line 2', 'Line 3', 'Line 4'], 3,
    'The `as` clause renames x and y to `getX` and `getY`. There is no `getZ`, so the use on line 4 is an error.',
    ts(`type Getters<T> = { [K in keyof T & string as \`get\${Capitalize<K>}\`]: () => T[K] };\ninterface Point { x: number; y: number }\nconst g: Getters<Point> = { getX: () => 1, getY: () => 2 };\nconst total = g.getX() + g.getZ();`),
    { kind: 'ts-error', line: 4, code: 2339 }),
];
