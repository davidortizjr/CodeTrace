import type { QuizItem } from '../types.js';
import { mcq, OUT, short, ts } from './quiz-helpers.js';

const U = 'ts-basics';

export const U5_EXAM: QuizItem[] = [
  mcq(`${U}.e1`, 'ts-intro', 'Which line is the type error?', ['Line 1', 'Line 2', 'Line 4', 'There is no error'], 2,
    'The call on line 4 passes a string, but the parameter is a number.',
    ts(`function double(n: number): number {\n  return n * 2;\n}\nconsole.log(double('4'));`),
    { kind: 'ts-error', line: 4, code: 2345 }),
  short(`${U}.e2`, 'ts-intro', 'Type what this prints.', ['number'],
    'The annotation is removed when the program runs. The value is the number 5, so `typeof` gives "number".',
    ts(`const n: number = 5;\nconsole.log(typeof n);`), OUT),
  mcq(`${U}.e3`, 'ts-primitives', 'Which line is the type error?', ['Line 2', 'Line 3', 'Line 4', 'There is no error'], 0,
    'The tuple `[string, number]` has the string first. Line 2 gives it the number first.',
    ts(`type Row = [string, number];\nconst a: Row = [1, 'x'];\nconst b: Row = ['x', 1];`),
    { kind: 'ts-error', line: 2, code: 2322 }),
  short(`${U}.e4`, 'ts-primitives', 'Type what this prints.', ['2'],
    '`as const` keeps the exact tuple, and `roles.length` is the number of items, 2.',
    ts(`const roles = ['admin', 'user'] as const;\nconsole.log(roles.length);`), OUT),
  mcq(`${U}.e5`, 'ts-functions', 'What does this print?', ['6', '5', 'NaN', '3'], 0,
    'The rest parameter collects 1, 2 and 3 into an array, and the sum is 6.',
    ts(`function sum(...nums: number[]): number {\n  return nums.reduce((a, b) => a + b, 0);\n}\nconsole.log(sum(1, 2, 3));`), OUT),
  mcq(`${U}.e6`, 'ts-functions', 'Which line is the type error?', ['Line 1', 'Line 2', 'Line 3', 'There is no error'], 1,
    'The function type says the callback returns a number, but the arrow function returns a string.',
    ts(`type Op = (n: number) => number;\nconst a: Op = (n) => String(n);\nconst b: Op = (n) => n + 1;`),
    { kind: 'ts-error', line: 2, code: 2322 }),
  mcq(`${U}.e7`, 'ts-narrowing', 'What does this print?', ['3 4', '3 undefined', '4 4', 'Error'], 0,
    'Inside the typeof check the value is a string, so its length, 3, is returned. The number 4 goes through the other branch unchanged.',
    ts(`function f(v: string | number): number {\n  return typeof v === 'string' ? v.length : v;\n}\nconsole.log(f('tea'), f(4));`), OUT),
  short(`${U}.e8`, 'ts-narrowing', 'Type exactly what this prints.', ['5'],
    '`n` is null, so `??` supplies the fallback 5.',
    ts(`const n: number | null = null;\nconsole.log(n ?? 5);`), OUT),
];

export const U5_BONUS: QuizItem[] = [
  mcq(`${U}.b1`, 'ts-primitives', 'What is wrong with this code?', ['Nothing, it compiles', 'A string cannot be null in strict mode', 'The variable needs let', 'null is not a keyword'], 1,
    'With strict null checks, `null` is not a string. Write `string | null` to allow it.',
    ts(`const name: string = null;`),
    { kind: 'ts-error', line: 1, code: 2322 }),
  short(`${U}.b2`, 'ts-functions', 'Type exactly what this prints.', ['10'],
    'The default `n = 10` is used because no argument is passed.',
    ts(`function value(n = 10): number {\n  return n;\n}\nconsole.log(value());`), OUT),
  mcq(`${U}.b3`, 'ts-narrowing', 'What does this print?', ['text', 'undefined', 'number', 'Error'], 1,
    'The cast tells the compiler to treat 5 as a string, but nothing is converted. A number has no `length`, so it prints undefined.',
    ts(`const v: unknown = 5;\nconsole.log((v as string).length);`), OUT),
  mcq(`${U}.b4`, 'ts-narrowing', 'Which line is the type error?', ['Line 3', 'Line 6', 'Line 2', 'There is no error'], 1,
    'In `a`, the `if` returns for null, so `text` is a string afterwards. In `b` there is no check, so `text` is still nullable on line 6.',
    ts(`function a(text: string | null) {\n  if (text === null) return 0;\n  return text.length;\n}\nfunction b(text: string | null) {\n  return text.length;\n}`),
    { kind: 'ts-error', line: 6, code: 18047 }),
];
