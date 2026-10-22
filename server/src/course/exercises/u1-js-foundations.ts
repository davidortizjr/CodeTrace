import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

export const U1_EXERCISES: Problem[] = [
  {
    id: 'ex-js-values',
    topic: 'js-foundations',
    lesson: 'js-values',
    title: 'Receipt line',
    difficulty: 1,
    prompt:
      'Write `receiptLine(name, qty, price)` that returns one line of a receipt, like `Pen x3 = $7.50`. The total is `qty * price`, always shown with two decimals.',
    concept: 'Template literals build the text; toFixed formats the number.',
    fn: 'receiptLine',
    starter: `function receiptLine(name, qty, price) {
  // build and return the text
}
`,
    reference: `function receiptLine(name, qty, price) {
  const total = qty * price;
  return \`\${name} x\${qty} = $\${total.toFixed(2)}\`;
}`,
    tests: [
      { args: ['Pen', 3, 2.5], cat: 'basic' },
      { args: ['Notebook', 1, 4], cat: 'basic' },
      { args: ['Tape', 2, 1.99], cat: 'basic' },
      { args: ['Stamp', 10, 0.1], cat: 'basic' },
      { args: ['Gift', 0, 5], cat: 'edge' },
      { args: ['Pencil', 3, 0.1], cat: 'edge' },
    ],
    traceArgs: ['Pen', 3, 2.5],
    track: [],
    variants: [
      v(
        'no-rounding',
        'wrong-operator',
        'Total is not rounded to two decimals',
        'The total is put into the text as it is, so 4 shows as "4" and 7.5 as "7.5" instead of "4.00" and "7.50".',
        'Call total.toFixed(2) so the total always has two decimals.',
        ['What does `(4).toFixed(2)` give?', 'Which of your outputs is missing a decimal?'],
        `function receiptLine(name, qty, price) {
  const total = qty * price;
  return \`\${name} x\${qty} = $\${total}\`;
}`,
      ),
      v(
        'adds-instead',
        'wrong-operator',
        'Adds quantity and price instead of multiplying',
        'The total is calculated with + instead of *, so 3 pens at 2.50 come out as 5.50.',
        'A total is quantity times price: use *.',
        ['What should 3 items at 2.50 each cost?', 'Which operator did you use for the total?'],
        `function receiptLine(name, qty, price) {
  const total = qty + price;
  return \`\${name} x\${qty} = $\${total.toFixed(2)}\`;
}`,
      ),
      v(
        'no-return',
        'no-return',
        'Builds the line but never returns it',
        'The text is created and then thrown away, so the function gives back undefined.',
        'Put `return` in front of the text.',
        ['What does a function return when it has no return statement?'],
        `function receiptLine(name, qty, price) {
  const total = qty * price;
  \`\${name} x\${qty} = $\${total.toFixed(2)}\`;
}`,
      ),
    ],
  },
  {
    id: 'ex-js-operators-leap',
    topic: 'js-foundations',
    lesson: 'js-operators',
    title: 'Leap year',
    difficulty: 1,
    prompt:
      'Write `isLeapYear(year)` that returns `true` or `false`. A year is a leap year when it divides by 4, except years that divide by 100, unless they also divide by 400. For example `isLeapYear(2024)` is `true`, `isLeapYear(1900)` is `false` and `isLeapYear(2000)` is `true`.',
    concept: 'The % operator tests divisibility, and && and || combine the conditions.',
    fn: 'isLeapYear',
    starter: `function isLeapYear(year) {
  // use % to test divisibility, then combine the tests
}
`,
    reference: `function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}`,
    tests: [
      { args: [2024], cat: 'basic' },
      { args: [2023], cat: 'basic' },
      { args: [1996], cat: 'basic' },
      { args: [2001], cat: 'basic' },
      { args: [1900], cat: 'edge' },
      { args: [2000], cat: 'edge' },
      { args: [2100], cat: 'edge' },
    ],
    traceArgs: [1900],
    track: [],
    variants: [
      v(
        'only-four',
        'edge-case',
        'Only checks divisibility by 4',
        'Years like 1900 and 2100 divide by 4 but are not leap years, because they also divide by 100.',
        'Add the exception: a year that divides by 100 is a leap year only if it also divides by 400.',
        ['Is 1900 a leap year?', 'Which of the 100 and 400 rules does your code use?'],
        `function isLeapYear(year) {
  return year % 4 === 0;
}`,
      ),
      v(
        'no-400-rule',
        'edge-case',
        'Forgets that years divisible by 400 are leap years',
        'The year 2000 divides by 100, so this code rejects it, but it also divides by 400, so it is a leap year.',
        'Allow a second way to be a leap year: the year divides by 400.',
        ['Is 2000 a leap year?', 'What should happen to a year that divides by 100 and by 400?'],
        `function isLeapYear(year) {
  return year % 4 === 0 && year % 100 !== 0;
}`,
      ),
      v(
        'and-everything',
        'wrong-operator',
        'Joins all three tests with &&',
        'A year cannot divide by 400 and not divide by 100 at the same time, so the result is always false.',
        'The 400 rule is an alternative, not an extra condition. Which operator means "or"?',
        ['Can any year pass all three tests at once?', 'Which operator should join the two ways of being a leap year?'],
        `function isLeapYear(year) {
  return year % 4 === 0 && year % 100 !== 0 && year % 400 === 0;
}`,
      ),
      v(
        'wrong-400-test',
        'wrong-operator',
        'Tests year % 400 !== 0 instead of === 0',
        'The last test is flipped, so almost every year (like 2023) passes it. Only years that divide by 400 should pass it.',
        'Years divisible by 400 have a remainder of 0 when divided by 400. Which comparison says "equals 0"?',
        ['What is 2023 % 400, and should 2023 pass?', 'Does `!== 0` mean "divisible" or "not divisible"?'],
        `function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 !== 0;
}`,
      ),
    ],
  },
  {
    id: 'ex-js-operators-default',
    topic: 'js-foundations',
    lesson: 'js-operators',
    title: 'Saved volume',
    difficulty: 2,
    prompt:
      'Write `volumeSetting(saved)`. `saved` is the volume (0 to 100) a user saved last time, or `null` if they never saved one. Return `saved`, or `50` when nothing was saved. A saved `0` means muted and must stay `0`. For example `volumeSetting(80)` is `80`, `volumeSetting(null)` is `50` and `volumeSetting(0)` is `0`.',
    concept: '?? replaces only null and undefined, so a real 0 survives. || would replace it.',
    fn: 'volumeSetting',
    starter: `function volumeSetting(saved) {
  // return saved, or 50 when it was never saved
}
`,
    reference: `function volumeSetting(saved) {
  return saved ?? 50;
}`,
    tests: [
      { args: [80], cat: 'basic' },
      { args: [null], cat: 'basic' },
      { args: [25], cat: 'basic' },
      { args: [100], cat: 'basic' },
      { args: [0], cat: 'edge' },
      { args: [1], cat: 'edge' },
    ],
    traceArgs: [0],
    track: [],
    variants: [
      v(
        'or-fallback',
        'coercion',
        'Uses || so a saved 0 is replaced',
        '0 is falsy, so `saved || 50` treats a muted volume as "nothing saved" and returns 50.',
        'Use the operator that only replaces null and undefined.',
        ['What does `0 || 50` give?', 'Which operator keeps a 0 but replaces null?'],
        `function volumeSetting(saved) {
  return saved || 50;
}`,
      ),
      v(
        'zero-check',
        'logic',
        'Treats 0 as "not saved" and lets null through',
        'The check `saved == 0` is true for a muted volume, so 0 becomes 50, and null is not caught at all.',
        'Decide what "never saved" looks like, and test for exactly that.',
        ['Which value means "never saved"?', 'What does your code return for null?'],
        `function volumeSetting(saved) {
  if (saved == 0) {
    return 50;
  }
  return saved;
}`,
      ),
      v(
        'zero-default',
        'wrong-operator',
        'Falls back to 0 instead of 50',
        'The fallback value is wrong: a user who never saved a volume should get 50, not silence.',
        'Check the number after `??` against the prompt.',
        ['What should the volume be when nothing was saved?'],
        `function volumeSetting(saved) {
  return saved ?? 0;
}`,
      ),
      v(
        'always-default',
        'logic',
        'Always returns 50',
        'The saved value is ignored, so everyone gets the default.',
        'Return the saved value whenever there is one.',
        ['Where does your code use `saved`?'],
        `function volumeSetting(saved) {
  return 50;
}`,
      ),
    ],
  },
  {
    id: 'ex-js-functions',
    topic: 'js-foundations',
    lesson: 'js-functions',
    title: 'Bill with tip',
    difficulty: 1,
    prompt:
      'Write `totalWithTip(bill, tipPercent)` that returns the bill plus the tip. `tipPercent` is optional and defaults to `10`. For example `totalWithTip(200)` is `220` and `totalWithTip(200, 5)` is `210`. A tip of `0` is a real answer: `totalWithTip(80, 0)` is `80`.',
    concept: 'A default parameter fills in a missing argument, and return hands back the result.',
    fn: 'totalWithTip',
    starter: `function totalWithTip(bill, tipPercent) {
  // give tipPercent a default of 10, then return the bill plus the tip
}
`,
    reference: `function totalWithTip(bill, tipPercent = 10) {
  const tip = (bill * tipPercent) / 100;
  return bill + tip;
}`,
    tests: [
      { args: [200], cat: 'basic' },
      { args: [200, 5], cat: 'basic' },
      { args: [50], cat: 'basic' },
      { args: [120, 20], cat: 'basic' },
      { args: [80, 0], cat: 'edge' },
      { args: [0], cat: 'edge' },
    ],
    traceArgs: [200],
    track: [],
    variants: [
      v(
        'no-default',
        'bad-init',
        'No default for tipPercent',
        'When the tip is left out, tipPercent is undefined, and arithmetic with undefined gives NaN.',
        'Give the parameter a default value in the function header.',
        ['What is `200 * undefined`?', 'What value does tipPercent have when the caller leaves it out?'],
        `function totalWithTip(bill, tipPercent) {
  const tip = (bill * tipPercent) / 100;
  return bill + tip;
}`,
      ),
      v(
        'or-default',
        'coercion',
        'Uses || so a tip of 0 turns into 10',
        '0 is falsy, so `tipPercent || 10` replaces a deliberate 0 tip with the default.',
        'A default parameter only fills in when the argument is missing. Put the default in the parameter list.',
        ['What does `0 || 10` give?', 'When should the default be used?'],
        `function totalWithTip(bill, tipPercent) {
  const percent = tipPercent || 10;
  return bill + (bill * percent) / 100;
}`,
      ),
      v(
        'tip-only',
        'logic',
        'Returns only the tip, not the bill plus the tip',
        'The function returns the tip amount, so 200 with a 10 percent tip gives 20 instead of 220.',
        'The result should be the bill plus the tip.',
        ['What should the function return for a bill of 200 and a tip of 20?', 'Which value do you return?'],
        `function totalWithTip(bill, tipPercent = 10) {
  return (bill * tipPercent) / 100;
}`,
      ),
      v(
        'no-return',
        'no-return',
        'Works out the total but never returns it',
        'The total is calculated and then lost, so the function gives back undefined.',
        'Put `return` in front of the value you want to hand back.',
        ['What does a function give back when it has no return statement?'],
        `function totalWithTip(bill, tipPercent = 10) {
  const tip = (bill * tipPercent) / 100;
  bill + tip;
}`,
      ),
    ],
  },
  {
    id: 'ex-js-strings-mask',
    topic: 'js-foundations',
    lesson: 'js-strings',
    title: 'Mask a card number',
    difficulty: 1,
    prompt:
      "Write `maskCard(number)` that takes a card number as a string of at least 4 digits and returns a string of the same length where every digit except the last four is replaced by `*`. For example `maskCard('1234567812345678')` is `'************5678'` and `maskCard('1234')` is `'1234'`.",
    concept: 'slice(-4) takes the end of a string, and padStart rebuilds the original length with a fill character.',
    fn: 'maskCard',
    starter: `function maskCard(number) {
  // keep the last four characters, then pad the left side with '*'
}
`,
    reference: `function maskCard(number) {
  const lastFour = number.slice(-4);
  return lastFour.padStart(number.length, '*');
}`,
    tests: [
      { args: ['1234567812345678'], cat: 'basic' },
      { args: ['4111111111111111'], cat: 'basic' },
      { args: ['378282246310005'], cat: 'basic' },
      { args: ['123456789012'], cat: 'basic' },
      { args: ['1234'], cat: 'edge' },
      { args: ['12345'], cat: 'edge' },
    ],
    traceArgs: ['1234567812345678'],
    track: [],
    variants: [
      v(
        'first-four',
        'logic',
        'Keeps the first four digits instead of the last four',
        'slice(0, 4) takes the beginning of the string, so the visible digits are the first four and the stars are on the wrong side.',
        'A negative number in slice counts back from the end of the string.',
        ['Which end of the card number should stay visible?', 'What does `slice(-4)` give for "1234567812345678"?'],
        `function maskCard(number) {
  const firstFour = number.slice(0, 4);
  return firstFour.padStart(number.length, '*');
}`,
      ),
      v(
        'fixed-stars',
        'edge-case',
        'Always uses exactly 12 stars',
        'The result has the right length only for 16-digit numbers. A 15-digit or 12-digit number gets the wrong number of stars.',
        'The number of stars depends on how long the input is. Use its length.',
        ['How many stars does a 12-digit number need?', 'Where does your code use `number.length`?'],
        `function maskCard(number) {
  return '************' + number.slice(-4);
}`,
      ),
      v(
        'last-three',
        'off-by-one',
        'Keeps only three digits visible',
        'slice(-3) takes three characters, so one digit that should be visible is hidden.',
        'Count how many characters should stay visible, and use that number in slice.',
        ['How many digits should be left showing?', 'What does `slice(-3)` give for "1234"?'],
        `function maskCard(number) {
  const lastThree = number.slice(-3);
  return lastThree.padStart(number.length, '*');
}`,
      ),
      v(
        'no-return',
        'no-return',
        'Builds the masked text but never returns it',
        'The padded string is created and then thrown away, so the function gives back undefined.',
        'Put `return` in front of the value you want to hand back.',
        ['What does a function give back when it has no return statement?'],
        `function maskCard(number) {
  const lastFour = number.slice(-4);
  lastFour.padStart(number.length, '*');
}`,
      ),
    ],
  },
  {
    id: 'ex-js-strings-slug',
    topic: 'js-foundations',
    lesson: 'js-strings',
    title: 'Make a URL slug',
    difficulty: 2,
    prompt:
      "Write `slugify(title)` that turns an article title into a URL slug: remove spaces from both ends, make everything lowercase, and replace every space between words with `-`. Words are separated by single spaces. For example `slugify('Hello World')` is `'hello-world'` and `slugify('  Learn JavaScript Fast  ')` is `'learn-javascript-fast'`.",
    concept: 'String methods return new strings, so chain them (or save each step) to build the result.',
    fn: 'slugify',
    starter: `function slugify(title) {
  // trim, lowercase, then replace every space with '-'
}
`,
    reference: `function slugify(title) {
  return title.trim().toLowerCase().replaceAll(' ', '-');
}`,
    tests: [
      { args: ['Hello World'], cat: 'basic' },
      { args: ['Learn JavaScript Fast'], cat: 'basic' },
      { args: ['Strings'], cat: 'basic' },
      { args: ['ALL CAPS TITLE'], cat: 'basic' },
      { args: ['  Learn JavaScript Fast  '], cat: 'edge' },
      { args: ['  Hello  '], cat: 'edge' },
      { args: ['a B c D'], cat: 'edge' },
    ],
    traceArgs: ['  Learn JavaScript Fast  '],
    track: [],
    variants: [
      v(
        'no-trim',
        'edge-case',
        'Does not remove the spaces at the ends',
        'Each space at the start or end becomes a "-", so a padded title ends up with dashes around it.',
        'Remove the spaces from both ends before replacing the spaces between words.',
        ['What does your code return for "  Hello  "?', 'Which string method removes spaces from both ends?'],
        `function slugify(title) {
  return title.toLowerCase().replaceAll(' ', '-');
}`,
      ),
      v(
        'replace-once',
        'wrong-operator',
        'Uses replace, which only changes the first space',
        'replace swaps the first match only, so a title with three words keeps one of its spaces.',
        'There is a version of replace that changes every match.',
        ['How many spaces does "Learn JavaScript Fast" have?', 'How many of them does `replace` change?'],
        `function slugify(title) {
  return title.trim().toLowerCase().replace(' ', '-');
}`,
      ),
      v(
        'no-lowercase',
        'case-handling',
        'Leaves capital letters in the slug',
        'The text is trimmed and the spaces are replaced, but capitals are kept, so "Hello World" becomes "Hello-World".',
        'Convert the text to lowercase as well.',
        ['Which letters in your result are still capitals?', 'Which string method makes text lowercase?'],
        `function slugify(title) {
  return title.trim().replaceAll(' ', '-');
}`,
      ),
      v(
        'results-lost',
        'mutation',
        'Calls trim and toLowerCase but throws the results away',
        'Strings cannot change in place. title.trim() and title.toLowerCase() return new strings, and here nobody keeps them, so only the replacement has any effect.',
        'Save each result, or chain the calls so each method works on the previous result.',
        ['After `title.trim()` runs on its own line, what is `title`?', 'How can the trimmed text reach the next step?'],
        `function slugify(title) {
  title.trim();
  title.toLowerCase();
  return title.replaceAll(' ', '-');
}`,
      ),
    ],
  },
];
