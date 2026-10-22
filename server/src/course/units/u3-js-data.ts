import type { Unit } from '../types.js';
import { U3_BONUS, U3_EXAM } from './u3-exam.js';
import { JS_MAPS_SETS, JS_OBJECTS } from './u3-lessons.js';

export const JS_DATA: Unit = {
  id: 'js-data',
  track: 'js',
  title: 'Arrays and objects',
  blurb: 'Hold and reshape data with arrays, objects, maps and sets.',
  lessons: [
    {
      id: 'js-arrays',
      title: 'Arrays',
      summary: 'Store a list of values, change it, copy it, and understand why two equal-looking arrays are not equal.',
      minutes: 14,
      objectives: [
        'Create an array and read items by index, using length to find the last one',
        'Add and remove items with push, pop, shift and unshift',
        'Tell slice (copies) apart from splice (changes the original)',
        'Explain why an array is a reference, and what === compares',
        'Copy an array with spread so a change does not leak into the original',
      ],
      sections: [
        {
          heading: 'A list of values',
          body: [
            'An **array** holds several values in order. Write it with square brackets and commas. Each item has an **index**, its position, and the first index is 0, not 1.',
            'Read an item with `array[index]`. The `length` property tells you how many items there are, so the last item sits at `length - 1`. Asking for an index that does not exist gives `undefined`, not an error.',
          ],
          examples: [
            {
              id: 'create-index',
              lang: 'js',
              code: `const colors = ['red', 'green', 'blue'];
console.log(colors[0]);
console.log(colors[2]);
console.log(colors.length);
console.log(colors[colors.length - 1]);
console.log(colors[5]);`,
              output: ['red', 'blue', '3', 'blue', 'undefined'],
              caption: 'Three items means indexes 0, 1 and 2. Index 5 is past the end.',
            },
          ],
        },
        {
          heading: 'Adding and removing at the ends',
          body: [
            '`push` adds an item to the end and `pop` removes the last one. `unshift` adds to the front and `shift` removes the first. All four change the array itself.',
            '`push` and `unshift` give back the new length. `pop` and `shift` give back the item they removed, which is handy when you want to use it.',
          ],
          examples: [
            {
              id: 'push-pop',
              lang: 'js',
              code: `const queue = ['Ana', 'Ben'];
queue.push('Cy');
console.log(queue);
const last = queue.pop();
console.log(last, queue);
queue.unshift('Zed');
console.log(queue);
const first = queue.shift();
console.log(first, queue);
console.log(queue.push('Dee'));`,
              output: ["[ 'Ana', 'Ben', 'Cy' ]", "Cy [ 'Ana', 'Ben' ]", "[ 'Zed', 'Ana', 'Ben' ]", "Zed [ 'Ana', 'Ben' ]", '3'],
              caption: 'The last line prints the new length that push returns.',
            },
          ],
          notes: [
            { kind: 'tip', text: '`const` stops you reassigning the name, not changing what is inside. Pushing onto a `const` array is fine.' },
          ],
        },
        {
          heading: 'slice copies, splice changes',
          body: [
            '`slice(start, end)` returns a new array with the items from `start` up to, but not including, `end`. The original is untouched. A negative start counts from the end, so `slice(-2)` is the last two items.',
            '`splice(start, count)` cuts `count` items out of the original array and returns them. It can also insert: `splice(start, 0, item)` removes nothing and puts `item` in at `start`.',
          ],
          examples: [
            {
              id: 'slice',
              lang: 'js',
              code: `const letters = ['a', 'b', 'c', 'd', 'e'];
console.log(letters.slice(1, 3));
console.log(letters.slice(-2));
console.log(letters);`,
              output: ["[ 'b', 'c' ]", "[ 'd', 'e' ]", "[ 'a', 'b', 'c', 'd', 'e' ]"],
              caption: 'slice leaves letters exactly as it was.',
            },
            {
              id: 'splice',
              lang: 'js',
              code: `const letters = ['a', 'b', 'c', 'd', 'e'];
const removed = letters.splice(1, 2);
console.log(removed);
console.log(letters);
letters.splice(1, 0, 'x');
console.log(letters);`,
              output: ["[ 'b', 'c' ]", "[ 'a', 'd', 'e' ]", "[ 'a', 'x', 'd', 'e' ]"],
              caption: 'splice changed letters twice: once to cut, once to insert.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'The names are one letter apart and the behaviour is not. `slice` is the safe one that copies. `splice` edits the array you gave it.' },
          ],
        },
        {
          heading: 'Is it in there?',
          body: [
            '`includes(value)` answers `true` or `false`. `indexOf(value)` gives the index of the first match, or `-1` when there is none. Both compare with `===`, so the number 1 and the text "1" are different.',
            'Use `includes` when you only need a yes or no. Use `indexOf` when you need the position.',
          ],
          examples: [
            {
              id: 'includes-indexof',
              lang: 'js',
              code: `const fruits = ['apple', 'pear', 'plum'];
console.log(fruits.includes('pear'));
console.log(fruits.includes('kiwi'));
console.log(fruits.indexOf('plum'));
console.log(fruits.indexOf('kiwi'));`,
              output: ['true', 'false', '2', '-1'],
            },
            {
              id: 'index-zero',
              lang: 'js',
              code: `const fruits = ['apple', 'pear', 'plum'];
if (fruits.indexOf('apple')) {
  console.log('found');
} else {
  console.log('not found');
}`,
              output: ['not found'],
              caption: 'The apple is first, at index 0, and 0 counts as false in an if.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'Never use `indexOf` as the whole condition of an `if`. Index 0 is falsy, and -1 is truthy. Compare it (`!== -1`) or use `includes`.' },
          ],
        },
        {
          heading: 'Arrays are references',
          body: [
            'A variable holding an array does not contain the items. It holds a **reference**, an address that says where the array lives. Copying the variable copies the address, so both names point at the same array.',
            'This is also why `===` on two arrays does not compare their contents. It asks whether both sides are the very same array. Two separate arrays with identical items are not equal.',
          ],
          examples: [
            {
              id: 'reference',
              lang: 'js',
              code: `const a = [1, 2];
const b = [1, 2];
console.log(a === b);
console.log(a === a);
const c = a;
c.push(3);
console.log(a);
console.log(a === c);`,
              output: ['false', 'true', '[ 1, 2, 3 ]', 'true'],
              caption: 'c is another name for a, so pushing through c changes what a shows.',
            },
          ],
        },
        {
          heading: 'Copy before you change',
          body: [
            'To get an independent array, copy it. The spread syntax `[...list]` builds a new array with the same items. Add more inside the brackets to build a bigger one: `[...list, item]`.',
            'A function that receives an array should not change it by surprise. Returning a new array leaves the caller\'s data safe, and that makes the code much easier to follow.',
          ],
          examples: [
            {
              id: 'spread-copy',
              lang: 'js',
              code: `const original = [1, 2, 3];
const copy = [...original];
copy.push(4);
console.log(original);
console.log(copy);`,
              output: ['[ 1, 2, 3 ]', '[ 1, 2, 3, 4 ]'],
            },
            {
              id: 'mutation-vs-copy',
              lang: 'js',
              code: `function addInPlace(list, item) {
  list.push(item);
  return list;
}
function withItem(list, item) {
  return [...list, item];
}
const cart = ['pen'];
addInPlace(cart, 'ink');
console.log(cart);
const next = withItem(cart, 'pad');
console.log(cart);
console.log(next);`,
              output: ["[ 'pen', 'ink' ]", "[ 'pen', 'ink' ]", "[ 'pen', 'ink', 'pad' ]"],
              caption: 'addInPlace changed cart. withItem left it alone and returned a new array.',
            },
          ],
        },
      ],
      recap: [
        'Arrays are ordered lists. Indexes start at 0, and the last item is at `length - 1`.',
        '`push`/`pop` work at the end, `unshift`/`shift` at the front, and all four change the array.',
        '`slice` returns a copy of part of an array. `splice` removes or inserts in the original.',
        '`includes` gives true or false. `indexOf` gives a position or -1.',
        'An array variable holds a reference, so `===` asks "the same array?", not "the same items?".',
        'Copy with `[...list]` before changing something you were handed.',
      ],
      checks: [
        {
          id: 'js-arrays.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `const nums = [10, 20, 30];\nnums.pop();\nnums.unshift(5);\nconsole.log(nums.length, nums[0]);` },
          options: ['3 5', '2 5', '3 10', '2 10'],
          answer: 0,
          explanation: 'pop removes 30 (length 2), then unshift puts 5 at the front (length 3). The first item is now 5.',
          review: 'js-arrays',
          verify: { kind: 'output' },
        },
        {
          id: 'js-arrays.c2',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `const a = [1, 2];\nconst b = a;\nb.push(3);\nconsole.log(a.length, a === b);` },
          options: ['3 false', '2 true', '3 true', '2 false'],
          answer: 2,
          explanation: 'b is not a copy, it is the same array under a second name. The push shows through a, and a === b is true.',
          review: 'js-arrays',
          verify: { kind: 'output' },
        },
        {
          id: 'js-arrays.c3',
          kind: 'short',
          prompt: 'Type exactly what this prints.',
          code: { lang: 'js', text: `const letters = ['a', 'b', 'c', 'd'];\nconst part = letters.slice(1, 3);\nconsole.log(part.length, letters.length);` },
          accept: ['2 4'],
          explanation: 'slice(1, 3) copies the items at indexes 1 and 2, so part has 2 items. slice never changes letters, which still has 4.',
          review: 'js-arrays',
          verify: { kind: 'output' },
        },
      ],
      exercises: ['ex-js-arrays-remove', 'ex-js-arrays-last'],
    },
    {
      id: 'js-array-methods',
      title: 'Array methods',
      summary: 'Transform, filter, search and combine arrays with forEach, map, filter, reduce, sort and friends.',
      minutes: 16,
      objectives: [
        'Choose between forEach and map, and know what each returns',
        'Pick items with filter, find and findIndex, and test them with some and every',
        'Fold an array into one value with reduce, with and without an initial value',
        'Sort numbers correctly with a comparator, and avoid the default string order',
        'Chain methods into a pipeline, and flatten with flat and flatMap',
      ],
      sections: [
        {
          heading: 'Doing something with every item: forEach and map',
          body: [
            'These methods take a function and call it once for each item. That function is called a **callback**, and it receives the item (and, as a second argument, its index).',
            '`forEach` just runs the callback, for example to print. It returns `undefined`. `map` collects whatever the callback returns into a **new array** of the same length. The original is not changed.',
          ],
          examples: [
            {
              id: 'foreach-map',
              lang: 'js',
              code: `const prices = [4, 10, 7];
prices.forEach((price) => {
  console.log('Price:', price);
});
const withTax = prices.map((price) => price * 1.5);
console.log(withTax);
console.log(prices);`,
              output: ['Price: 4', 'Price: 10', 'Price: 7', '[ 6, 15, 10.5 ]', '[ 4, 10, 7 ]'],
              caption: 'map built a new array and left prices alone.',
            },
            {
              id: 'map-index',
              lang: 'js',
              code: `const names = ['Ana', 'Ben', 'Cy'];
const numbered = names.map((name, index) => (index + 1) + '. ' + name);
console.log(numbered);`,
              output: ["[ '1. Ana', '2. Ben', '3. Cy' ]"],
              caption: 'The second parameter of the callback is the index.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'If you want a new array, use `map`. `forEach` always returns `undefined`, so `const doubled = nums.forEach(...)` leaves you with nothing.' },
          ],
        },
        {
          heading: 'Picking items: filter, find and findIndex',
          body: [
            '`filter` keeps the items for which the callback returns true and gives back a new array. When nothing matches, you get an empty array.',
            '`find` returns the first matching item itself, and `findIndex` returns its position. They stop at the first match. When nothing matches, `find` gives `undefined` and `findIndex` gives `-1`.',
          ],
          examples: [
            {
              id: 'filter-find',
              lang: 'js',
              code: `const ages = [12, 25, 17, 40];
const adults = ages.filter((age) => age >= 18);
console.log(adults);
console.log(ages.find((age) => age < 18));
console.log(ages.findIndex((age) => age > 30));
console.log(ages.find((age) => age > 100));
console.log(ages.findIndex((age) => age > 100));`,
              output: ['[ 25, 40 ]', '12', '3', 'undefined', '-1'],
              caption: 'Two items are under 18, but find stops at the first one, 12.',
            },
          ],
        },
        {
          heading: 'Yes or no questions: some and every',
          body: [
            '`some` returns true if at least one item passes the test. `every` returns true only if all of them do. Both stop as soon as the answer is known.',
            'They are easier to read than a loop with a flag variable. "Is any score below 70?" is just `scores.some(...)`.',
          ],
          examples: [
            {
              id: 'some-every',
              lang: 'js',
              code: `const scores = [80, 95, 62];
console.log(scores.some((score) => score < 70));
console.log(scores.every((score) => score >= 60));
console.log(scores.every((score) => score >= 70));
console.log([].some((score) => score > 0));
console.log([].every((score) => score > 0));`,
              output: ['true', 'true', 'false', 'false', 'true'],
              caption: 'On an empty array, some is false and every is true.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: '`every` on an empty array is `true`, because no item breaks the rule. Check for an empty array first if that would be wrong for your program.' },
          ],
        },
        {
          heading: 'Folding into one value: reduce',
          body: [
            '`reduce` walks through the array carrying a running result. The callback gets the result so far (often called `sum` or `acc`) and the current item, and whatever it returns becomes the result for the next step. The second argument to `reduce` is the **initial value**, where the result starts.',
            'You can leave the initial value out. Then `reduce` starts with the first item and begins the callback at the second. That works until the array is empty, when there is nothing to start from and JavaScript throws an error. Always pass an initial value.',
          ],
          examples: [
            {
              id: 'reduce-trace',
              lang: 'js',
              code: `const nums = [3, 5, 2];
const total = nums.reduce((sum, n) => {
  console.log('sum', sum, 'n', n);
  return sum + n;
}, 0);
console.log(total);
console.log(nums.reduce((sum, n) => sum + n, 100));`,
              output: ['sum 0 n 3', 'sum 3 n 5', 'sum 8 n 2', '10', '110'],
              caption: 'The result starts at the initial value, 0, and grows by one item each step.',
            },
            {
              id: 'reduce-empty',
              lang: 'js',
              code: `console.log([4, 6].reduce((sum, n) => sum + n));
console.log([].reduce((sum, n) => sum + n, 0));
console.log([].reduce((sum, n) => sum + n));`,
              output: ['10', '0'],
              runtimeError: 'TypeError: Reduce of empty array with no initial value',
              caption: 'Without an initial value, an empty array crashes reduce.',
            },
          ],
        },
        {
          heading: 'Sorting, and the string order trap',
          body: [
            '`sort` puts the items in order, and it changes the array itself. With no argument it turns every item into text and compares the text, which is dictionary order. For numbers that is wrong: "100" comes before "25" because "1" comes before "2".',
            'Give `sort` a **comparator**, a function of two items `(a, b)`. Return a negative number to put `a` first, a positive number to put `b` first. For numbers, `a - b` sorts low to high and `b - a` sorts high to low.',
          ],
          examples: [
            {
              id: 'sort-default',
              lang: 'js',
              code: `const nums = [10, 9, 100, 25];
nums.sort();
console.log(nums);`,
              output: ['[ 10, 100, 25, 9 ]'],
              caption: 'Not in numeric order: the numbers were compared as text.',
            },
            {
              id: 'sort-comparator',
              lang: 'js',
              code: `const nums = [10, 9, 100, 25];
console.log(nums.sort((a, b) => a - b));
console.log(nums.sort((a, b) => b - a));
const scores = [3, 1, 2];
const sorted = [...scores].sort((a, b) => a - b);
console.log(sorted);
console.log(scores);`,
              output: ['[ 9, 10, 25, 100 ]', '[ 100, 25, 10, 9 ]', '[ 1, 2, 3 ]', '[ 3, 1, 2 ]'],
              caption: 'Copy with spread first when the original order must survive.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'Plain `sort()` is fine for words, but never for numbers. And because it edits the array in place, sort a copy if anyone else is using the original.' },
          ],
        },
        {
          heading: 'Chaining, and flattening',
          body: [
            'Most of these methods return an array, so you can call the next method straight on the result. A **chain** reads like a recipe: keep these, change them, add them up. Put each step on its own line.',
            '`flat` turns an array of arrays into one array. `flatMap` is `map` followed by `flat`, which is perfect when each item turns into several.',
          ],
          examples: [
            {
              id: 'chain',
              lang: 'js',
              code: `const orders = [12, 5, 30, 8, 22];
const total = orders
  .filter((amount) => amount >= 10)
  .map((amount) => amount * 2)
  .reduce((sum, amount) => sum + amount, 0);
console.log(total);`,
              output: ['128'],
              caption: 'Keeps 12, 30 and 22, doubles them to 24, 60 and 44, then adds them.',
            },
            {
              id: 'flat',
              lang: 'js',
              code: `const nested = [[1, 2], [3], [4, 5]];
console.log(nested.flat());
const sentences = ['hi there', 'good day'];
console.log(sentences.map((s) => s.split(' ')));
console.log(sentences.flatMap((s) => s.split(' ')));`,
              output: ['[ 1, 2, 3, 4, 5 ]', "[ [ 'hi', 'there' ], [ 'good', 'day' ] ]", "[ 'hi', 'there', 'good', 'day' ]"],
              caption: 'map keeps one inner array per sentence. flatMap joins them into one list of words.',
            },
          ],
        },
      ],
      recap: [
        '`map` returns a new array of the callback results. `forEach` only runs the callback and returns `undefined`.',
        '`filter` keeps matching items. `find` and `findIndex` return the first match, or `undefined` and `-1`.',
        '`some` asks "any?" and `every` asks "all?". `every` is true on an empty array.',
        '`reduce` carries a result through the array. Pass an initial value so an empty array works.',
        'Plain `sort()` compares as text and changes the array. Use `(a, b) => a - b` for numbers, on a copy if needed.',
        'Methods that return arrays can be chained. `flat` and `flatMap` remove one level of nesting.',
      ],
      checks: [
        {
          id: 'js-array-methods.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: {
            lang: 'js',
            text: `const nums = [1, 2, 3, 4];\nconst result = nums.filter((n) => n % 2 === 0).map((n) => n * 10);\nconsole.log(result);`,
          },
          options: ['[ 10, 30 ]', '[ 2, 4 ]', '[ 10, 20, 30, 40 ]', '[ 20, 40 ]'],
          answer: 3,
          explanation: 'filter keeps the even numbers, 2 and 4. map then multiplies each by 10, giving 20 and 40.',
          review: 'js-array-methods',
          verify: { kind: 'output' },
        },
        {
          id: 'js-array-methods.c2',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `const nums = [5, 40, 100];\nnums.sort();\nconsole.log(nums);` },
          options: ['[ 5, 40, 100 ]', '[ 100, 40, 5 ]', '[ 100, 5, 40 ]', '[ 40, 5, 100 ]'],
          answer: 1,
          explanation: 'Without a comparator, sort compares the numbers as text. "100" comes before "40", and "40" before "5".',
          review: 'js-array-methods',
          verify: { kind: 'output' },
        },
        {
          id: 'js-array-methods.c3',
          kind: 'short',
          prompt: 'Type exactly what this prints.',
          code: { lang: 'js', text: `const total = [4, 6].reduce((sum, n) => sum + n, 10);\nconsole.log(total);` },
          accept: ['20'],
          explanation: 'The result starts at the initial value 10, then adds 4 to make 14, then adds 6 to make 20.',
          review: 'js-array-methods',
          verify: { kind: 'output' },
        },
      ],
      exercises: ['ex-js-array-methods-odds', 'ex-js-array-methods-top'],
    },
    JS_OBJECTS,
    JS_MAPS_SETS,
  ],
  exam: U3_EXAM,
  bonus: U3_BONUS,
};
