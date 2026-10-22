import type { QuizItem } from '../types.js';
import { js, mcq, OUT, short } from './quiz-helpers.js';

const U = 'js-data';

export const U3_EXAM: QuizItem[] = [
  mcq(`${U}.e1`, 'js-arrays', 'What does this print?', ['[ 1, 2 ] [ 3 ]', '[ 1, 2, 3 ] [ 3 ]', '[ 1, 2, 3 ] [ 1, 2, 3 ]', '[ 1, 2 ] [ 1, 2, 3 ]'], 1,
    '`const b = a` is the same array under a second name. `push` through `b` changes it, so `a` has 3 items, and `slice(-1)` copies the last one into a new array.',
    js(`const a = [1, 2];\nconst b = a;\nb.push(3);\nconsole.log(a, a.slice(-1));`), OUT),
  short(`${U}.e2`, 'js-arrays', 'Type what this prints.', ['1 [ 1, 4 ]'],
    '`splice(1, 1)` removes one item at index 1, the 2. It returns the removed items in an array, so its length is 1, and the original array has changed to `[1, 4]`.',
    js(`const nums = [1, 2, 4];\nconst removed = nums.splice(1, 1);\nconsole.log(removed.length, nums);`), OUT),
  mcq(`${U}.e3`, 'js-array-methods', 'What does this print?', ['[ 1, 10, 9 ]', '[ 1, 9, 10 ]', '[ 10, 9, 1 ]', '[ 9, 10, 1 ]'], 0,
    'Without a comparator `sort` compares the items as text, and "1" comes before "10", which comes before "9".',
    js(`console.log([10, 9, 1].sort());`), OUT),
  mcq(`${U}.e4`, 'js-array-methods', 'What does this print?', ['[ 2, 4 ]', '[ 2, 4, 6 ]', '[ 4, 8 ]', '12'], 2,
    '`filter` keeps the even numbers, 2 and 4, and then `map` doubles them.',
    js(`const out = [1, 2, 3, 4].filter((n) => n % 2 === 0).map((n) => n * 2);\nconsole.log(out);`), OUT),
  short(`${U}.e5`, 'js-array-methods', 'Type exactly what this prints.', ['10'],
    '`reduce` starts the sum at 0 and adds 1, 2, 3 and 4 in turn.',
    js(`console.log([1, 2, 3, 4].reduce((sum, n) => sum + n, 0));`), OUT),
  mcq(`${U}.e6`, 'js-objects', 'What does this print?', ['undefined', 'Ada', 'name', 'Error'], 0,
    'The brackets use the variable `prop`, which holds "title", and the object has no `title` property.',
    js(`const prop = 'title';\nconst user = { name: 'Ada' };\nconsole.log(user[prop]);`), OUT),
  mcq(`${U}.e7`, 'js-objects', 'What does this print?', ['[ 1, 2 ]', "[ 'a', 'b' ]", "[ [ 'a', 1 ], [ 'b', 2 ] ]", '2'], 2,
    '`Object.entries` gives an array of `[key, value]` pairs.',
    js(`console.log(Object.entries({ a: 1, b: 2 }));`), OUT),
  short(`${U}.e8`, 'js-maps-sets', 'Type exactly what this prints.', ['2'],
    'A Set keeps one copy of each value, so "a" and "b" are the only two items.',
    js(`console.log(new Set(['a', 'b', 'a']).size);`), OUT),
];

export const U3_BONUS: QuizItem[] = [
  mcq(`${U}.b1`, 'js-arrays', 'What does this print?', ['true false', 'false true', 'true true', 'false false'], 1,
    '`===` on arrays compares whether they are the same array, not whether they hold the same items. Two separate arrays are different even with equal contents, while `c` is the same array as `a`.',
    js(`const a = [1];\nconst b = [1];\nconst c = a;\nconsole.log(a === b, a === c);`), OUT),
  short(`${U}.b2`, 'js-array-methods', 'Type exactly what this prints.', ['Ada Grace'],
    '`find` returns the first item for which the test is true. "Al" is too short for both tests, "Ada" is the first name longer than 2 characters, and "Grace" is the first longer than 3.',
    js(`const names = ['Al', 'Ada', 'Grace'];\nconsole.log(names.find((n) => n.length > 2), names.find((n) => n.length > 3));`), OUT),
  mcq(`${U}.b3`, 'js-objects', 'What does this print?', ['1 2', '1 1', '2 2', '2 1'], 3,
    'The spread copy `{ ...a }` has its own top-level `x`. Setting `copy.x` to 2 does not touch `a`, so `a.x` is still 1.',
    js(`const a = { x: 1 };\nconst copy = { ...a };\ncopy.x = 2;\nconsole.log(copy.x, a.x);`), OUT),
  mcq(`${U}.b4`, 'js-maps-sets', 'What does this print?', ['2 1', '1 2', '3 1', '2 2'], 0,
    'Setting the key "x" a second time replaces its value instead of adding an entry, so the Map has 2 entries and `get("x")` is the last value written, 1.',
    js(`const m = new Map();\nm.set('x', 5);\nm.set('y', 6);\nm.set('x', 1);\nconsole.log(m.size, m.get('x'));`), OUT),
];
