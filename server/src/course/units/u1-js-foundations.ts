import type { Unit } from '../types.js';
import { U1_BONUS, U1_EXAM } from './u1-exam.js';

export const JS_FOUNDATIONS: Unit = {
  id: 'js-foundations',
  track: 'js',
  title: 'JavaScript foundations',
  blurb: 'Values, variables, operators and functions: the pieces every program is built from.',
  lessons: [
    {
      id: 'js-values',
      title: 'Values, variables and printing',
      summary: 'Print results, name values with const and let, and meet the basic types.',
      minutes: 12,
      objectives: [
        'Print a value with console.log and read what it shows',
        'Choose between const and let',
        'Name the basic types and check one with typeof',
        'Build strings with template literals',
      ],
      sections: [
        {
          heading: 'Printing is how you look inside',
          body: [
            'Every example in this course ends with `console.log(...)`. It prints its arguments on one line, separated by spaces. It is the quickest way to see what a value is.',
            'Statements end with a semicolon. A line that starts with `//` is a comment: JavaScript ignores it, and it is there for people.',
          ],
          examples: [
            {
              id: 'hello',
              lang: 'js',
              code: `// print some values
console.log('Hello');
console.log(2 + 3);
console.log('Total:', 5);`,
              output: ['Hello', '5', 'Total: 5'],
              caption: 'Strings print without their quotes.',
            },
          ],
        },
        {
          heading: 'Naming values: const and let',
          body: [
            'A variable is a name for a value. Use `const` when the name will always point at the same value, and `let` when it needs to change later.',
            'Start with `const` for everything. Switch to `let` only when the code reassigns the name. That way a reader knows at a glance which names can change.',
          ],
          examples: [
            {
              id: 'const-let',
              lang: 'js',
              code: `const price = 4;
let count = 1;
count = count + 2;
console.log(price * count);`,
              output: ['12'],
            },
            {
              id: 'const-reassign',
              lang: 'js',
              code: `const score = 10;
score = 11;
console.log(score);`,
              runtimeError: 'TypeError: Assignment to constant variable.',
              caption: 'Reassigning a const is an error, and that is the point.',
            },
          ],
          notes: [
            { kind: 'tip', text: 'Old code uses `var`. You will see it, but you do not need to write it: `let` and `const` behave more sensibly.' },
          ],
        },
        {
          heading: 'The basic types',
          body: [
            'Every value has a type. The ones you use all the time are `string` (text), `number` (integers and decimals alike), `boolean` (`true` or `false`), `undefined` (nothing was given) and `null` (nothing, on purpose).',
            '`typeof` tells you the type of a value as a string.',
          ],
          examples: [
            {
              id: 'typeof',
              lang: 'js',
              code: `console.log(typeof 'hi');
console.log(typeof 42);
console.log(typeof 4.5);
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);`,
              output: ['string', 'number', 'number', 'boolean', 'undefined', 'object'],
              caption: 'There is one number type. The `null` result is a famous old quirk.',
            },
          ],
          notes: [{ kind: 'watch-out', text: '`typeof null` is `"object"`. It is a bug from 1995 that can never be fixed. Check for null with `=== null`.' }],
        },
        {
          heading: 'Building strings',
          body: [
            'Wrap text in backticks to write a template literal. Anything inside `${ }` is calculated and put into the text. This is nearly always clearer than joining pieces with `+`.',
            'The `+` operator does two jobs: it adds numbers and it joins strings. If either side is a string, it joins.',
          ],
          examples: [
            {
              id: 'template',
              lang: 'js',
              code: `const name = 'Ada';
const items = 3;
console.log(\`\${name} bought \${items} items\`);
console.log(\`Next year: \${items + 1}\`);`,
              output: ['Ada bought 3 items', 'Next year: 4'],
            },
            {
              id: 'plus-joins',
              lang: 'js',
              code: `console.log(1 + 2);
console.log('1' + 2);
console.log('1' + '2');`,
              output: ['3', '12', '12'],
              caption: 'The same operator, three different jobs.',
            },
          ],
        },
        {
          heading: 'Numbers are not always exact',
          body: [
            'JavaScript stores decimals in binary, so some simple sums come out slightly off. This is not a JavaScript bug. Every language that uses these numbers does the same.',
            'When you show a price, round it with `toFixed`, which returns a string.',
          ],
          examples: [
            {
              id: 'float',
              lang: 'js',
              code: `console.log(0.1 + 0.2);
console.log((0.1 + 0.2).toFixed(2));
console.log(7.5.toFixed(2));`,
              output: ['0.30000000000000004', '0.30', '7.50'],
            },
          ],
        },
      ],
      recap: [
        '`console.log` prints values so you can see them.',
        'Use `const` unless the name must change, then use `let`.',
        'The basic types are string, number, boolean, undefined and null. `typeof` reports them.',
        'Template literals with `${ }` build strings. `+` joins when either side is a string.',
        '`toFixed(2)` rounds to two decimals and gives back a string.',
      ],
      checks: [
        {
          id: 'js-values.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `const a = 2;\nconst b = '3';\nconsole.log(a + b);` },
          options: ['5', '23', 'NaN', '6'],
          answer: 1,
          explanation: 'One side of `+` is a string, so JavaScript joins instead of adding: the text "2" and "3" become "23".',
          review: 'js-values',
          verify: { kind: 'output' },
        },
        {
          id: 'js-values.c2',
          kind: 'mcq',
          prompt: 'Which keyword should you reach for first when you name a value?',
          options: ['var', 'let', 'const', 'set'],
          answer: 2,
          explanation: '`const` says the name will not be reassigned. Switch to `let` only when the value has to change.',
          review: 'js-values',
        },
        {
          id: 'js-values.c3',
          kind: 'short',
          prompt: 'Type exactly what this prints.',
          code: { lang: 'js', text: `const n = 4;\nconsole.log(\`\${n} + 1 = \${n + 1}\`);` },
          accept: ['4 + 1 = 5'],
          explanation: 'The first `${n}` becomes 4. The second `${n + 1}` calculates 5. The ` + 1 = ` between them is plain text.',
          review: 'js-values',
          verify: { kind: 'output' },
        },
      ],
      exercises: ['ex-js-values'],
    },
    {
      id: 'js-operators',
      title: 'Operators and truthiness',
      summary: 'Calculate with numbers, compare values safely, and combine conditions.',
      minutes: 13,
      objectives: [
        'Use the arithmetic operators, including % and **',
        'Compare values with === and explain why == is risky',
        'Combine conditions with &&, || and !, and know which values are falsy',
        'Choose a fallback with ?? and read an optional value safely with ?.',
      ],
      sections: [
        {
          heading: 'Arithmetic',
          body: [
            'You already know `+`. The others are `-`, `*` and `/`. Two more are worth learning early: `%` (remainder) gives what is left over after dividing, and `**` raises a number to a power.',
            'The remainder is more useful than it sounds. `n % 2` is `0` for every even number, and `n % 10` is the last digit of `n`.',
          ],
          examples: [
            {
              id: 'arithmetic',
              lang: 'js',
              code: `console.log(7 + 2);
console.log(7 - 2);
console.log(7 * 2);
console.log(7 / 2);
console.log(7 % 2);
console.log(2 ** 3);`,
              output: ['9', '5', '14', '3.5', '1', '8'],
              caption: '7 divided by 2 is 3 with 1 left over, so `/` gives 3.5 and `%` gives 1.',
            },
            {
              id: 'remainder-use',
              lang: 'js',
              code: `const day = 10;
console.log(day % 2 === 0);
console.log(2026 % 10);`,
              output: ['true', '6'],
            },
          ],
          notes: [{ kind: 'tip', text: 'JavaScript has no separate whole-number division. `7 / 2` is `3.5`. To drop the decimals, use `Math.floor(7 / 2)`, which gives `3`.' }],
        },
        {
          heading: 'Comparing values',
          body: [
            'Comparisons give a boolean. `<`, `>`, `<=` and `>=` do what you expect. To ask "are these the same?", use `===`, and `!==` for "are these different?".',
            'There is also `==`. It quietly converts the two sides to a common type before comparing, so `5 == "5"` is true. `===` never converts: a number and a string are never equal. Because the conversions are hard to predict, always write `===`.',
          ],
          examples: [
            {
              id: 'comparison',
              lang: 'js',
              code: `console.log(5 > 3);
console.log(5 <= 3);
console.log(5 !== 3);
console.log(5 === 5);`,
              output: ['true', 'false', 'true', 'true'],
            },
            {
              id: 'loose-equal',
              lang: 'js',
              code: `console.log(5 === '5');
console.log(5 == '5');
console.log(0 == false);
console.log(null == undefined);
console.log(null === undefined);`,
              output: ['false', 'true', 'true', 'true', 'false'],
              caption: 'Every `==` line here is true, and most of them would surprise you.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'Writing `=` instead of `===` in a comparison is a classic slip. A single `=` assigns a value, it does not compare.' }],
        },
        {
          heading: 'And, or, not',
          body: [
            '`&&` means "and": it is true only when both sides are true. `||` means "or": it is true when at least one side is. `!` flips a boolean.',
            'These operators work on any value, not only booleans. JavaScript treats six values as **falsy**: `false`, `0`, the empty string `""`, `null`, `undefined` and `NaN`. Everything else is **truthy**, including `"0"` and `"false"`.',
            'And they return one of their two sides, not always `true` or `false`. `a || b` gives `a` if it is truthy, otherwise `b`. `a && b` gives `a` if it is falsy, otherwise `b`. That makes `||` a quick way to write a fallback.',
          ],
          examples: [
            {
              id: 'logic',
              lang: 'js',
              code: `const age = 20;
const hasTicket = true;
console.log(age >= 18 && hasTicket);
console.log(age < 18 || hasTicket);
console.log(!hasTicket);`,
              output: ['true', 'true', 'false'],
            },
            {
              id: 'truthy',
              lang: 'js',
              code: `console.log(Boolean(0), Boolean(''), Boolean(null));
console.log(Boolean('0'), Boolean(42), Boolean('hello'));
console.log('Ada' && 'admin');
console.log('' || 'guest');`,
              output: ['false false false', 'true true true', 'admin', 'guest'],
              caption: '`Boolean(value)` shows whether a value counts as truthy.',
            },
          ],
        },
        {
          heading: 'A better fallback: ??',
          body: [
            '`||` has a catch. It replaces every falsy value, and `0` and `""` are falsy even when they are real answers. If a user sets a volume of `0`, `volume || 50` throws it away.',
            '`??` (nullish coalescing) only replaces `null` and `undefined`. A `0` or an empty string passes straight through.',
          ],
          examples: [
            {
              id: 'nullish',
              lang: 'js',
              code: `const count = 0;
console.log(count || 10);
console.log(count ?? 10);
console.log(null ?? 'none');`,
              output: ['10', '0', 'none'],
              caption: '`||` ignored the real zero. `??` kept it.',
            },
          ],
        },
        {
          heading: 'Reading something that might be missing: ?.',
          body: [
            'Asking for a method on `null` or `undefined` crashes the program. Put `?.` before the dot and JavaScript stops at the missing value and gives `undefined` instead of an error.',
            'Pair it with `??` to supply a fallback: `value?.something ?? "default"`.',
          ],
          examples: [
            {
              id: 'optional-chain',
              lang: 'js',
              code: `const nickname = 'ada';
const middleName = null;
console.log(nickname?.toUpperCase());
console.log(middleName?.toUpperCase());
console.log(middleName?.toUpperCase() ?? 'no middle name');`,
              output: ['ADA', 'undefined', 'no middle name'],
            },
            {
              id: 'optional-crash',
              lang: 'js',
              code: `const middleName = null;
console.log(middleName.toUpperCase());`,
              runtimeError: "TypeError: Cannot read properties of null (reading 'toUpperCase')",
              caption: 'Without `?.` the same call crashes.',
            },
          ],
          notes: [{ kind: 'tip', text: 'Do not put `?.` everywhere. If a value should never be missing, a crash is useful: it shows you the bug. Use `?.` only where "missing" is a normal case.' }],
        },
      ],
      recap: [
        '`%` is the remainder and `**` is the power. `/` always gives a decimal when the division is not exact.',
        'Compare with `===` and `!==`. `==` converts types first and gives surprises.',
        '`&&`, `||` and `!` combine conditions. The falsy values are `false`, `0`, `""`, `null`, `undefined` and `NaN`.',
        '`a || b` falls back on any falsy `a`. `a ?? b` falls back only on `null` or `undefined`.',
        '`value?.method()` gives `undefined` instead of crashing when `value` is `null` or `undefined`.',
      ],
      checks: [
        {
          id: 'js-operators.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `console.log(10 % 3, 2 ** 4);` },
          options: ['3 8', '1 16', '1 8', '0 16'],
          answer: 1,
          explanation: '10 divided by 3 leaves a remainder of 1, and 2 to the power 4 is 16.',
          review: 'js-operators',
          verify: { kind: 'output' },
        },
        {
          id: 'js-operators.c2',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `const stock = 0;\nconsole.log(stock || 5, stock ?? 5);` },
          options: ['5 5', '0 0', '0 5', '5 0'],
          answer: 3,
          explanation: '`||` replaces the falsy 0 with 5. `??` only replaces null or undefined, so it keeps the 0.',
          review: 'js-operators',
          verify: { kind: 'output' },
        },
        {
          id: 'js-operators.c3',
          kind: 'short',
          prompt: 'Type exactly what this prints.',
          code: { lang: 'js', text: `console.log(5 == '5', 5 === '5');` },
          accept: ['true false'],
          explanation: '`==` converts the string to a number first, so it is true. `===` compares without converting, and a number is never equal to a string.',
          review: 'js-operators',
          verify: { kind: 'output' },
        },
      ],
      exercises: ['ex-js-operators-leap', 'ex-js-operators-default'],
    },
    {
      id: 'js-functions',
      title: 'Functions',
      summary: 'Package code into reusable functions, and pass functions around like any other value.',
      minutes: 14,
      objectives: [
        'Write a function with parameters and call it with arguments',
        'Explain what a function returns, and what it returns without a return statement',
        'Write function declarations, function expressions and arrow functions',
        'Give a parameter a default value',
        'Pass a function to another function, and read a simple closure',
      ],
      sections: [
        {
          heading: 'Declaring and calling',
          body: [
            'A function is a named block of code you can run as often as you like. Write `function`, a name, the **parameters** in parentheses, and the body in braces. Parameters are names for the values the function will receive.',
            'To run it, write its name followed by parentheses holding the **arguments**: the actual values. Each argument fills the parameter in the same position.',
          ],
          examples: [
            {
              id: 'declare',
              lang: 'js',
              code: `function add(a, b) {
  return a + b;
}

console.log(add(2, 3));
console.log(add(10, 5));`,
              output: ['5', '15'],
              caption: 'One definition, two calls.',
            },
          ],
        },
        {
          heading: 'Return gives the answer back',
          body: [
            '`return` hands a value back to whoever called the function, and ends the function on the spot. Any line after a `return` that runs is never reached.',
            'A function that never reaches a `return` gives back `undefined`. It might print things or do other work, but the caller gets nothing useful to store.',
          ],
          examples: [
            {
              id: 'return-early',
              lang: 'js',
              code: `function half(n) {
  return n / 2;
  console.log('never printed');
}

console.log(half(10));`,
              output: ['5'],
            },
            {
              id: 'no-return',
              lang: 'js',
              code: `function double(n) {
  n * 2;
}

console.log(double(4));`,
              output: ['undefined'],
              caption: 'The multiplication happens, then the result is thrown away.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'Printing a value is not the same as returning it. `console.log` shows it to you, `return` hands it to the code that called the function.' }],
        },
        {
          heading: 'Three ways to write a function',
          body: [
            'A function is a value, so you can store it in a `const`. That is a **function expression**. An **arrow function** is a shorter way to write one: parameters, `=>`, then the body.',
            'If the arrow body is a single expression, you can skip the braces and the `return`: the value is returned automatically. If you do use braces, you need `return` again.',
          ],
          examples: [
            {
              id: 'three-ways',
              lang: 'js',
              code: `function square(n) {
  return n * n;
}
const cube = function (n) {
  return n * n * n;
};
const double = (n) => n * 2;
const area = (width, height) => {
  const result = width * height;
  return result;
};

console.log(square(3), cube(3), double(3), area(3, 4));`,
              output: ['9 27 6 12'],
              caption: 'All four are called the same way.',
            },
          ],
          notes: [{ kind: 'tip', text: 'In this course you will see declarations for named, top-level functions and arrow functions for short helpers you pass around.' }],
        },
        {
          heading: 'Default values',
          body: [
            'Give a parameter a default with `=`. The default is used when the caller leaves the argument out, or passes `undefined`. If the caller passes anything else, even `null` or `0`, that value wins.',
          ],
          examples: [
            {
              id: 'defaults',
              lang: 'js',
              code: `function greet(name = 'friend') {
  return 'Hello, ' + name;
}

console.log(greet());
console.log(greet('Ada'));
console.log(greet(null));`,
              output: ['Hello, friend', 'Hello, Ada', 'Hello, null'],
              caption: '`null` is a value, so it does not trigger the default.',
            },
          ],
        },
        {
          heading: 'Functions are values',
          body: [
            'Because a function is a value, you can pass it into another function as an argument, and the other function can call it. This is one of the most useful ideas in JavaScript.',
            'Notice that `double` is the function itself. `double(5)` is a call: it runs the function and gives you its result.',
          ],
          examples: [
            {
              id: 'pass-function',
              lang: 'js',
              code: `const double = (n) => n * 2;

function applyTwice(fn, value) {
  return fn(fn(value));
}

console.log(typeof double);
console.log(applyTwice(double, 5));
console.log(applyTwice((n) => n + 1, 5));`,
              output: ['function', '20', '7'],
              caption: 'The last call passes a tiny arrow function with no name at all.',
            },
          ],
        },
        {
          heading: 'A first look at closures',
          body: [
            'A function remembers the variables that were around it when it was created. This is called a **closure**. A function made inside another function can keep using, and changing, the outer function\'s variables, even after the outer function has finished.',
            'Each call to the outer function creates its own separate variables, so two counters made this way do not interfere with each other.',
          ],
          examples: [
            {
              id: 'closure',
              lang: 'js',
              code: `function makeCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}

const next = makeCounter();
console.log(next());
console.log(next());
const other = makeCounter();
console.log(other());
console.log(next());`,
              output: ['1', '2', '1', '3'],
              caption: '`next` and `other` each carry their own `count`.',
            },
          ],
        },
      ],
      recap: [
        'Parameters are the names in the definition. Arguments are the values you pass when you call.',
        '`return` hands back a value and stops the function. With no `return`, the result is `undefined`.',
        'Declarations, function expressions and arrow functions all make functions. A one-expression arrow body returns automatically.',
        'A default (`name = "friend"`) is used when the argument is missing or `undefined`, but not for `null` or `0`.',
        'Functions are values: you can pass them as arguments. A function remembers the variables around where it was created, which is a closure.',
      ],
      checks: [
        {
          id: 'js-functions.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `function add(a, b) {\n  a + b;\n}\nconsole.log(add(2, 3));` },
          options: ['5', 'undefined', 'null', 'NaN'],
          answer: 1,
          explanation: 'The function calculates a + b but never returns it, so the call gives back undefined.',
          review: 'js-functions',
          verify: { kind: 'output' },
        },
        {
          id: 'js-functions.c2',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `function greet(name = 'friend') {\n  return 'Hi ' + name;\n}\nconsole.log(greet(), greet(null));` },
          options: ['Hi friend Hi friend', 'Hi null Hi null', 'Hi friend Hi null', 'Hi undefined Hi null'],
          answer: 2,
          explanation: 'Leaving the argument out uses the default. Passing null is passing a value, so the default is not used and "Hi null" is the result.',
          review: 'js-functions',
          verify: { kind: 'output' },
        },
        {
          id: 'js-functions.c3',
          kind: 'short',
          prompt: 'Type exactly what this prints.',
          code: {
            lang: 'js',
            text: `function makeCounter() {\n  let n = 0;\n  return () => {\n    n += 1;\n    return n;\n  };\n}\nconst next = makeCounter();\nnext();\nnext();\nconsole.log(next());`,
          },
          accept: ['3'],
          explanation: 'The returned function keeps its own `n`. It is called three times, so `n` goes 1, 2, 3 and the last call returns 3.',
          review: 'js-functions',
          verify: { kind: 'output' },
        },
      ],
      exercises: ['ex-js-functions'],
    },
    {
      id: 'js-strings',
      title: 'Working with strings',
      summary: 'Measure, slice, search, clean up and rebuild text, and learn why a string never changes.',
      minutes: 14,
      objectives: [
        'Read a string\'s length and pick out single characters by index',
        'Cut out part of a string with slice',
        'Search with indexOf, includes and startsWith',
        'Tidy and reshape text with trim, toUpperCase, replaceAll, padStart, split and join',
        'Explain why string methods return a new string instead of changing the old one',
      ],
      sections: [
        {
          heading: 'Length and positions',
          body: [
            'A string is a row of characters. Its `length` property tells you how many there are, and square brackets pick one out by its **index**: its position, counting from `0`. The first character is at index `0`, so the last one is at `length - 1`.',
            'Asking for an index that does not exist is not an error. You just get `undefined`.',
          ],
          examples: [
            {
              id: 'length-index',
              lang: 'js',
              code: `const word = 'JavaScript';
console.log(word.length);
console.log(word[0]);
console.log(word[4]);
console.log(word[word.length - 1]);
console.log(word[20]);`,
              output: ['10', 'J', 'S', 't', 'undefined'],
              caption: 'Ten characters, so the indexes run from 0 to 9.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'The last index is `length - 1`, not `length`. `word[word.length]` is always `undefined`.' }],
        },
        {
          heading: 'Cutting out a piece',
          body: [
            '`slice(start, end)` gives back the characters from `start` up to, but not including, `end`. Leave `end` out to go to the end of the string. A negative number counts back from the end, so `slice(-3)` is the last three characters.',
            'There is also `substring(start, end)`. It works the same way for ordinary numbers, but it quietly treats a negative number as `0`. Because of that, `slice` is the one to reach for.',
          ],
          examples: [
            {
              id: 'slice',
              lang: 'js',
              code: `const text = 'Hello, world';
console.log(text.slice(0, 5));
console.log(text.slice(7));
console.log(text.slice(-5));`,
              output: ['Hello', 'world', 'world'],
              caption: 'Index 0 up to but not including 5, then from 7 to the end, then the last five.',
            },
            {
              id: 'slice-vs-substring',
              lang: 'js',
              code: `console.log('abcdef'.slice(1, 3));
console.log('abcdef'.slice(-2));
console.log('abcdef'.substring(-2));`,
              output: ['bc', 'ef', 'abcdef'],
              caption: 'The negative number means "from the end" for `slice`, and "from the start" for `substring`.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'The end index is not included. `slice(1, 3)` gives two characters, not three.' }],
        },
        {
          heading: 'Searching inside a string',
          body: [
            '`indexOf(piece)` gives the index where the piece first appears, or `-1` when it is not there. When you only need a yes or no, use `includes(piece)`, which gives `true` or `false`. `startsWith` and `endsWith` check just the beginning or the end.',
            'All of these care about capital letters: `"Ada"` does not include `"ada"`. The index from `indexOf` pairs nicely with `slice`, to cut a string around a character you found.',
          ],
          examples: [
            {
              id: 'search',
              lang: 'js',
              code: `const email = 'ada@example.com';
console.log(email.indexOf('@'));
console.log(email.indexOf('z'));
console.log(email.includes('@'));
console.log(email.startsWith('ada'));
console.log(email.endsWith('.org'));
console.log(email.includes('ADA'));`,
              output: ['3', '-1', 'true', 'true', 'false', 'false'],
            },
            {
              id: 'find-and-slice',
              lang: 'js',
              code: `const email = 'ada@example.com';
const at = email.indexOf('@');
console.log(email.slice(0, at));
console.log(email.slice(at + 1));`,
              output: ['ada', 'example.com'],
              caption: 'Everything before the `@`, then everything after it.',
            },
          ],
          notes: [{ kind: 'watch-out', text: '`indexOf` returns `-1` for "not found" and `0` for "found at the very start". Both are surprising in a condition: `0` is falsy and `-1` is truthy. Use `includes` for yes or no questions.' }],
        },
        {
          heading: 'Tidying up text',
          body: [
            '`trim()` removes spaces and line breaks from both ends. It is the first thing to do with anything a user typed. `toUpperCase()` and `toLowerCase()` change the case, which helps when you want to compare text without caring about capitals.',
            '`replace(find, with)` swaps the first match only. `replaceAll(find, with)` swaps every match. Methods can be chained: each one works on the result of the one before.',
          ],
          examples: [
            {
              id: 'trim-case',
              lang: 'js',
              code: `const raw = '   Ada Lovelace  ';
console.log('[' + raw.trim() + ']');
console.log(raw.trim().toUpperCase());
console.log(raw.trim().toLowerCase());`,
              output: ['[Ada Lovelace]', 'ADA LOVELACE', 'ada lovelace'],
              caption: 'The brackets show that the spaces are gone.',
            },
            {
              id: 'replace',
              lang: 'js',
              code: `const sentence = 'red car, red bike';
console.log(sentence.replace('red', 'blue'));
console.log(sentence.replaceAll('red', 'blue'));`,
              output: ['blue car, red bike', 'blue car, blue bike'],
            },
          ],
          notes: [{ kind: 'watch-out', text: '`replace` with a plain piece of text changes only the first match. If you mean "every match", write `replaceAll`.' }],
        },
        {
          heading: 'Splitting and joining',
          body: [
            '`split(separator)` cuts a string at every separator and gives back a list of the pieces. This list is called an **array**: values in square brackets, picked out by index just like characters. You will meet arrays properly later, and for now you only need `[0]`, `[1]` and so on, plus their own `length`.',
            '`join(glue)` does the opposite: it glues the pieces of an array into one string, with `glue` between them. Split then join is a handy way to replace one separator with another.',
          ],
          examples: [
            {
              id: 'split-join',
              lang: 'js',
              code: `const csv = 'red,green,blue';
const colors = csv.split(',');
console.log(colors);
console.log(colors[1], colors.length);
console.log(colors.join(' / '));`,
              output: ["[ 'red', 'green', 'blue' ]", 'green 3', 'red / green / blue'],
              caption: 'Three pieces, so the indexes are 0, 1 and 2.',
            },
            {
              id: 'split-words',
              lang: 'js',
              code: `const title = 'the quick brown fox';
console.log(title.split(' ').length);
console.log(title.split(' ').join('-'));
console.log('stressed'.split('').reverse().join(''));`,
              output: ['4', 'the-quick-brown-fox', 'desserts'],
              caption: 'Splitting on an empty string gives one piece per character. Arrays have a `reverse` method too.',
            },
          ],
        },
        {
          heading: 'Strings never change',
          body: [
            'A string cannot be edited in place. Every string method leaves the original alone and returns a new string. If you call a method and do not keep the result, the work is thrown away, much like a function with no `return`. Writing `name[0] = "A"` does not work either.',
            'So build the new text you need and keep it in a variable. Template literals make this easy, and `padStart(length, fill)` adds fill characters on the left until the string is long enough, which is perfect for numbers like `07` or `0042`. It is a string method, so turn a number into a string first with `String(n)`.',
          ],
          examples: [
            {
              id: 'immutable',
              lang: 'js',
              code: `const name = 'ada';
name.toUpperCase();
console.log(name);
const loud = name.toUpperCase();
console.log(loud);
console.log(name);`,
              output: ['ada', 'ADA', 'ada'],
              caption: 'The first call made an uppercase copy and nobody kept it.',
            },
            {
              id: 'pad-template',
              lang: 'js',
              code: `const hour = 7;
console.log(String(hour).padStart(2, '0') + ':30');
const id = 42;
const label = \`Order #\${String(id).padStart(4, '0')}\`;
console.log(label);`,
              output: ['07:30', 'Order #0042'],
            },
          ],
          notes: [{ kind: 'tip', text: 'When a string method seems to do nothing, check that you saved its result: `text = text.trim()` or `const clean = text.trim()`.' }],
        },
      ],
      recap: [
        '`length` counts characters, and `text[0]` is the first one. The last is `text[text.length - 1]`.',
        '`slice(start, end)` stops before `end`, and a negative number counts from the end.',
        '`indexOf` gives a position or `-1`. `includes`, `startsWith` and `endsWith` give a boolean, and all of them are case sensitive.',
        '`trim`, `toUpperCase`, `replace` (first match), `replaceAll` and `padStart` return reshaped copies of the text.',
        '`split` turns a string into an array of pieces and `join` turns an array back into a string.',
        'Strings never change: a method returns a new string, so keep the result.',
      ],
      checks: [
        {
          id: 'js-strings.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `const s = 'planet';\nconsole.log(s.slice(1, 4), s.length);` },
          options: ['lane 6', 'lan 6', 'pla 6', 'lan 5'],
          answer: 1,
          explanation: 'Index 1 is "l" and `slice` stops before index 4, so it takes "lan". The word has six characters.',
          review: 'js-strings',
          verify: { kind: 'output' },
        },
        {
          id: 'js-strings.c2',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `const word = 'hello';\nword.toUpperCase();\nconsole.log(word);` },
          options: ['HELLO', 'Hello', 'hello', 'undefined'],
          answer: 2,
          explanation: '`toUpperCase` returns a new string, and the result was not saved. The original string never changes, so `word` is still "hello".',
          review: 'js-strings',
          verify: { kind: 'output' },
        },
        {
          id: 'js-strings.c3',
          kind: 'short',
          prompt: 'Type exactly what this prints.',
          code: { lang: 'js', text: `console.log('banana'.indexOf('n'), 'banana'.includes('x'));` },
          accept: ['2 false'],
          explanation: 'The first "n" in "banana" is at index 2 (b, a, n). There is no "x", so `includes` gives false.',
          review: 'js-strings',
          verify: { kind: 'output' },
        },
      ],
      exercises: ['ex-js-strings-mask', 'ex-js-strings-slug'],
    },
  ],
  exam: U1_EXAM,
  bonus: U1_BONUS,
};
