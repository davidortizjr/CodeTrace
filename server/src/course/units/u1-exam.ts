import type { QuizItem } from '../types.js';
import { js, mcq, OUT, short } from './quiz-helpers.js';

const U = 'js-foundations';

export const U1_EXAM: QuizItem[] = [
  mcq(`${U}.e1`, 'js-values', 'What does this print?', ['number string object', 'number number null', 'number string null', 'string string object'], 0,
    '3.5 is a number, the quoted text is a string, and `typeof null` is the old quirk "object".',
    js(`console.log(typeof 3.5, typeof '3.5', typeof null);`), OUT),
  mcq(`${U}.e2`, 'js-values', 'What does this print?', ['true', 'undefined', 'false', 'NaN'], 2,
    'Decimals are stored in binary, so `0.1 + 0.2` is 0.30000000000000004, which is not equal to 0.3.',
    js(`console.log(0.1 + 0.2 === 0.3);`), OUT),
  mcq(`${U}.e3`, 'js-operators', 'What does this print?', ['1 6', '2 8', '2 6', '1 8'], 1,
    '`5 % 3` is the remainder of 5 divided by 3, which is 2. `2 ** 3` is 2 to the power 3, which is 8.',
    js(`console.log(5 % 3, 2 ** 3);`), OUT),
  mcq(`${U}.e4`, 'js-operators', 'What does this print?', ['true true', 'false false', 'false true', 'true false'], 3,
    '`==` converts the string to a number first, so `"5" == 5` is true. `===` never converts, and a string is not a number, so it is false.',
    js(`console.log('5' == 5, '5' === 5);`), OUT),
  short(`${U}.e5`, 'js-operators', 'Type the three values this prints, separated by spaces.', ['x y 0'],
    '`??` only replaces null and undefined, so `null ?? "x"` gives x. `||` replaces any falsy value, so `0 || "y"` gives y. But `0 ?? "z"` keeps the 0.',
    js(`console.log(null ?? 'x', 0 || 'y', 0 ?? 'z');`), OUT),
  mcq(`${U}.e6`, 'js-functions', 'What does this print?', ['6 12', '6 6', '12 12', '6 NaN'], 0,
    'When `b` is not given the default 2 is used, so `f(3)` is 6. When it is given, `f(3, 4)` is 12.',
    js(`const f = (a, b = 2) => a * b;\nconsole.log(f(3), f(3, 4));`), OUT),
  mcq(`${U}.e7`, 'js-functions', 'What does this print?', ['2', 'undefined', 'null', 'Nothing, it is an error'], 1,
    'The function calculates `1 + 1` but has no `return`, so calling it gives back undefined.',
    js(`function f() {\n  1 + 1;\n}\nconsole.log(f());`), OUT),
  short(`${U}.e8`, 'js-strings', 'Type what this prints.', ['EL'],
    '`slice(1, 3)` takes the characters at index 1 and 2, which is "el". `toUpperCase()` then makes it "EL".',
    js(`console.log('Hello'.slice(1, 3).toUpperCase());`), OUT),
];

export const U1_BONUS: QuizItem[] = [
  mcq(`${U}.b1`, 'js-functions', 'What does this print?', ['1 1 1', '1 2 3', '0 1 2', '3 3 3'], 1,
    'The inner function remembers the `count` variable, so each call adds to the same one instead of starting again.',
    js(`function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nconsole.log(next(), next(), next());`), OUT),
  short(`${U}.b2`, 'js-strings', 'Type what this prints.', ['abc'],
    'Strings cannot be changed in place. The assignment to `s[0]` is silently ignored, so `s` is still "abc".',
    js(`const s = 'abc';\ns[0] = 'z';\nconsole.log(s);`), OUT),
  mcq(`${U}.b3`, 'js-operators', 'What does this print?', ['false false', 'false true', 'true true', 'true false'], 1,
    '`!!` turns any value into a boolean. The empty string is falsy, but the string "0" is a non-empty string, so it is truthy.',
    js(`console.log(!!'', !!'0');`), OUT),
  mcq(`${U}.b4`, 'js-functions', 'What does this print?', ['9 8', '9 ReferenceError', 'ReferenceError', '9 undefined'], 1,
    'A function declaration is available from the top of its scope, so `square(3)` works. A `const` is not usable before its line, so calling `cube` early throws a ReferenceError.',
    js(`console.log(square(3));\nfunction square(n) {\n  return n * n;\n}\ntry {\n  console.log(cube(2));\n} catch (e) {\n  console.log(e.name);\n}\nconst cube = (n) => n ** 3;`), OUT),
];
