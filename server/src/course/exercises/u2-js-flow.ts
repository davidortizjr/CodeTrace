import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

export const U2_EXERCISES: Problem[] = [
  // ── js-conditionals ───────────────────────────────────────────────────
  {
    id: 'ex-js-conditionals',
    topic: 'js-flow',
    lesson: 'js-conditionals',
    title: 'Ticket price',
    difficulty: 1,
    prompt:
      'Write `ticketPrice(age)` that returns the price of a museum ticket for someone of that age. Under 3 is free (0), ages 3 to 12 pay 8, ages 13 to 64 pay 15, and 65 and over pay 10. A negative age is not a real age, so return -1 for it. Example: `ticketPrice(30)` returns `15`.',
    concept: 'An if / else if chain, checked from the top, with a guard clause for bad input.',
    fn: 'ticketPrice',
    starter: `function ticketPrice(age) {
  // return the price for this age, or -1 for a negative age
}
`,
    reference: `function ticketPrice(age) {
  if (age < 0) {
    return -1;
  }
  if (age < 3) {
    return 0;
  }
  if (age < 13) {
    return 8;
  }
  if (age < 65) {
    return 15;
  }
  return 10;
}`,
    tests: [
      { args: [1], cat: 'basic' },
      { args: [8], cat: 'basic' },
      { args: [30], cat: 'basic' },
      { args: [70], cat: 'basic' },
      { args: [3], cat: 'edge' },
      { args: [13], cat: 'edge' },
      { args: [65], cat: 'edge' },
      { args: [-5], cat: 'edge' },
    ],
    traceArgs: [30],
    track: [],
    variants: [
      v(
        'boundary-three',
        'boundary',
        'A 3 year old is treated as free',
        'The first check uses <= 3, so age 3 gets the free ticket. Free is only for ages under 3, and a 3 year old pays 8.',
        'Use a strict comparison for the first group so that exactly 3 moves on to the next branch.',
        ['Which group does age 3 belong to?', 'Does `3 <= 3` or `3 < 3` match the rule "under 3"?'],
        `function ticketPrice(age) {
  if (age < 0) {
    return -1;
  }
  if (age <= 3) {
    return 0;
  }
  if (age < 13) {
    return 8;
  }
  if (age < 65) {
    return 15;
  }
  return 10;
}`,
      ),
      v(
        'wrong-order',
        'control-flow',
        'The widest condition is checked first',
        'Because `age < 65` is tested before the smaller groups, a child of 8 matches it and gets the adult price. The first true branch wins and the rest are skipped.',
        'Check the narrowest group first and work upwards, so each branch only sees ages the earlier ones did not take.',
        ['Which branch runs for age 8? Walk down from the top.', 'What happens to the later branches once one has matched?'],
        `function ticketPrice(age) {
  if (age < 0) {
    return -1;
  }
  if (age < 65) {
    return 15;
  }
  if (age < 13) {
    return 8;
  }
  if (age < 3) {
    return 0;
  }
  return 10;
}`,
      ),
      v(
        'no-guard',
        'edge-case',
        'A negative age is treated as a baby',
        'Without a check for negative ages, -5 is "under 3" and gets a free ticket instead of -1.',
        'Add a guard at the very top that returns -1 for a negative age.',
        ['Which branch does -5 match?', 'Where should a check for impossible input go: first or last?'],
        `function ticketPrice(age) {
  if (age < 3) {
    return 0;
  }
  if (age < 13) {
    return 8;
  }
  if (age < 65) {
    return 15;
  }
  return 10;
}`,
      ),
      v(
        'no-seniors',
        'no-return',
        'Seniors get no price at all',
        'The last branch only handles ages up to 64 and nothing covers the rest, so for 65 and over the function ends without a return and gives back undefined.',
        'Finish the chain with an `else` or a final `return` that covers every remaining age.',
        ['What does the function return for 70?', 'Which branch should catch everything the others did not?'],
        `function ticketPrice(age) {
  if (age < 0) {
    return -1;
  }
  if (age < 3) {
    return 0;
  }
  if (age < 13) {
    return 8;
  }
  if (age < 65) {
    return 15;
  }
}`,
      ),
    ],
  },
  {
    id: 'ex-js-conditionals-switch',
    topic: 'js-flow',
    lesson: 'js-conditionals',
    title: 'Weekday or weekend',
    difficulty: 2,
    prompt:
      'Write `dayKind(day)` using a `switch`. The day is a short name such as `"mon"` or `"sat"`, in any letter case. Return `"weekend"` for `sat` and `sun`, `"weekday"` for `mon` to `fri`, and `"unknown"` for anything else. Example: `dayKind("Sat")` returns `"weekend"`.',
    concept: 'switch with grouped cases that share one result, and a default for everything else.',
    fn: 'dayKind',
    starter: `function dayKind(day) {
  // use a switch on the lower case day name
}
`,
    reference: `function dayKind(day) {
  switch (day.toLowerCase()) {
    case 'sat':
    case 'sun':
      return 'weekend';
    case 'mon':
    case 'tue':
    case 'wed':
    case 'thu':
    case 'fri':
      return 'weekday';
    default:
      return 'unknown';
  }
}`,
    tests: [
      { args: ['mon'], cat: 'basic' },
      { args: ['sat'], cat: 'basic' },
      { args: ['sun'], cat: 'basic' },
      { args: ['Fri'], cat: 'edge' },
      { args: ['SAT'], cat: 'edge' },
      { args: ['holiday'], cat: 'edge' },
      { args: [''], cat: 'edge' },
    ],
    traceArgs: ['Sat'],
    track: [],
    variants: [
      v(
        'no-lower-case',
        'case-handling',
        'Upper case day names are not recognised',
        'The switch compares the day exactly as given, so "Fri" and "SAT" never match "fri" or "sat" and end up as "unknown".',
        'Convert the day to lower case before the switch looks at it.',
        ['What does `"Fri" === "fri"` give?', 'Which string method changes the letter case?'],
        `function dayKind(day) {
  switch (day) {
    case 'sat':
    case 'sun':
      return 'weekend';
    case 'mon':
    case 'tue':
    case 'wed':
    case 'thu':
    case 'fri':
      return 'weekday';
    default:
      return 'unknown';
  }
}`,
      ),
      v(
        'forgot-sunday',
        'edge-case',
        'Sunday is missing from the weekend',
        'Only `sat` is listed for the weekend, so "sun" falls to the default and is reported as "unknown".',
        'Add a `case` for `sun` that shares the weekend result with `sat`.',
        ['Which case label handles "sun"?', 'How do two cases share one block of code?'],
        `function dayKind(day) {
  switch (day.toLowerCase()) {
    case 'sat':
      return 'weekend';
    case 'mon':
    case 'tue':
    case 'wed':
    case 'thu':
    case 'fri':
      return 'weekday';
    default:
      return 'unknown';
  }
}`,
      ),
      v(
        'no-break',
        'control-flow',
        'Every case falls through to the default',
        'Each case sets the result but has no `break`, so execution keeps running into the next cases and finishes on the default. Every day ends up as "unknown".',
        'End each group of cases with `break` (or `return`) so the switch stops once it has a match.',
        ['What does a switch do after it finishes a matching case that has no break?', 'Which line runs last no matter which day you give?'],
        `function dayKind(day) {
  let kind = '';
  switch (day.toLowerCase()) {
    case 'sat':
    case 'sun':
      kind = 'weekend';
    case 'mon':
    case 'tue':
    case 'wed':
    case 'thu':
    case 'fri':
      kind = 'weekday';
    default:
      kind = 'unknown';
  }
  return kind;
}`,
      ),
      v(
        'no-default',
        'no-return',
        'Other names return nothing',
        'There is no `default` case, so a name that matches nothing leaves the function without a return and it gives back undefined instead of "unknown".',
        'Add a `default` case that returns "unknown".',
        ['What does `dayKind("holiday")` return?', 'Which part of a switch handles "everything else"?'],
        `function dayKind(day) {
  switch (day.toLowerCase()) {
    case 'sat':
    case 'sun':
      return 'weekend';
    case 'mon':
    case 'tue':
    case 'wed':
    case 'thu':
    case 'fri':
      return 'weekday';
  }
}`,
      ),
    ],
  },

  // ── js-loops ──────────────────────────────────────────────────────────
  {
    id: 'ex-js-loops',
    topic: 'js-flow',
    lesson: 'js-loops',
    title: 'Sum the multiples',
    difficulty: 1,
    prompt:
      'Write `sumMultiples(limit, step)` that adds up every multiple of `step` from `step` up to and including `limit`. Use a loop and a `total` that grows. Example: `sumMultiples(10, 3)` returns `18` (3 + 6 + 9). If no multiple fits, the answer is 0.',
    concept: 'A for loop with an accumulator, and an upper bound that includes the limit.',
    fn: 'sumMultiples',
    starter: `function sumMultiples(limit, step) {
  let total = 0;
  // loop over the multiples and add each one to total
}
`,
    reference: `function sumMultiples(limit, step) {
  let total = 0;
  for (let i = step; i <= limit; i += step) {
    total += i;
  }
  return total;
}`,
    tests: [
      { args: [10, 3], cat: 'basic' },
      { args: [20, 4], cat: 'basic' },
      { args: [9, 3], cat: 'edge' },
      { args: [5, 5], cat: 'edge' },
      { args: [4, 5], cat: 'edge' },
      { args: [1, 1], cat: 'edge' },
      { args: [100, 7], cat: 'large' },
    ],
    traceArgs: [10, 3],
    track: ['total'],
    variants: [
      v(
        'off-by-one-limit',
        'off-by-one',
        'The limit itself is left out',
        'The loop condition is `i < limit`, so when the limit is a multiple (like 9 with step 3) it is never added. The loop stops one multiple too early.',
        'The limit counts too, so keep looping while `i` is less than or equal to it.',
        ['What does `sumMultiples(9, 3)` give, and what should it give?', 'Which comparison lets the loop run when `i` equals `limit`?'],
        `function sumMultiples(limit, step) {
  let total = 0;
  for (let i = step; i < limit; i += step) {
    total += i;
  }
  return total;
}`,
      ),
      v(
        'adds-every-number',
        'logic',
        'Adds every number instead of every multiple',
        'The loop steps by 1, so it adds 1, 2, 3 and so on up to the limit. The step should decide which numbers are visited.',
        'Make the loop move forward by `step` each time instead of by 1.',
        ['What numbers does `i` take in your loop for (10, 3)?', 'Which part of the for header controls how far `i` moves?'],
        `function sumMultiples(limit, step) {
  let total = 0;
  for (let i = step; i <= limit; i++) {
    total += i;
  }
  return total;
}`,
      ),
      v(
        'bad-start',
        'bad-init',
        'The total does not start at zero',
        'The accumulator starts at 1, so every answer is one too big.',
        'An accumulator that adds up numbers must start at 0.',
        ['What is `total` before the loop adds anything?', 'What should a sum of nothing be?'],
        `function sumMultiples(limit, step) {
  let total = 1;
  for (let i = step; i <= limit; i += step) {
    total += i;
  }
  return total;
}`,
      ),
      v(
        'counts-instead',
        'wrong-operator',
        'Counts the multiples instead of adding them',
        'The total goes up by 1 each round, so it holds how many multiples there are (3 for the first example) and not their sum (18).',
        'Add the current multiple `i` to the total, not the number 1.',
        ['What is added to `total` in each round?', 'Which variable holds the multiple the loop is on?'],
        `function sumMultiples(limit, step) {
  let total = 0;
  for (let i = step; i <= limit; i += step) {
    total += 1;
  }
  return total;
}`,
      ),
    ],
  },
  {
    id: 'ex-js-loops-stop',
    topic: 'js-flow',
    lesson: 'js-loops',
    title: 'Stop at the limit',
    difficulty: 2,
    prompt:
      'Write `sumUntilLimit(numbers, limit)` that adds the numbers in order but stops as soon as the next number would push the total above `limit`. Return the total so far. A total equal to the limit is allowed. Example: `sumUntilLimit([4, 5, 3, 1], 10)` returns `9`, because adding 3 would make 12 and the loop stops there (the 1 is never added).',
    concept: 'for...of with break to leave the loop early, and an accumulator that holds the answer.',
    fn: 'sumUntilLimit',
    starter: `function sumUntilLimit(numbers, limit) {
  let total = 0;
  // go through the numbers, stop when the next one would go over the limit
}
`,
    reference: `function sumUntilLimit(numbers, limit) {
  let total = 0;
  for (const n of numbers) {
    if (total + n > limit) {
      break;
    }
    total += n;
  }
  return total;
}`,
    tests: [
      { args: [[4, 5, 3, 1], 10], cat: 'basic' },
      { args: [[1, 2, 3], 100], cat: 'basic' },
      { args: [[4, 6, 1], 10], cat: 'edge' },
      { args: [[20, 1], 10], cat: 'edge' },
      { args: [[], 5], cat: 'edge' },
      { args: [[3, 3, 3, 3], 9], cat: 'edge' },
      { args: [[2, 2, 2, 2, 2, 2, 2, 2, 2, 2], 7], cat: 'large' },
    ],
    traceArgs: [[4, 5, 3, 1], 10],
    track: ['total'],
    variants: [
      v(
        'continue-instead',
        'control-flow',
        'Skips the big number but keeps going',
        'Using `continue` only skips the one number that does not fit. The loop carries on and adds later small numbers, so [4, 5, 3, 1] gives 10 and not 9.',
        'You want to leave the loop for good, so use `break` instead of `continue`.',
        ['What happens to the 1 at the end of the list in your loop?', 'What is the difference between `break` and `continue`?'],
        `function sumUntilLimit(numbers, limit) {
  let total = 0;
  for (const n of numbers) {
    if (total + n > limit) {
      continue;
    }
    total += n;
  }
  return total;
}`,
      ),
      v(
        'strict-limit',
        'boundary',
        'Stops when the total reaches the limit exactly',
        'The check uses `>=`, so a total that lands exactly on the limit is refused. [4, 6, 1] with limit 10 stops at 4 instead of reaching 10.',
        'A total equal to the limit is allowed, so only stop when the sum would be strictly greater.',
        ['Should 4 + 6 = 10 be accepted when the limit is 10?', 'Which comparison is true only when the sum is above the limit?'],
        `function sumUntilLimit(numbers, limit) {
  let total = 0;
  for (const n of numbers) {
    if (total + n >= limit) {
      break;
    }
    total += n;
  }
  return total;
}`,
      ),
      v(
        'adds-then-checks',
        'logic',
        'Adds the number before checking the limit',
        'The number is added first and the limit is checked afterwards, so the total goes over the limit by one number (12 for the first example) before the loop stops.',
        'Check whether the next number fits before you add it to the total.',
        ['What is `total` when your loop breaks for [4, 5, 3, 1]?', 'Which should come first: the check or the addition?'],
        `function sumUntilLimit(numbers, limit) {
  let total = 0;
  for (const n of numbers) {
    total += n;
    if (total > limit) {
      break;
    }
  }
  return total;
}`,
      ),
      v(
        'no-return',
        'no-return',
        'The total is never returned',
        'The loop builds the right total but the function ends without returning it, so the answer is undefined.',
        'Return `total` after the loop.',
        ['What does the function give back after the loop ends?'],
        `function sumUntilLimit(numbers, limit) {
  let total = 0;
  for (const n of numbers) {
    if (total + n > limit) {
      break;
    }
    total += n;
  }
}`,
      ),
    ],
  },

  // ── js-scope ──────────────────────────────────────────────────────────
  {
    id: 'ex-js-scope',
    topic: 'js-flow',
    lesson: 'js-scope',
    title: 'A counter that remembers',
    difficulty: 2,
    prompt:
      'Write `countFrom(start, step, calls)`. Inside it, create a variable `current` that begins at `start`, and an inner function `next()` that returns the current value and then moves `current` forward by `step`. Call `next()` `calls` times and return the values as one text separated by spaces. Example: `countFrom(5, 2, 3)` returns `"5 7 9"`. With 0 calls the answer is an empty string.',
    concept: 'A closure: the inner function keeps using the variable of the function around it between calls.',
    fn: 'countFrom',
    starter: `function countFrom(start, step, calls) {
  let current = start;
  // write an inner function next() that uses current,
  // call it \`calls\` times and build the text "5 7 9"
}
`,
    reference: `function countFrom(start, step, calls) {
  let current = start;
  function next() {
    const value = current;
    current += step;
    return value;
  }
  let text = '';
  for (let i = 0; i < calls; i++) {
    text += next() + ' ';
  }
  return text.trim();
}`,
    tests: [
      { args: [5, 2, 3], cat: 'basic' },
      { args: [0, 1, 4], cat: 'basic' },
      { args: [10, 5, 1], cat: 'basic' },
      { args: [3, 3, 0], cat: 'edge' },
      { args: [-4, 2, 4], cat: 'edge' },
      { args: [100, -25, 5], cat: 'edge' },
      { args: [1, 10, 8], cat: 'large' },
    ],
    traceArgs: [5, 2, 3],
    track: ['current'],
    variants: [
      v(
        'local-copy',
        'logic',
        'The counter starts again on every call',
        'The variable is declared inside `next`, so each call makes a fresh copy from `start` and the count never moves on. Every call returns the start value.',
        'Declare `current` once in the outer function, outside `next`, so the inner function shares it between calls.',
        ['Where is `current` created in your code, and how often does that line run?', 'Which scope lives as long as the outer function?'],
        `function countFrom(start, step, calls) {
  function next() {
    let current = start;
    const value = current;
    current += step;
    return value;
  }
  let text = '';
  for (let i = 0; i < calls; i++) {
    text += next() + ' ';
  }
  return text.trim();
}`,
      ),
      v(
        'moves-first',
        'off-by-one',
        'The start value is skipped',
        'The counter moves forward before it returns, so the first value is start + step and the start itself never appears.',
        'Remember the current value, then move forward, and return the remembered value.',
        ['What does the first call of `next()` return in your code?', 'Which should happen first: reading the value or moving on?'],
        `function countFrom(start, step, calls) {
  let current = start;
  function next() {
    current += step;
    return current;
  }
  let text = '';
  for (let i = 0; i < calls; i++) {
    text += next() + ' ';
  }
  return text.trim();
}`,
      ),
      v(
        'ignores-step',
        'wrong-operator',
        'Always counts up by one',
        'The counter uses `current++`, which adds 1 whatever the step is, so countFrom(5, 2, 3) gives "5 6 7".',
        'Add `step` to `current` instead of adding 1.',
        ['By how much does `current` grow in each call?', 'Which parameter says how big the jump is?'],
        `function countFrom(start, step, calls) {
  let current = start;
  function next() {
    const value = current;
    current++;
    return value;
  }
  let text = '';
  for (let i = 0; i < calls; i++) {
    text += next() + ' ';
  }
  return text.trim();
}`,
      ),
      v(
        'no-return',
        'no-return',
        'next() does not return the value',
        'The inner function moves the counter but has no `return`, so each call gives back undefined and the text is just "undefined undefined ...".',
        'Return the value from `next` so the caller can use it.',
        ['What does `next()` give back when it has no return statement?'],
        `function countFrom(start, step, calls) {
  let current = start;
  function next() {
    const value = current;
    current += step;
  }
  let text = '';
  for (let i = 0; i < calls; i++) {
    text += next() + ' ';
  }
  return text.trim();
}`,
      ),
    ],
  },

  // ── js-errors ─────────────────────────────────────────────────────────
  {
    id: 'ex-js-errors',
    topic: 'js-flow',
    lesson: 'js-errors',
    title: 'Parse or fall back',
    difficulty: 1,
    prompt:
      'Write `parseOr(text, fallback)` that turns JSON text into a value with `JSON.parse`. If the text is not valid JSON, `JSON.parse` throws: catch that and return `fallback` instead. Example: `parseOr("42", 0)` returns `42`, and `parseOr("oops", 0)` returns `0`.',
    concept: 'try and catch turn a thrown error into a fallback value.',
    fn: 'parseOr',
    starter: `function parseOr(text, fallback) {
  // parse the text, and handle the error JSON.parse can throw
}
`,
    reference: `function parseOr(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return fallback;
  }
}`,
    tests: [
      { args: ['42', 0], cat: 'basic' },
      { args: ['{"name":"Ada"}', null], cat: 'basic' },
      { args: ['oops', 0], cat: 'basic' },
      { args: ['[1,2,3]', []], cat: 'basic' },
      { args: ['', 'empty'], cat: 'edge' },
      { args: ['{ not valid', -1], cat: 'edge' },
      { args: ['null', 'none'], cat: 'edge' },
    ],
    traceArgs: ['oops', 0],
    track: [],
    variants: [
      v(
        'no-try',
        'runtime',
        'The error is not caught',
        'The text is parsed with no try and catch, so invalid text makes `JSON.parse` throw and the whole function fails instead of returning the fallback.',
        'Wrap the parse in a `try` block and return the fallback from `catch`.',
        ['What happens when `JSON.parse("oops")` throws and nothing is waiting to catch it?', 'Which block runs when something in `try` throws?'],
        `function parseOr(text, fallback) {
  return JSON.parse(text);
}`,
      ),
      v(
        'catch-returns-nothing',
        'no-return',
        'The catch block returns nothing',
        'The error is caught, but the catch block has no `return`, so the function ends and gives back undefined instead of the fallback.',
        'Return the fallback from inside the `catch` block.',
        ['What does the function give back after the catch block finishes?'],
        `function parseOr(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log('could not parse');
  }
}`,
      ),
      v(
        'always-fallback',
        'logic',
        'Returns the fallback even when parsing works',
        'The `return fallback` is placed after the try and catch, so valid text is parsed but its result is thrown away and the fallback is returned every time.',
        'Return the parsed value inside `try`, and use the fallback only in `catch`.',
        ['Does the line `return fallback` run when the parse succeeds?', 'Where should the successful result be returned?'],
        `function parseOr(text, fallback) {
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    value = fallback;
  }
  return fallback;
}`,
      ),
      v(
        'returns-message',
        'logic',
        'Returns the error message instead of the fallback',
        'The catch block returns `error.message`, which is text from JavaScript, and ignores the fallback the caller asked for.',
        'The caller chose a fallback value. Return that, not the error text.',
        ['What does the caller expect to get back when the text is bad?', 'Which parameter holds that value?'],
        `function parseOr(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return error.message;
  }
}`,
      ),
    ],
  },
  {
    id: 'ex-js-errors-throw',
    topic: 'js-flow',
    lesson: 'js-errors',
    title: 'Check an age',
    difficulty: 2,
    prompt:
      'Write `ageStatus(age)`. Inside a `try`, throw `new TypeError("age must be a number")` when `age` is not a number, and `new RangeError("age must be between 0 and 120")` when it is a number below 0 or above 120. If it passes, return `"ok"`. In `catch`, return the error as `name: message`. Example: `ageStatus(130)` returns `"RangeError: age must be between 0 and 120"`.',
    concept: 'Throwing the right kind of error and reading its name and message in catch.',
    fn: 'ageStatus',
    starter: `function ageStatus(age) {
  try {
    // throw a TypeError or a RangeError when age is not acceptable
  } catch (error) {
    // return the error as "name: message"
  }
}
`,
    reference: `function ageStatus(age) {
  try {
    if (typeof age !== 'number') {
      throw new TypeError('age must be a number');
    }
    if (age < 0 || age > 120) {
      throw new RangeError('age must be between 0 and 120');
    }
    return 'ok';
  } catch (error) {
    return error.name + ': ' + error.message;
  }
}`,
    tests: [
      { args: [30], cat: 'basic' },
      { args: ['30'], cat: 'basic' },
      { args: [-1], cat: 'basic' },
      { args: [130], cat: 'basic' },
      { args: [0], cat: 'edge' },
      { args: [120], cat: 'edge' },
      { args: [null], cat: 'edge' },
    ],
    traceArgs: [130],
    track: [],
    variants: [
      v(
        'plain-error',
        'logic',
        'Throws a general Error instead of the specific types',
        'Both problems are thrown as `Error`, so the text starts with "Error:" instead of "TypeError:" or "RangeError:". The type is the part that tells callers what went wrong.',
        'Use `new TypeError(...)` for the wrong type and `new RangeError(...)` for the number out of range.',
        ['What does `error.name` give for `new Error("x")`?', 'Which built-in type is meant for a value outside its allowed range?'],
        `function ageStatus(age) {
  try {
    if (typeof age !== 'number') {
      throw new Error('age must be a number');
    }
    if (age < 0 || age > 120) {
      throw new Error('age must be between 0 and 120');
    }
    return 'ok';
  } catch (error) {
    return error.name + ': ' + error.message;
  }
}`,
      ),
      v(
        'message-only',
        'logic',
        'Only the message is returned, not the name',
        'The catch block returns `error.message` alone, so the "TypeError: " or "RangeError: " part is missing.',
        'Build the text from `error.name`, a colon and a space, and `error.message`.',
        ['What is missing from your output compared with the example?', 'Which property of the error holds its type name?'],
        `function ageStatus(age) {
  try {
    if (typeof age !== 'number') {
      throw new TypeError('age must be a number');
    }
    if (age < 0 || age > 120) {
      throw new RangeError('age must be between 0 and 120');
    }
    return 'ok';
  } catch (error) {
    return error.message;
  }
}`,
      ),
      v(
        'upper-bound',
        'boundary',
        'An age of exactly 120 is rejected',
        'The range check uses `>= 120`, but 120 is allowed. Only ages above 120 are out of range.',
        'Reject only ages strictly greater than 120.',
        ['Should 120 pass or fail?', 'Which comparison is true for 121 but not for 120?'],
        `function ageStatus(age) {
  try {
    if (typeof age !== 'number') {
      throw new TypeError('age must be a number');
    }
    if (age < 0 || age >= 120) {
      throw new RangeError('age must be between 0 and 120');
    }
    return 'ok';
  } catch (error) {
    return error.name + ': ' + error.message;
  }
}`,
      ),
      v(
        'no-type-check',
        'edge-case',
        'Text and null are accepted as ages',
        'There is no check that `age` is a number, so "30" and null slip through the range test (neither is below 0 or above 120) and are called "ok".',
        'Check `typeof age` first and throw a TypeError when it is not "number".',
        ['What does `"30" > 120` give?', 'Which check should run before the range check?'],
        `function ageStatus(age) {
  try {
    if (age < 0 || age > 120) {
      throw new RangeError('age must be between 0 and 120');
    }
    return 'ok';
  } catch (error) {
    return error.name + ': ' + error.message;
  }
}`,
      ),
    ],
  },
];
