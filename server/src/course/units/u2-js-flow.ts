import type { Unit } from '../types.js';

export const JS_FLOW: Unit = {
  id: 'js-flow',
  track: 'js',
  title: 'Control flow',
  blurb: 'Decide, repeat and recover: conditionals, loops, scope and errors.',
  lessons: [
    {
      id: 'js-conditionals',
      title: 'Making decisions',
      summary: 'Choose what runs with if, else, the ternary and switch, and keep the code flat with early returns.',
      minutes: 12,
      objectives: [
        'Pick one branch with if, else if and else',
        'Write a short choice with the ternary operator',
        'Use switch with break, and explain what fallthrough does',
        'Flatten nested code with guard clauses and early return',
      ],
      sections: [
        {
          heading: 'if, else if and else',
          body: [
            'An `if` runs its block only when the condition is `true`. Add `else if` for more conditions and `else` for everything left over. JavaScript checks from the top and runs the first block whose condition is true, then skips the rest.',
            'The condition is any expression that gives a boolean, such as `temperature < 10` or `isReady && count > 0`.',
          ],
          examples: [
            {
              id: 'if-chain',
              lang: 'js',
              code: `const temperature = 22;
if (temperature < 10) {
  console.log('Wear a coat');
} else if (temperature < 20) {
  console.log('Wear a jacket');
} else {
  console.log('T-shirt weather');
}`,
              output: ['T-shirt weather'],
              caption: 'Both earlier conditions are false, so the else block runs.',
            },
          ],
        },
        {
          heading: 'The order of the branches matters',
          body: [
            'Because the first true condition wins, a broad condition placed too early hides the narrow ones after it. Put the most specific check first.',
          ],
          examples: [
            {
              id: 'order-bug',
              lang: 'js',
              code: `const score = 95;
if (score >= 60) {
  console.log('Pass');
} else if (score >= 90) {
  console.log('Distinction');
}`,
              output: ['Pass'],
              caption: '95 is also at least 90, but that branch is never reached.',
            },
            {
              id: 'order-fixed',
              lang: 'js',
              code: `const score = 95;
if (score >= 90) {
  console.log('Distinction');
} else if (score >= 60) {
  console.log('Pass');
}`,
              output: ['Distinction'],
            },
          ],
          notes: [{ kind: 'watch-out', text: 'When a branch never seems to run, check whether an earlier condition is already catching the value.' }],
        },
        {
          heading: 'The ternary operator',
          body: [
            'When you only need to choose between two values, the ternary is shorter: `condition ? valueIfTrue : valueIfFalse`. It is an expression, so it gives you a value you can store or put inside a template literal.',
            'Use it for small choices. If you find yourself nesting ternaries inside ternaries, switch back to `if` and `else`.',
          ],
          examples: [
            {
              id: 'ternary',
              lang: 'js',
              code: `const stock = 0;
const label = stock > 0 ? 'In stock' : 'Sold out';
console.log(label);

const age = 20;
console.log(\`Ticket: \${age < 18 ? 'child' : 'adult'}\`);`,
              output: ['Sold out', 'Ticket: adult'],
            },
          ],
        },
        {
          heading: 'switch, break and fallthrough',
          body: [
            'A `switch` compares one value against several `case` labels using `===`. It jumps to the matching case and keeps running from there. The `default` case handles everything that matched nothing.',
            'Each case should end with `break`. Without it, execution **falls through** into the next case and runs that code too. Stacking two labels with no code between them is the one time fallthrough is useful: both share a block.',
          ],
          examples: [
            {
              id: 'switch-basic',
              lang: 'js',
              code: `const day = 'sat';
switch (day) {
  case 'sat':
  case 'sun':
    console.log('Weekend');
    break;
  case 'fri':
    console.log('Almost there');
    break;
  default:
    console.log('Weekday');
}`,
              output: ['Weekend'],
              caption: 'Two labels, one block.',
            },
            {
              id: 'switch-fallthrough',
              lang: 'js',
              code: `const level = 1;
switch (level) {
  case 1:
    console.log('one');
  case 2:
    console.log('two');
    break;
  case 3:
    console.log('three');
}`,
              output: ['one', 'two'],
              caption: 'The missing break after case 1 lets it run into case 2.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'A forgotten `break` is silent: nothing errors, the extra lines just run. When two cases print or return the wrong thing together, look for it.' }],
        },
        {
          heading: 'Guard clauses and early return',
          body: [
            'A function can `return` as soon as it knows the answer. Start with the bad inputs, return right away for each, and leave the normal case for last. These checks are called **guard clauses**.',
            'The alternative is wrapping the normal case in `if` after `if`, so the real work ends up indented three levels deep. Guards keep the main path flat and easy to read.',
          ],
          examples: [
            {
              id: 'guards',
              lang: 'js',
              code: `function shippingCost(weight) {
  if (weight <= 0) {
    return 'invalid';
  }
  if (weight > 20) {
    return 'too heavy';
  }
  return weight * 2;
}

console.log(shippingCost(0));
console.log(shippingCost(25));
console.log(shippingCost(5));`,
              output: ['invalid', 'too heavy', '10'],
              caption: 'Each guard returns early. The last line only runs for a valid weight.',
            },
          ],
        },
      ],
      recap: [
        '`if`, `else if` and `else` run the first block whose condition is true. Order the checks from most specific to most general.',
        'The ternary `a ? b : c` picks one of two values. Keep it for small choices.',
        '`switch` compares with `===`. End each case with `break`, or it falls through into the next one.',
        'Guard clauses return early for bad input, so the normal case stays flat at the bottom.',
      ],
      checks: [
        {
          id: 'js-conditionals.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: {
            lang: 'js',
            text: `const n = 15;
if (n > 5) {
  console.log('A');
} else if (n > 10) {
  console.log('B');
} else {
  console.log('C');
}`,
          },
          options: ['C', 'B', 'A', 'A B'],
          answer: 2,
          explanation: '15 is greater than 5, so the first block runs and the rest are skipped, even though `n > 10` is also true.',
          review: 'js-conditionals',
          verify: { kind: 'output' },
        },
        {
          id: 'js-conditionals.c2',
          kind: 'short',
          prompt: 'Type the two lines this prints, separated by a space.',
          code: {
            lang: 'js',
            text: `const code = 2;
switch (code) {
  case 1:
    console.log('a');
  case 2:
    console.log('b');
  case 3:
    console.log('c');
    break;
  case 4:
    console.log('d');
}`,
          },
          accept: ['b c'],
          explanation: 'It jumps to `case 2` and prints b. There is no break there, so it falls through into `case 3`, prints c, and stops at that break.',
          review: 'js-conditionals',
          verify: { kind: 'output' },
        },
        {
          id: 'js-conditionals.c3',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: {
            lang: 'js',
            text: `function check(n) {
  if (n < 0) {
    return 'negative';
  }
  console.log('checked');
  return 'ok';
}
console.log(check(-1));`,
          },
          options: ['checked ok', 'negative', 'checked negative', 'ok'],
          answer: 1,
          explanation: 'The guard returns straight away for -1, so the `console.log(\'checked\')` line never runs. Only the returned text is printed.',
          review: 'js-conditionals',
          verify: { kind: 'output' },
        },
      ],
      exercises: ['ex-js-conditionals', 'ex-js-conditionals-switch'],
    },
    {
      id: 'js-loops',
      title: 'Repeating work with loops',
      summary: 'Repeat code with for, while and for...of, steer a loop with break and continue, and avoid off-by-one mistakes.',
      minutes: 15,
      objectives: [
        'Write for, while and do...while loops',
        'Loop over the values of a list or string with for...of',
        'Explain why for...in is for object keys and not for arrays',
        'Build a result with the accumulator pattern',
        'Spot and fix an off-by-one error',
      ],
      sections: [
        {
          heading: 'The for loop',
          body: [
            'A `for` loop has three parts in its parentheses: a start (`let i = 0`), a condition checked before every round (`i < 3`), and a step run after every round (`i++`, which means add 1). The loop repeats while the condition is true.',
            'The counter is called `i` by habit. Count from 0, since that is how lists are numbered in JavaScript.',
          ],
          examples: [
            {
              id: 'for',
              lang: 'js',
              code: `for (let i = 0; i < 3; i++) {
  console.log('Round', i);
}`,
              output: ['Round 0', 'Round 1', 'Round 2'],
              caption: 'Three rounds: i is 0, 1 and 2. When i reaches 3 the condition fails.',
            },
          ],
        },
        {
          heading: 'while and do...while',
          body: [
            'Use `while` when you do not know in advance how many rounds you need. It checks the condition first, so it may run zero times. The body must change something that the condition looks at, or the loop never ends.',
            '`do...while` runs the body first and checks afterwards, so it always runs at least once.',
          ],
          examples: [
            {
              id: 'while',
              lang: 'js',
              code: `let balance = 100;
while (balance > 30) {
  balance = balance - 25;
}
console.log(balance);`,
              output: ['25'],
              caption: '100, 75, 50, then 25. At 25 the condition is false.',
            },
            {
              id: 'do-while',
              lang: 'js',
              code: `let tries = 0;
do {
  tries++;
  console.log('Attempt', tries);
} while (tries < 0);`,
              output: ['Attempt 1'],
              caption: 'The condition is false from the start, but the body still runs once.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'A loop that never changes what its condition checks runs forever and freezes the program. If a loop hangs, look at the variable in the condition.' }],
        },
        {
          heading: 'for...of and for...in',
          body: [
            'When you want each value of a collection, `for...of` is the cleanest loop: no counter, no index. It works on strings and on arrays. An array is an ordered list written in square brackets, like `[4, 9, 2]`. You will meet arrays properly in the next unit.',
            '`for...in` is different: it gives you the **keys** of an object, such as its property names. Use it for objects. Do not use it on arrays: it gives the positions as strings (`"0"`, `"1"`), not the values.',
          ],
          examples: [
            {
              id: 'for-of',
              lang: 'js',
              code: `const prices = [4, 9, 2];
for (const price of prices) {
  console.log(price);
}
for (const letter of 'cat') {
  console.log(letter);
}`,
              output: ['4', '9', '2', 'c', 'a', 't'],
            },
            {
              id: 'for-in-object',
              lang: 'js',
              code: `const stock = { apples: 3, pears: 0 };
for (const name in stock) {
  console.log(name, stock[name]);
}`,
              output: ['apples 3', 'pears 0'],
              caption: 'for...in visits each property name of the object.',
            },
            {
              id: 'for-in-array',
              lang: 'js',
              code: `const letters = ['a', 'b'];
for (const key in letters) {
  console.log(key, typeof key);
}`,
              output: ['0 string', '1 string'],
              caption: 'Not the letters, and the positions are strings. Use for...of here.',
            },
          ],
        },
        {
          heading: 'break and continue',
          body: [
            '`break` leaves the loop completely. `continue` skips the rest of the current round and moves on to the next one.',
            'Use `break` when you have found what you were looking for, and `continue` to skip values you do not want.',
          ],
          examples: [
            {
              id: 'break-continue',
              lang: 'js',
              code: `for (let i = 1; i <= 6; i++) {
  if (i === 2) {
    continue;
  }
  if (i === 5) {
    break;
  }
  console.log(i);
}`,
              output: ['1', '3', '4'],
              caption: '2 is skipped, and the loop ends at 5 before anything is printed for it.',
            },
          ],
        },
        {
          heading: 'The accumulator pattern',
          body: [
            'Most loops build up one answer. Make a variable before the loop with a sensible starting value (`0` for a sum, `\'\'` for text), update it inside the loop, and use it after the loop. That variable is the **accumulator**.',
            '`total += price` is short for `total = total + price`. If you forget to give the accumulator a starting value, or start it at the wrong one, every result is off.',
          ],
          examples: [
            {
              id: 'accumulator',
              lang: 'js',
              code: `const prices = [4, 9, 2];
let total = 0;
for (const price of prices) {
  total += price;
}
console.log(total);`,
              output: ['15'],
              caption: 'total goes 0, 4, 13, 15.',
            },
          ],
        },
        {
          heading: 'Off-by-one traps',
          body: [
            'The most common loop bug is running one round too many or too few. A list of 3 items has positions 0, 1 and 2, so the last position is `length - 1`. Looping with `i <= length` goes one step too far.',
            'To count the rounds, ask: from the start, until the condition fails, how many values of `i` fit? `i = 1; i < 5` gives 4 rounds. `i = 1; i <= 5` gives 5.',
          ],
          examples: [
            {
              id: 'off-by-one',
              lang: 'js',
              code: `const names = ['Ada', 'Grace', 'Alan'];
for (let i = 0; i <= names.length; i++) {
  console.log(names[i]);
}`,
              output: ['Ada', 'Grace', 'Alan', 'undefined'],
              caption: 'The fourth round reads past the end. Use i < names.length.',
            },
            {
              id: 'count-rounds',
              lang: 'js',
              code: `let a = 0;
for (let i = 1; i < 5; i++) {
  a++;
}
let b = 0;
for (let i = 1; i <= 5; i++) {
  b++;
}
console.log(a, b);`,
              output: ['4 5'],
            },
          ],
          notes: [{ kind: 'tip', text: 'Not sure about a loop? Trace the first and last round by hand with real numbers. Bounds errors show up there.' }],
        },
      ],
      recap: [
        'A `for` loop has a start, a condition and a step. It repeats while the condition is true.',
        '`while` checks first and may never run. `do...while` runs the body once before checking.',
        'Use `for...of` for the values of a list or string, and `for...in` for the keys of an object, not for arrays.',
        '`break` ends the loop. `continue` skips to the next round.',
        'An accumulator is a variable you start before the loop, update inside it and read after it.',
        'To avoid off-by-one errors, remember a list of `n` items has positions 0 to `n - 1`.',
      ],
      checks: [
        {
          id: 'js-loops.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: {
            lang: 'js',
            text: `let n = 10;
let steps = 0;
while (n > 1) {
  n = n - 3;
  steps++;
}
console.log(steps);`,
          },
          options: ['3', '2', '4', '10'],
          answer: 0,
          explanation: 'n goes 10, 7, 4, 1. After the third subtraction n is 1, and `1 > 1` is false, so the loop stops after 3 rounds.',
          review: 'js-loops',
          verify: { kind: 'output' },
        },
        {
          id: 'js-loops.c2',
          kind: 'short',
          prompt: 'What number does this print?',
          code: {
            lang: 'js',
            text: `let total = 0;
for (let i = 1; i <= 5; i++) {
  if (i % 2 === 0) {
    continue;
  }
  total += i;
}
console.log(total);`,
          },
          accept: ['9'],
          explanation: '`continue` skips the even values of i, so only 1, 3 and 5 are added: 1 + 3 + 5 = 9.',
          review: 'js-loops',
          verify: { kind: 'output' },
        },
        {
          id: 'js-loops.c3',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: {
            lang: 'js',
            text: `const colors = ['red', 'blue'];
for (const c in colors) {
  console.log(c);
}`,
          },
          options: ['red blue', '1 2', '0 1', 'undefined'],
          answer: 2,
          explanation: '`for...in` gives the keys, and for an array the keys are the positions 0 and 1. Use `for...of` to get "red" and "blue".',
          review: 'js-loops',
          verify: { kind: 'output' },
        },
      ],
      exercises: ['ex-js-loops', 'ex-js-loops-stop'],
    },
    {
      id: 'js-scope',
      title: 'Scope and closures',
      summary: 'Know where a name can be used, why shadowing and hoisting behave as they do, and how a function remembers a variable.',
      minutes: 14,
      objectives: [
        'Explain block scope for let and const',
        'Tell which variable wins when two share a name (shadowing)',
        'Describe hoisting and the temporal dead zone',
        'Write a closure and a counter factory',
      ],
      sections: [
        {
          heading: 'Block scope',
          body: [
            '**Scope** is the part of the code where a name can be used. A name made with `let` or `const` lives only inside the nearest pair of curly braces, and in the loop or function it belongs to. Outside that block it does not exist.',
            'This keeps names from leaking and clashing. A `for` loop\'s `let i` also lives only inside the loop.',
          ],
          examples: [
            {
              id: 'block-ok',
              lang: 'js',
              code: `if (true) {
  const message = 'inside';
  console.log(message);
}`,
              output: ['inside'],
            },
            {
              id: 'block-error',
              lang: 'js',
              code: `if (true) {
  const message = 'inside';
}
console.log(message);`,
              runtimeError: 'ReferenceError: message is not defined',
              caption: 'Outside the braces the name is gone.',
            },
          ],
        },
        {
          heading: 'Function scope and shadowing',
          body: [
            'Names made inside a function belong to that function. Code inside a function can also read names from the scopes around it, so a function can use a `const` defined outside it.',
            'If an inner scope declares a name that already exists outside, the inner one **shadows** the outer one: inside, the name means the new variable. The outer variable is untouched.',
          ],
          examples: [
            {
              id: 'outer-visible',
              lang: 'js',
              code: `const currency = '$';
function label(price) {
  return currency + price;
}
console.log(label(5));`,
              output: ['$5'],
            },
            {
              id: 'shadowing',
              lang: 'js',
              code: `const rate = 0.2;
function tax(price) {
  const rate = 0.1;
  return price * rate;
}
console.log(tax(100));
console.log(rate);`,
              output: ['10', '0.2'],
              caption: 'The inner `rate` hides the outer one only inside the function.',
            },
          ],
          notes: [{ kind: 'tip', text: 'Shadowing is legal but confusing. Choose a different name unless you mean it.' }],
        },
        {
          heading: 'Hoisting and the temporal dead zone',
          body: [
            'Before a scope runs, JavaScript sets up its names. This is called **hoisting**. A function declaration is ready to use from the top of its scope, so you can call it before the line where it is written.',
            'A `let` or `const` is hoisted too, but it cannot be used until its line has run. The stretch between the start of the scope and that line is the **temporal dead zone**, and touching the name there is a `ReferenceError`. The old `var` is hoisted differently: it exists from the start with the value `undefined`, which hides the mistake.',
          ],
          examples: [
            {
              id: 'hoist-function',
              lang: 'js',
              code: `console.log(double(4));
function double(n) {
  return n * 2;
}`,
              output: ['8'],
            },
            {
              id: 'tdz',
              lang: 'js',
              code: `console.log(count);
let count = 3;`,
              runtimeError: "ReferenceError: Cannot access 'count' before initialization",
              caption: 'The name exists, but it is not ready until line 2 has run.',
            },
            {
              id: 'var-hoist',
              lang: 'js',
              code: `console.log(total);
var total = 5;
console.log(total);`,
              output: ['undefined', '5'],
              caption: 'With var the mistake is silent. Another reason to prefer let and const.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'Declare a variable before the code that uses it. Then hoisting never matters.' }],
        },
        {
          heading: 'Closures: a function that remembers',
          body: [
            'A function can be returned from another function like any other value. The returned function keeps access to the variables that were around it when it was created, even after the outer function has finished. That remembering is called a **closure**.',
            'Below, `makeGreeter` has ended by the time `sayHello` is called, yet `sayHello` still knows the greeting.',
          ],
          examples: [
            {
              id: 'closure',
              lang: 'js',
              code: `function makeGreeter(greeting) {
  return function (name) {
    return greeting + ', ' + name;
  };
}
const sayHello = makeGreeter('Hello');
const sayHi = makeGreeter('Hi');
console.log(sayHello('Ada'));
console.log(sayHi('Ada'));`,
              output: ['Hello, Ada', 'Hi, Ada'],
              caption: 'Each call to makeGreeter makes a fresh greeting for its own function to remember.',
            },
          ],
        },
        {
          heading: 'A counter factory',
          body: [
            'A closure does not copy the variable, it keeps the variable itself. So the inner function can change it, and the change is still there on the next call. Each call to the factory makes a new variable, so counters do not affect each other.',
            'Nothing outside can reach `count` directly. The only way to change it is through the function you were given.',
          ],
          examples: [
            {
              id: 'counter',
              lang: 'js',
              code: `function makeCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}
const a = makeCounter();
const b = makeCounter();
console.log(a());
console.log(a());
console.log(b());
console.log(typeof count);`,
              output: ['1', '2', '1', 'undefined'],
              caption: 'a and b each have their own count, and the outside code cannot see it.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'Declare the remembered variable in the outer function. If you put `let count = 0` inside the returned function, it starts again from 0 on every call.' }],
        },
      ],
      recap: [
        '`let` and `const` are block scoped: they exist only inside the braces where they are declared.',
        'Inner code can read outer names. An inner name that matches an outer one shadows it, without changing it.',
        'Function declarations are hoisted. Using a `let` or `const` before its line is a `ReferenceError` (the temporal dead zone).',
        'A closure is a function that keeps access to the variables around where it was created.',
        'A counter factory keeps its state in a variable of the outer function, so every counter has its own.',
      ],
      checks: [
        {
          id: 'js-scope.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: {
            lang: 'js',
            text: `const x = 1;
function show() {
  const x = 2;
  console.log(x);
}
show();
console.log(x);`,
          },
          options: ['1 1', '2 2', '2 1', '1 2'],
          answer: 2,
          explanation: 'Inside `show`, the new `x` shadows the outer one, so it prints 2. The outer `x` was never changed, so the last line prints 1.',
          review: 'js-scope',
          verify: { kind: 'output' },
        },
        {
          id: 'js-scope.c2',
          kind: 'short',
          prompt: 'What number does this print?',
          code: {
            lang: 'js',
            text: `function makeCounter() {
  let n = 0;
  return function () {
    n++;
    return n;
  };
}
const c = makeCounter();
c();
c();
console.log(c());`,
          },
          accept: ['3'],
          explanation: 'The counter keeps its own `n`. The calls bring it to 1, then 2, then the third call returns 3.',
          review: 'js-scope',
          verify: { kind: 'output' },
        },
        {
          id: 'js-scope.c3',
          kind: 'mcq',
          prompt: 'What happens when this runs?',
          code: {
            lang: 'js',
            text: `console.log(total);
let total = 5;`,
          },
          options: ['It throws a ReferenceError', 'It prints undefined', 'It prints 5', 'It throws a TypeError'],
          answer: 0,
          explanation: 'A `let` variable cannot be read before its declaration line runs (the temporal dead zone). Only `var` would give `undefined`.',
          review: 'js-scope',
          verify: { kind: 'throws', message: 'ReferenceError' },
        },
      ],
      exercises: ['ex-js-scope'],
    },
    {
      id: 'js-errors',
      title: 'Errors: throwing and catching',
      summary: 'Raise errors with throw, handle them with try, catch and finally, and know what happens when nothing catches one.',
      minutes: 14,
      objectives: [
        'Handle a failure with try, catch and finally',
        'Throw an Error and read its name and message',
        'Choose between Error, TypeError and RangeError',
        'Rethrow an error you cannot handle',
        'Explain what happens to an error nobody catches',
      ],
      sections: [
        {
          heading: 'try, catch and finally',
          body: [
            'Some operations can fail, for example turning text into data with `JSON.parse`, which throws when the text is not valid JSON. Put the risky code in a `try` block. If something inside throws, JavaScript jumps straight to the `catch` block, skipping the rest of the `try`.',
            'A `finally` block runs afterwards whether or not there was an error. It is the place for cleanup.',
          ],
          examples: [
            {
              id: 'try-catch-finally',
              lang: 'js',
              code: `try {
  const data = JSON.parse('{ not valid');
  console.log(data);
} catch (error) {
  console.log('Could not read it');
} finally {
  console.log('Done');
}`,
              output: ['Could not read it', 'Done'],
              caption: 'The log inside try never runs, because parse threw first.',
            },
            {
              id: 'finally-return',
              lang: 'js',
              code: `function read() {
  try {
    return 'value';
  } finally {
    console.log('cleanup');
  }
}
console.log(read());`,
              output: ['cleanup', 'value'],
              caption: 'finally runs even when the try block returns.',
            },
          ],
        },
        {
          heading: 'Throwing your own errors',
          body: [
            'You raise an error with `throw`. Create it with `new Error(message)`. Throwing stops the current function at once, just like `return`, but the error travels up to the nearest `catch` instead of coming back as a value.',
            'Throw when a function is given something it cannot work with, so the mistake is loud and early instead of a wrong answer later.',
          ],
          examples: [
            {
              id: 'throw',
              lang: 'js',
              code: `function setAge(age) {
  if (age < 0) {
    throw new Error('age cannot be negative');
  }
  return age;
}
try {
  setAge(-3);
  console.log('not reached');
} catch (error) {
  console.log(error.message);
}`,
              output: ['age cannot be negative'],
            },
          ],
        },
        {
          heading: 'Error types, name and message',
          body: [
            'An error object has a `name` and a `message`. `Error` is the general kind. Two common specific kinds are `TypeError` (a value is the wrong type, like calling something that is not a function) and `RangeError` (a value is the right type but outside the allowed range). JavaScript throws them itself, and you can throw them too.',
            'Pick the most specific type that fits. Code that catches the error can then tell the cases apart with `error.name` or `error instanceof RangeError`.',
          ],
          examples: [
            {
              id: 'builtin-errors',
              lang: 'js',
              code: `try {
  'ab'.repeat(-1);
} catch (error) {
  console.log(error.name + ': ' + error.message);
}

try {
  const total = 5;
  total();
} catch (error) {
  console.log(error.name + ': ' + error.message);
}`,
              output: ['RangeError: Invalid count value: -1', 'TypeError: total is not a function'],
            },
            {
              id: 'custom-types',
              lang: 'js',
              code: `function setAge(age) {
  if (typeof age !== 'number') {
    throw new TypeError('age must be a number');
  }
  if (age < 0) {
    throw new RangeError('age cannot be negative');
  }
  return age;
}
try {
  setAge(-3);
} catch (error) {
  console.log(error.name + ': ' + error.message);
  console.log(error instanceof RangeError);
}`,
              output: ['RangeError: age cannot be negative', 'true'],
            },
          ],
        },
        {
          heading: 'Rethrowing what you cannot handle',
          body: [
            'A `catch` block catches everything thrown in its `try`, including errors you did not expect. Handle only the ones you know how to deal with, and `throw error` again for the rest, so a real bug is not swallowed.',
          ],
          examples: [
            {
              id: 'rethrow',
              lang: 'js',
              code: `function parseAge(text) {
  try {
    const age = JSON.parse(text);
    if (age < 0) {
      throw new RangeError('age cannot be negative');
    }
    return age;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return 0;
    }
    throw error;
  }
}
console.log(parseAge('oops'));
try {
  parseAge('-5');
} catch (error) {
  console.log('Outer caught:', error.message);
}`,
              output: ['0', 'Outer caught: age cannot be negative'],
              caption: 'Bad text is handled inside. The negative age is passed on to the caller.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'An empty `catch` hides bugs. At the very least handle one known case and rethrow the rest.' }],
        },
        {
          heading: 'When nothing catches it',
          body: [
            'If an error is thrown and no `catch` is waiting, it travels up through every function that called the current one, ending each of them early. If it reaches the top, the program stops and the error is reported. Nothing after the throw runs.',
            'This is why a thrown error is better than a silent wrong answer, and why you put `try` and `catch` at the place that knows what to do about the failure.',
          ],
          examples: [
            {
              id: 'uncaught',
              lang: 'js',
              code: `function load() {
  throw new Error('disk full');
}
console.log('start');
load();
console.log('never printed');`,
              output: ['start'],
              runtimeError: 'Error: disk full',
            },
          ],
        },
      ],
      recap: [
        'Put risky code in `try`. A throw jumps to `catch`, and `finally` always runs afterwards.',
        '`throw new Error(message)` stops the function and sends the error up to the nearest `catch`.',
        'Errors have a `name` and a `message`. Use `TypeError` for a wrong type and `RangeError` for a value out of range.',
        'Handle the errors you expect and rethrow the rest with `throw error`.',
        'An uncaught error ends every function on the way up and stops the program.',
      ],
      checks: [
        {
          id: 'js-errors.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: {
            lang: 'js',
            text: `try {
  console.log('a');
  throw new Error('x');
  console.log('b');
} catch (e) {
  console.log('c');
} finally {
  console.log('d');
}`,
          },
          options: ['a b d', 'a c', 'a b c d', 'a c d'],
          answer: 3,
          explanation: 'It prints a, then the throw jumps to the catch (b is skipped), which prints c, and finally always prints d.',
          review: 'js-errors',
          verify: { kind: 'output' },
        },
        {
          id: 'js-errors.c2',
          kind: 'short',
          prompt: 'What does this print? Type the error name.',
          code: {
            lang: 'js',
            text: `try {
  'x'.repeat(-1);
} catch (error) {
  console.log(error.name);
}`,
          },
          accept: ['RangeError'],
          explanation: '`repeat` needs a count that is zero or more. A negative count is a number, but out of range, so it throws a `RangeError`.',
          review: 'js-errors',
          verify: { kind: 'output' },
        },
        {
          id: 'js-errors.c3',
          kind: 'mcq',
          prompt: 'What does this print before the program stops?',
          code: {
            lang: 'js',
            text: `function risky() {
  throw new RangeError('too big');
}
console.log('start');
risky();
console.log('end');`,
          },
          options: ['start', 'start end', 'end', 'nothing'],
          answer: 0,
          explanation: 'Nothing catches the error, so it ends `risky` and then the whole program. `start` was already printed and `end` is never reached.',
          review: 'js-errors',
          verify: { kind: 'throws', message: 'RangeError: too big' },
        },
      ],
      exercises: ['ex-js-errors', 'ex-js-errors-throw'],
    },
  ],
  exam: [
    {
      id: 'js-flow.e1',
      kind: 'mcq',
      prompt: 'What does this print?',
      code: {
        lang: 'js',
        text: `const hour = 14;
const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
console.log(greeting);`,
      },
      options: ['Morning', 'Afternoon', 'Evening', 'Afternoon Evening'],
      answer: 1,
      explanation: '`14 < 12` is false, so the first ternary moves on to its second part, `14 < 18`, which is true and gives "Afternoon".',
      review: 'js-conditionals',
      verify: { kind: 'output' },
    },
    {
      id: 'js-flow.e2',
      kind: 'short',
      prompt: 'Type the two lines this prints, separated by a space.',
      code: {
        lang: 'js',
        text: `const size = 'M';
switch (size) {
  case 'S':
    console.log('small');
    break;
  case 'M':
    console.log('medium');
  case 'L':
    console.log('large');
    break;
  default:
    console.log('unknown');
}`,
      },
      accept: ['medium large'],
      explanation: 'The `M` case prints medium, has no break, and falls through into the `L` case, which prints large and then breaks.',
      review: 'js-conditionals',
      verify: { kind: 'output' },
    },
    {
      id: 'js-flow.e3',
      kind: 'mcq',
      prompt: 'What does this print?',
      code: {
        lang: 'js',
        text: `let total = 0;
for (let i = 0; i < 4; i++) {
  total += i;
}
console.log(total);`,
      },
      options: ['10', '4', '6', '3'],
      answer: 2,
      explanation: 'i takes the values 0, 1, 2 and 3 (the loop stops when i reaches 4), and 0 + 1 + 2 + 3 = 6.',
      review: 'js-loops',
      verify: { kind: 'output' },
    },
    {
      id: 'js-flow.e4',
      kind: 'mcq',
      prompt: 'Inside a loop, what does `continue` do?',
      options: [
        'Ends the loop completely',
        'Skips the rest of this round and starts the next one',
        'Starts the whole loop again from the beginning',
        'Ends the function that contains the loop',
      ],
      answer: 1,
      explanation: '`continue` abandons only the current round. `break` is the one that ends the loop.',
      review: 'js-loops',
    },
    {
      id: 'js-flow.e5',
      kind: 'mcq',
      prompt: 'What does this print?',
      code: {
        lang: 'js',
        text: `let message = 'outer';
{
  let message = 'inner';
}
console.log(message);`,
      },
      options: ['outer', 'inner', 'undefined', 'ReferenceError'],
      answer: 0,
      explanation: 'The `let` inside the braces is a different variable that exists only in that block. The outer `message` is unchanged.',
      review: 'js-scope',
      verify: { kind: 'output' },
    },
    {
      id: 'js-flow.e6',
      kind: 'short',
      prompt: 'What number does this print?',
      code: {
        lang: 'js',
        text: `function makeAdder(n) {
  return function (x) {
    return x + n;
  };
}
const addFive = makeAdder(5);
console.log(addFive(10));`,
      },
      accept: ['15'],
      explanation: 'The returned function remembers `n` as 5 from the call that made it, so `addFive(10)` is 10 + 5.',
      review: 'js-scope',
      verify: { kind: 'output' },
    },
    {
      id: 'js-flow.e7',
      kind: 'mcq',
      prompt: 'What does this print?',
      code: {
        lang: 'js',
        text: `function run() {
  try {
    return 'try';
  } finally {
    console.log('finally');
  }
}
console.log(run());`,
      },
      options: ['try', 'finally', 'try finally', 'finally try'],
      answer: 3,
      explanation: 'The `finally` block runs before `run` hands back its value, so finally is printed first, and then the returned "try" is printed.',
      review: 'js-errors',
      verify: { kind: 'output' },
    },
    {
      id: 'js-flow.e8',
      kind: 'short',
      prompt: 'What does this print? Type the error name.',
      code: {
        lang: 'js',
        text: `try {
  const total = 10;
  total = 20;
} catch (error) {
  console.log(error.name);
}`,
      },
      accept: ['TypeError'],
      explanation: 'Reassigning a `const` throws a `TypeError` at runtime ("Assignment to constant variable."), and the catch prints its name.',
      review: 'js-errors',
      verify: { kind: 'output' },
    },
  ],
  bonus: [
    {
      id: 'js-flow.b1',
      kind: 'mcq',
      prompt: 'What does this print?',
      code: {
        lang: 'js',
        text: `let saved;
for (let i = 0; i < 3; i++) {
  if (i === 1) {
    saved = function () {
      return i;
    };
  }
}
console.log(saved());`,
      },
      options: ['0', '1', '2', '3'],
      answer: 1,
      explanation: 'A `let` in a `for` header gives every round its own `i`. The function created in round 1 closes over that round\'s `i`, which stays 1.',
      review: 'js-scope',
      verify: { kind: 'output' },
    },
    {
      id: 'js-flow.b2',
      kind: 'mcq',
      prompt: 'What does this print?',
      code: {
        lang: 'js',
        text: `let done = 0;
for (let i = 0; i < 4; i++) {
  try {
    if (i === 2) {
      throw new Error('skip');
    }
    done++;
  } catch (error) {
    continue;
  } finally {
    done += 10;
  }
}
console.log(done);`,
      },
      options: ['3', '13', '43', '40'],
      answer: 2,
      explanation: 'Three rounds add 1 (i = 0, 1, 3). The round with i = 2 throws and continues, but `finally` still runs. All four rounds add 10: 3 + 40 = 43.',
      review: 'js-errors',
      verify: { kind: 'output' },
    },
    {
      id: 'js-flow.b3',
      kind: 'short',
      prompt: 'Type everything this prints, on one line separated by a space.',
      code: {
        lang: 'js',
        text: `function discount(price) {
  if (price < 0) {
    throw new RangeError('negative');
  }
  if (price > 100) {
    return 'big';
  }
  return 'small';
}
try {
  console.log(discount(150));
  console.log(discount(-1));
  console.log(discount(5));
} catch (error) {
  console.log(error.name);
}`,
      },
      accept: ['big RangeError'],
      explanation: '150 passes the first guard and returns big. -1 trips the first guard and throws, which jumps to the catch and prints the name, so `discount(5)` is never called.',
      review: 'js-errors',
      verify: { kind: 'output' },
    },
    {
      id: 'js-flow.b4',
      kind: 'mcq',
      prompt: 'What does this print?',
      code: {
        lang: 'js',
        text: `function test() {
  console.log(typeof a);
  var a = 1;
  console.log(typeof b);
  let b = 2;
}
try {
  test();
} catch (error) {
  console.log(error.name);
}`,
      },
      options: ['undefined undefined', 'number ReferenceError', 'ReferenceError', 'undefined ReferenceError'],
      answer: 3,
      explanation: 'The `var` is hoisted with the value `undefined`, so the first line prints undefined. The `let` is in its temporal dead zone, so even `typeof b` throws a ReferenceError, which the catch prints.',
      review: 'js-scope',
      verify: { kind: 'output' },
    },
  ],
};
