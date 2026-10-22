import { COURSE_PROBLEMS } from '../course/exercises/index.js';
import { UNITS } from '../course/index.js';
import type { ErrorTypeId } from '../engine/errors.js';
import type { CourseTopicId, Problem, Topic, Variant } from './types.js';

/** The stand-alone JavaScript problem-solving sets. */
const SOLVING_TOPICS: Topic[] = [
  { id: 'loops', name: 'Loops & accumulators', blurb: 'Build a result one pass at a time.', group: 'problem-solving', lang: 'js' },
  { id: 'arrays', name: 'Arrays', blurb: 'Search, filter and reshape lists.', group: 'problem-solving', lang: 'js' },
  { id: 'strings', name: 'Strings', blurb: 'Walk through text and compare it.', group: 'problem-solving', lang: 'js' },
  { id: 'logic', name: 'Conditionals & logic', blurb: 'Branches, ranges and the order they run in.', group: 'problem-solving', lang: 'js' },
  { id: 'objects', name: 'Objects & maps', blurb: 'Count, group and look things up by key.', group: 'problem-solving', lang: 'js' },
  { id: 'recursion', name: 'Recursion', blurb: 'Solve a problem by solving a smaller one.', group: 'problem-solving', lang: 'js' },
];

/** One topic per course unit, so exercises roll up into the skill map. */
const COURSE_TOPICS: Topic[] = UNITS.map((u) => ({
  id: u.id as CourseTopicId,
  name: u.title,
  blurb: u.blurb,
  group: 'course' as const,
  lang: u.track,
}));

export const TOPICS: Topic[] = [...COURSE_TOPICS, ...SOLVING_TOPICS];

function v(
  id: string,
  type: ErrorTypeId,
  label: string,
  why: string,
  fix: string,
  ask: string[],
  code: string,
): Variant {
  return { id, type, label, why, fix, ask, code };
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

/** The original problem-solving problems (all JavaScript). */
export const SOLVING_PROBLEMS: Problem[] = [
  // ───────────────────────── Loops & accumulators ─────────────────────────
  {
    id: 'sum-evens',
    topic: 'loops',
    title: 'Sum of evens',
    difficulty: 1,
    prompt:
      'Write `sumEvens(nums)` that returns the sum of every even number in the array. For an empty array return 0.',
    concept: 'Keep a running total and only add the values that pass a test.',
    fn: 'sumEvens',
    starter: `function sumEvens(nums) {
  let total = 0;
  // loop over nums and add the even ones to total
  return total;
}
`,
    reference: `function sumEvens(nums) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] % 2 === 0) total += nums[i];
  }
  return total;
}`,
    tests: [
      { args: [[1, 2, 3, 4, 5, 6]], cat: 'basic' },
      { args: [[2, 4, 6]], cat: 'basic' },
      { args: [[1, 3, 5]], cat: 'basic' },
      { args: [[10, 21, 32, 43, 54]], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [[0]], cat: 'edge' },
      { args: [[-2, -3, 4]], cat: 'edge' },
      { args: [range(1000)], cat: 'large' },
    ],
    traceArgs: [[3, 2, 5, 4, 6]],
    track: ['total'],
    variants: [
      v(
        'skips-last',
        'off-by-one',
        'Loop stops one item early',
        'The loop condition stops before the last index, so the final number is never looked at.',
        'Use i < nums.length so the last index is included.',
        [
          'For [2, 4, 6], which indexes does your loop visit?',
          'Which one is missing?',
        ],
        `function sumEvens(nums) {
  let total = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] % 2 === 0) total += nums[i];
  }
  return total;
}`,
      ),
      v(
        'sums-odds',
        'wrong-operator',
        'Tests for odd instead of even',
        'The check is true for odd numbers, so the odd values get added and the even ones are skipped.',
        'An even number leaves remainder 0 when divided by 2: use % 2 === 0.',
        [
          'What is 4 % 2, and what is 5 % 2?',
          'Which of those should your condition accept?',
        ],
        `function sumEvens(nums) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] % 2 === 1) total += nums[i];
  }
  return total;
}`,
      ),
      v(
        'starts-at-one',
        'bad-init',
        'Total starts at 1',
        'The running total begins at 1, so every answer is 1 too high, and an empty array returns 1 instead of 0.',
        'Start a sum at 0.',
        [
          'What should sumEvens([]) return?',
          'What does your function return for that?',
        ],
        `function sumEvens(nums) {
  let total = 1;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] % 2 === 0) total += nums[i];
  }
  return total;
}`,
      ),
    ],
  },
  {
    id: 'factorial-loop',
    topic: 'loops',
    title: 'Factorial with a loop',
    difficulty: 1,
    prompt:
      'Write `factorial(n)` that returns n! (n × (n−1) × … × 1) for a whole number n ≥ 0, using a loop. factorial(0) is 1.',
    concept: 'A product accumulator starts at 1, not 0.',
    fn: 'factorial',
    starter: `function factorial(n) {
  let result = 1;
  // multiply result by each number up to n
  return result;
}
`,
    reference: `function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}`,
    tests: [
      { args: [5], cat: 'basic' },
      { args: [3], cat: 'basic' },
      { args: [7], cat: 'basic' },
      { args: [10], cat: 'basic' },
      { args: [0], cat: 'edge' },
      { args: [1], cat: 'edge' },
      { args: [2], cat: 'edge' },
      { args: [15], cat: 'large' },
    ],
    traceArgs: [5],
    track: ['result'],
    variants: [
      v(
        'stops-early',
        'off-by-one',
        'Loop stops before n',
        'The loop stops at n − 1, so n itself is never multiplied in.',
        'Use i <= n so the last number is included.',
        ['For n = 5, which numbers does your loop multiply?', 'Is 5 one of them?'],
        `function factorial(n) {
  let result = 1;
  for (let i = 2; i < n; i++) {
    result *= i;
  }
  return result;
}`,
      ),
      v(
        'starts-at-zero',
        'bad-init',
        'Product starts at 0',
        'Anything multiplied by 0 is 0, so the product never leaves 0.',
        'A product starts at 1, the value that changes nothing when multiplied.',
        [
          'What is 0 × 2?',
          'What value could result start at so the first multiplication leaves the other number unchanged?',
        ],
        `function factorial(n) {
  let result = 0;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}`,
      ),
      v(
        'adds-instead',
        'wrong-operator',
        'Adds instead of multiplies',
        'The loop adds the numbers together (a sum) instead of multiplying them.',
        'Use *= to build a product.',
        [
          'Is n! a sum or a product of 1 to n?',
          'Which operator does that in the loop body?',
        ],
        `function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result += i;
  }
  return result;
}`,
      ),
    ],
  },
  {
    id: 'average',
    topic: 'loops',
    title: 'Average of numbers',
    difficulty: 2,
    prompt:
      'Write `average(nums)` that returns the mean of the numbers. For an empty array return 0.',
    concept: 'Sum first, divide once, and decide what the empty case means.',
    fn: 'average',
    starter: `function average(nums) {
  // add up the numbers, then divide by how many there are
}
`,
    reference: `function average(nums) {
  if (nums.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum / nums.length;
}`,
    tests: [
      { args: [[2, 4, 6]], cat: 'basic' },
      { args: [[10, 20]], cat: 'basic' },
      { args: [[1, 2]], cat: 'basic' },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [[7]], cat: 'edge' },
      { args: [[-1, 1]], cat: 'edge' },
      { args: [range(500)], cat: 'large' },
    ],
    traceArgs: [[4, 8, 6]],
    track: ['sum'],
    variants: [
      v(
        'length-minus-one',
        'off-by-one',
        'Divides by length − 1',
        'The total is divided by one less than the number of items, so every average is too big and a single item divides by zero.',
        'Divide by nums.length: the count of items you added.',
        [
          'How many numbers are in [2, 4, 6]?',
          'What are you dividing the total by?',
        ],
        `function average(nums) {
  if (nums.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum / (nums.length - 1);
}`,
      ),
      v(
        'no-empty-check',
        'edge-case',
        'Empty array divides 0 by 0',
        'With no numbers, the code computes 0 / 0, which is NaN. The problem asks for 0.',
        'Return 0 early when nums.length is 0.',
        ['What is 0 / 0 in JavaScript?', 'What should average([]) return?'],
        `function average(nums) {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum / nums.length;
}`,
      ),
      v(
        'rounds-down',
        'logic',
        'Rounds the result down',
        'Math.floor throws away the decimal part, but the mean should keep it.',
        'Return sum / nums.length without rounding.',
        ['What is the average of [1, 2]?', 'What does Math.floor do to it?'],
        `function average(nums) {
  if (nums.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return Math.floor(sum / nums.length);
}`,
      ),
    ],
  },

  // ───────────────────────────── Arrays ─────────────────────────────
  {
    id: 'find-max',
    topic: 'arrays',
    title: 'Largest number',
    difficulty: 1,
    prompt:
      'Write `findMax(nums)` that returns the largest number in the array, or `null` if the array is empty. Do not use Math.max.',
    concept: 'Start from a real element, not from a guess.',
    fn: 'findMax',
    starter: `function findMax(nums) {
  // return the largest number, or null for an empty array
}
`,
    reference: `function findMax(nums) {
  if (nums.length === 0) return null;
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > max) max = nums[i];
  }
  return max;
}`,
    tests: [
      { args: [[3, 9, 2]], cat: 'basic' },
      { args: [[1, 2, 3, 4, 5]], cat: 'basic' },
      { args: [[5, 4, 3, 2, 1]], cat: 'basic' },
      { args: [[10, 9, 100, 8]], cat: 'basic' },
      { args: [[-5, -2, -9]], cat: 'edge' },
      { args: [[7]], cat: 'edge' },
      { args: [[]], cat: 'edge' },
      { args: [range(300).reverse()], cat: 'large' },
    ],
    traceArgs: [[3, 9, 2, 11, 7]],
    track: ['max'],
    variants: [
      v(
        'zero-start',
        'bad-init',
        'Starts the maximum at 0',
        'The running maximum starts at 0, so when every number is negative, 0 is never beaten and the answer is wrong.',
        'Start max at nums[0] (after checking the array is not empty).',
        [
          'What is the largest number in [-5, -2, -9]?',
          'Can anything in that array beat a starting value of 0?',
        ],
        `function findMax(nums) {
  if (nums.length === 0) return null;
  let max = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > max) max = nums[i];
  }
  return max;
}`,
      ),
      v(
        'default-sort',
        'sort-lexicographic',
        'Sorts with the default sort',
        'sort() with no comparator sorts as text, so "100" lands before "9". It also reorders the original array.',
        'Compare numbers directly in a loop, or pass (a, b) => a - b to sort on a copy.',
        [
          'Which comes first as text: "100" or "9"?',
          'What happens to the array the caller passed in?',
        ],
        `function findMax(nums) {
  if (nums.length === 0) return null;
  return nums.sort()[nums.length - 1];
}`,
      ),
      v(
        'skips-last',
        'off-by-one',
        'Never checks the last item',
        'The loop ends one index early, so the last number is never compared.',
        'Loop while i < nums.length.',
        ['Which index does your loop stop at?', 'What is the last valid index?'],
        `function findMax(nums) {
  if (nums.length === 0) return null;
  let max = nums[0];
  for (let i = 1; i < nums.length - 1; i++) {
    if (nums[i] > max) max = nums[i];
  }
  return max;
}`,
      ),
      v(
        'finds-min',
        'wrong-operator',
        'Compares with < and finds the smallest',
        'The comparison keeps the smaller value, so the function returns the minimum.',
        'Replace the item when it is greater than the current max.',
        [
          'When should max be replaced: when the new number is bigger or smaller?',
          'Which way does your comparison point?',
        ],
        `function findMax(nums) {
  if (nums.length === 0) return null;
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] < max) max = nums[i];
  }
  return max;
}`,
      ),
    ],
  },
  {
    id: 'remove-duplicates',
    topic: 'arrays',
    title: 'Remove duplicates',
    difficulty: 2,
    prompt:
      'Write `removeDuplicates(nums)` that returns a new array with repeated numbers removed, keeping the first time each number appears and the original order.',
    concept: 'Build a new array and check it before each push.',
    fn: 'removeDuplicates',
    starter: `function removeDuplicates(nums) {
  const result = [];
  // add each number only if result does not have it yet
  return result;
}
`,
    reference: `function removeDuplicates(nums) {
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    if (!result.includes(nums[i])) result.push(nums[i]);
  }
  return result;
}`,
    tests: [
      { args: [[1, 2, 2, 3, 1]], cat: 'basic' },
      { args: [[3, 1, 2]], cat: 'basic' },
      { args: [[1, 2, 3, 2, 1, 3, 10]], cat: 'basic' },
      { args: [[10, 9, 10, 1]], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [[5, 5, 5]], cat: 'edge' },
      { args: [[-1, -1, 0]], cat: 'edge' },
      { args: [Array.from({ length: 200 }, (_, i) => (i * 7) % 50)], cat: 'large' },
    ],
    traceArgs: [[4, 2, 4, 7, 2]],
    track: ['result'],
    variants: [
      v(
        'adjacent-only',
        'logic',
        'Only compares with the neighbour',
        'Each number is compared with the one just before it, so repeats that are not side by side are kept.',
        'Check whether the number is anywhere in the result so far, for example with includes().',
        [
          'In [1, 2, 1], is the second 1 next to the first 1?',
          'What does your check compare it with?',
        ],
        `function removeDuplicates(nums) {
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) result.push(nums[i]);
  }
  return result;
}`,
      ),
      v(
        'set-then-sort',
        'sort-lexicographic',
        'Sorts after removing duplicates',
        'Sorting changes the order the problem wants kept, and the default sort compares numbers as text, so 10 comes before 9.',
        'Keep the original order: skip the sort, or build the result in a loop.',
        [
          'Does the problem ask for a sorted result?',
          'Which comes first as text, "10" or "9"?',
        ],
        `function removeDuplicates(nums) {
  return [...new Set(nums)].sort();
}`,
      ),
    ],
  },
  {
    id: 'rotate-left',
    topic: 'arrays',
    title: 'Rotate left',
    difficulty: 3,
    prompt:
      'Write `rotateLeft(arr, k)` that returns a new array with the items moved k places to the left; items that fall off the front wrap around to the back. k can be larger than the length. The original array must not change.',
    concept: 'Use the remainder to wrap, and copy instead of changing the input.',
    fn: 'rotateLeft',
    starter: `function rotateLeft(arr, k) {
  // return a new rotated array
}
`,
    reference: `function rotateLeft(arr, k) {
  if (arr.length === 0) return [];
  const shift = k % arr.length;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], cat: 'basic' },
      { args: [[1, 2, 3, 4], 1], cat: 'basic' },
      { args: [[1, 2, 3], 0], cat: 'basic' },
      { args: [[1, 2, 3], 3], cat: 'edge' },
      { args: [[1, 2, 3], 7], cat: 'edge' },
      { args: [[], 4], cat: 'edge' },
      { args: [[9], 5], cat: 'edge' },
      { args: [range(100), 250], cat: 'large' },
    ],
    traceArgs: [[1, 2, 3, 4, 5], 2],
    track: [],
    variants: [
      v(
        'no-modulo',
        'edge-case',
        'k larger than the length',
        'When k is bigger than the array, slice(k) is empty, so nothing is rotated by the extra amount. Rotating by the length is the same as not rotating, so only k % length matters.',
        'Use k % arr.length as the shift.',
        [
          'What does rotating a 3-item array by 3 do to it?',
          'So what is rotating by 7 the same as?',
        ],
        `function rotateLeft(arr, k) {
  return [...arr.slice(k), ...arr.slice(0, k)];
}`,
      ),
      v(
        'mutates',
        'mutation',
        'Rotates the original array',
        'push() and shift() change the array that was passed in, so the caller\'s own array gets rotated too.',
        'Copy first, for example with [...arr] or slice(), and rotate the copy.',
        [
          'After calling your function, what does the original variable contain?',
          'Which two methods change the array in place?',
        ],
        `function rotateLeft(arr, k) {
  for (let i = 0; i < k % (arr.length || 1); i++) {
    arr.push(arr.shift());
  }
  return arr;
}`,
      ),
      v(
        'rotates-right',
        'logic',
        'Rotates right instead of left',
        'The items move toward the end instead of the start, which is the opposite direction.',
        'Left rotation moves the first k items to the back: slice(shift) first, then slice(0, shift).',
        [
          'Where does the first item end up after rotating [1, 2, 3] left by 1?',
          'Where does it end up in your result?',
        ],
        `function rotateLeft(arr, k) {
  if (arr.length === 0) return [];
  const shift = k % arr.length;
  return [...arr.slice(arr.length - shift), ...arr.slice(0, arr.length - shift)];
}`,
      ),
    ],
  },

  // ───────────────────────────── Strings ─────────────────────────────
  {
    id: 'count-vowels',
    topic: 'strings',
    title: 'Count vowels',
    difficulty: 1,
    prompt:
      'Write `countVowels(str)` that returns how many of the letters a, e, i, o, u appear in the string, uppercase or lowercase. The letter y is not a vowel.',
    concept: 'Normalise the case before you compare characters.',
    fn: 'countVowels',
    starter: `function countVowels(str) {
  let count = 0;
  // check each character
  return count;
}
`,
    reference: `function countVowels(str) {
  let count = 0;
  const vowels = 'aeiou';
  for (let i = 0; i < str.length; i++) {
    if (vowels.includes(str[i].toLowerCase())) count++;
  }
  return count;
}`,
    tests: [
      { args: ['hello world'], cat: 'basic' },
      { args: ['Programming Is Fun'], cat: 'basic' },
      { args: ['AEIOU'], cat: 'basic' },
      { args: ['rhythm'], cat: 'edge' },
      { args: ['yay'], cat: 'edge' },
      { args: [''], cat: 'edge' },
      { args: ['xyz'], cat: 'edge' },
      { args: ['aeiou'.repeat(200) + 'bcd'], cat: 'large' },
    ],
    traceArgs: ['Education'],
    track: ['count'],
    variants: [
      v(
        'lowercase-only',
        'case-handling',
        'Misses capital vowels',
        'Only lowercase letters match, so "A" and "E" are not counted.',
        'Convert each character with toLowerCase() before checking it.',
        [
          'Is "A" equal to "a" in JavaScript?',
          'What could you do to each character before the check?',
        ],
        `function countVowels(str) {
  let count = 0;
  const vowels = 'aeiou';
  for (let i = 0; i < str.length; i++) {
    if (vowels.includes(str[i])) count++;
  }
  return count;
}`,
      ),
      v(
        'counts-y',
        'logic',
        'Counts y as a vowel',
        'The list of vowels includes y. The problem says y is not a vowel.',
        'Check against exactly "aeiou".',
        ['Which letters does the problem list as vowels?', 'Which letters does your list contain?'],
        `function countVowels(str) {
  let count = 0;
  const vowels = 'aeiouy';
  for (let i = 0; i < str.length; i++) {
    if (vowels.includes(str[i].toLowerCase())) count++;
  }
  return count;
}`,
      ),
      v(
        'skips-last',
        'off-by-one',
        'Never looks at the last character',
        'The loop stops one character early, so a vowel at the end of the string is missed.',
        'Loop while i < str.length.',
        ['Which index does your loop stop before?', 'What is the last index of a 5-letter word?'],
        `function countVowels(str) {
  let count = 0;
  const vowels = 'aeiou';
  for (let i = 0; i < str.length - 1; i++) {
    if (vowels.includes(str[i].toLowerCase())) count++;
  }
  return count;
}`,
      ),
    ],
  },
  {
    id: 'is-palindrome',
    topic: 'strings',
    title: 'Palindrome check',
    difficulty: 2,
    prompt:
      'Write `isPalindrome(str)` that returns true if the text reads the same forwards and backwards, ignoring letter case and anything that is not a letter or digit.',
    concept: 'Clean the input first, then compare from both ends.',
    fn: 'isPalindrome',
    starter: `function isPalindrome(str) {
  // return true or false
}
`,
    reference: `function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
    tests: [
      { args: ['racecar'], cat: 'basic' },
      { args: ['hello'], cat: 'basic' },
      { args: ['12321'], cat: 'basic' },
      { args: ['12345'], cat: 'basic' },
      { args: ['abca'], cat: 'basic' },
      { args: ['Racecar'], cat: 'edge' },
      { args: ['ab,ba'], cat: 'edge' },
      { args: ['A man, a plan, a canal: Panama'], cat: 'edge' },
      { args: ['Was it a car or a cat I saw?'], cat: 'edge' },
      { args: ['No lemon, no melon'], cat: 'edge' },
      { args: [''], cat: 'edge' },
      { args: ['ab'], cat: 'edge' },
      { args: ['abcdefghij'.repeat(60) + 'x' + 'jihgfedcba'.repeat(60)], cat: 'large' },
    ],
    traceArgs: ['abca'],
    track: ['left', 'right'],
    variants: [
      v(
        'no-cleaning',
        'edge-case',
        'Punctuation and spaces are compared',
        'Spaces and punctuation stay in the text, so a phrase like "A man, a plan" fails even though its letters mirror.',
        'Remove everything that is not a letter or digit before comparing, for example with replace(/[^a-z0-9]/g, "").',
        [
          'What characters sit between the words in "No lemon, no melon"?',
          'Should they be part of the comparison?',
        ],
        `function isPalindrome(str) {
  const cleaned = str.toLowerCase();
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
      ),
      v(
        'case-sensitive',
        'case-handling',
        'Uppercase and lowercase differ',
        'The text is cleaned but not lowercased, so "Racecar" compares R with r and fails.',
        'Call toLowerCase() before comparing.',
        ['Is "R" === "r"?', 'Where could you make both the same case?'],
        `function isPalindrome(str) {
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, '');
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
      ),
      v(
        'ends-only',
        'logic',
        'Only compares the first and last character',
        'Only the two ends are compared, so any word that starts and ends with the same letter counts as a palindrome.',
        'Keep comparing inward: second with second-to-last, and so on, until the pointers meet.',
        [
          'Is "abca" a palindrome?',
          'Which pairs of characters does your code compare?',
        ],
        `function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleaned.length === 0) return true;
  return cleaned[0] === cleaned[cleaned.length - 1];
}`,
      ),
    ],
  },
  {
    id: 'capitalize-words',
    topic: 'strings',
    title: 'Capitalize every word',
    difficulty: 2,
    prompt:
      'Write `capitalizeWords(str)` that makes the first letter of every word uppercase and the rest of each word lowercase. Words are separated by single spaces. An empty string returns an empty string.',
    concept: 'Split, transform each piece, join.',
    fn: 'capitalizeWords',
    starter: `function capitalizeWords(str) {
  // split into words, fix each one, join them back
}
`,
    reference: `function capitalizeWords(str) {
  if (str === '') return '';
  const words = str.split(' ');
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    out.push(w[0].toUpperCase() + w.slice(1).toLowerCase());
  }
  return out.join(' ');
}`,
    tests: [
      { args: ['hello world'], cat: 'basic' },
      { args: ['the quick brown fox'], cat: 'basic' },
      { args: ['jAVA sCRIPT is FUN'], cat: 'basic' },
      { args: ['ALREADY CAPS'], cat: 'basic' },
      { args: [''], cat: 'edge' },
      { args: ['a'], cat: 'edge' },
      { args: ['x y z'], cat: 'edge' },
      { args: [Array.from({ length: 200 }, () => 'word').join(' ')], cat: 'large' },
    ],
    traceArgs: ['tiny dancer now'],
    track: ['out'],
    variants: [
      v(
        'first-word-only',
        'logic',
        'Only the first word is capitalized',
        'The code capitalizes the first character of the whole string, not of each word.',
        'Split the string into words and fix each word, then join them.',
        [
          'How many words does "hello big world" have?',
          'How many of them does your code capitalize?',
        ],
        `function capitalizeWords(str) {
  if (str === '') return '';
  return str[0].toUpperCase() + str.slice(1);
}`,
      ),
      v(
        'keeps-rest',
        'case-handling',
        'Rest of each word is not lowercased',
        'The first letter is uppercased but the other letters are left as they were, so "jAVA" becomes "JAVA".',
        'Add .toLowerCase() to the rest of the word: w.slice(1).toLowerCase().',
        [
          'What should "jAVA" become?',
          'Which part of your code touches the letters after the first?',
        ],
        `function capitalizeWords(str) {
  if (str === '') return '';
  const words = str.split(' ');
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    out.push(w[0].toUpperCase() + w.slice(1));
  }
  return out.join(' ');
}`,
      ),
    ],
  },

  // ─────────────────────── Conditionals & logic ───────────────────────
  {
    id: 'fizzbuzz',
    topic: 'logic',
    title: 'FizzBuzz',
    difficulty: 1,
    prompt:
      'Write `fizzBuzz(n)` that returns an array of strings for the numbers 1 to n: "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for multiples of both, otherwise the number as a string.',
    concept: 'Order your conditions from most specific to least.',
    fn: 'fizzBuzz',
    starter: `function fizzBuzz(n) {
  const out = [];
  // fill out with one string per number from 1 to n
  return out;
}
`,
    reference: `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push('FizzBuzz');
    else if (i % 3 === 0) out.push('Fizz');
    else if (i % 5 === 0) out.push('Buzz');
    else out.push(String(i));
  }
  return out;
}`,
    tests: [
      { args: [5], cat: 'basic' },
      { args: [15], cat: 'basic' },
      { args: [16], cat: 'basic' },
      { args: [30], cat: 'basic' },
      { args: [1], cat: 'edge' },
      { args: [3], cat: 'edge' },
      { args: [0], cat: 'edge' },
      { args: [100], cat: 'large' },
    ],
    traceArgs: [6],
    track: [],
    variants: [
      v(
        'wrong-order',
        'control-flow',
        'FizzBuzz is never reached',
        'The check for 3 comes before the check for both, so 15 is caught as "Fizz" and the FizzBuzz branch never runs.',
        'Test for multiples of both (i % 15) first, then 3, then 5.',
        [
          'Which branch does 15 reach first in your code?',
          'Can 15 ever reach the FizzBuzz branch from there?',
        ],
        `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0) out.push('Fizz');
    else if (i % 5 === 0) out.push('Buzz');
    else if (i % 15 === 0) out.push('FizzBuzz');
    else out.push(String(i));
  }
  return out;
}`,
      ),
      v(
        'exclusive-end',
        'off-by-one',
        'Stops before n',
        'The loop uses < n, so the last number is missing from the result.',
        'Use i <= n so n is included.',
        ['How many items should fizzBuzz(5) return?', 'How many does yours return?'],
        `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i < n; i++) {
    if (i % 15 === 0) out.push('FizzBuzz');
    else if (i % 3 === 0) out.push('Fizz');
    else if (i % 5 === 0) out.push('Buzz');
    else out.push(String(i));
  }
  return out;
}`,
      ),
      v(
        'numbers-not-strings',
        'coercion',
        'Pushes numbers, not strings',
        'Plain numbers are pushed where the problem asks for strings, so 1 is returned instead of "1".',
        'Convert with String(i) before pushing.',
        [
          'What type is each item in the result supposed to be?',
          'What type is i when you push it?',
        ],
        `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push('FizzBuzz');
    else if (i % 3 === 0) out.push('Fizz');
    else if (i % 5 === 0) out.push('Buzz');
    else out.push(i);
  }
  return out;
}`,
      ),
    ],
  },
  {
    id: 'leap-year',
    topic: 'logic',
    title: 'Leap year',
    difficulty: 2,
    prompt:
      'Write `isLeapYear(year)` that returns true for leap years. A year is a leap year if it is divisible by 4, except century years (divisible by 100), which are leap years only if they are also divisible by 400.',
    concept: 'Combine conditions with && and || and mind the exceptions to the exceptions.',
    fn: 'isLeapYear',
    starter: `function isLeapYear(year) {
  // return true or false
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
      { args: [2400], cat: 'edge' },
      { args: [4], cat: 'edge' },
    ],
    traceArgs: [1900],
    track: [],
    variants: [
      v(
        'only-four',
        'logic',
        'Ignores the century rule',
        'Only divisibility by 4 is checked, so 1900 and 2100 are reported as leap years.',
        'Add the exception: divisible by 100 means not a leap year, unless also divisible by 400.',
        ['Is 1900 a leap year?', 'Which part of your condition decides that?'],
        `function isLeapYear(year) {
  return year % 4 === 0;
}`,
      ),
      v(
        'missing-400',
        'logic',
        'Forgets the divisible-by-400 exception',
        'Century years are all rejected, but 2000 and 2400 are leap years because they divide by 400.',
        'Add || year % 400 === 0.',
        ['Is 2000 a leap year?', 'Which clause of your condition would accept it?'],
        `function isLeapYear(year) {
  return year % 4 === 0 && year % 100 !== 0;
}`,
      ),
      v(
        'or-instead-of-and',
        'wrong-operator',
        'Uses || where && is needed',
        'With ||, a year passes if it is divisible by 4 or merely not divisible by 100, so most ordinary years count as leap years.',
        'Both conditions must hold, so join them with &&.',
        [
          'Is 2023 divisible by 4?',
          'What does your condition return for 2023, and which side made it true?',
        ],
        `function isLeapYear(year) {
  return (year % 4 === 0 || year % 100 !== 0) || year % 400 === 0;
}`,
      ),
    ],
  },
  {
    id: 'grade-letter',
    topic: 'logic',
    title: 'Letter grade',
    difficulty: 2,
    prompt:
      'Write `gradeLetter(score)` that returns "A" for 90–100, "B" for 80–89, "C" for 70–79, "D" for 60–69 and "F" below 60. If score is not a number from 0 to 100, return "Invalid".',
    concept: 'Boundaries are part of the spec: decide which side each edge value falls on.',
    fn: 'gradeLetter',
    starter: `function gradeLetter(score) {
  // return "A", "B", "C", "D", "F" or "Invalid"
}
`,
    reference: `function gradeLetter(score) {
  if (typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 100) return 'Invalid';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}`,
    tests: [
      { args: [95], cat: 'basic' },
      { args: [85], cat: 'basic' },
      { args: [72], cat: 'basic' },
      { args: [64], cat: 'basic' },
      { args: [30], cat: 'basic' },
      { args: [90], cat: 'edge' },
      { args: [80], cat: 'edge' },
      { args: [70], cat: 'edge' },
      { args: [60], cat: 'edge' },
      { args: [59], cat: 'edge' },
      { args: [0], cat: 'edge' },
      { args: [100], cat: 'edge' },
      { args: [101], cat: 'edge' },
      { args: [-1], cat: 'edge' },
      { args: ['A'], cat: 'edge' },
      { args: [null], cat: 'edge' },
    ],
    traceArgs: [85],
    track: [],
    variants: [
      v(
        'strict-greater',
        'boundary',
        'Edge scores fall into the lower grade',
        'The comparisons use > instead of >=, so exactly 90 is a B, exactly 80 a C, and so on.',
        'Use >= so the boundary value belongs to the higher grade.',
        [
          'Which grade should exactly 90 get?',
          'What does score > 90 say about a score of exactly 90?',
        ],
        `function gradeLetter(score) {
  if (typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 100) return 'Invalid';
  if (score > 90) return 'A';
  if (score > 80) return 'B';
  if (score > 70) return 'C';
  if (score > 60) return 'D';
  return 'F';
}`,
      ),
      v(
        'reversed-order',
        'control-flow',
        'Lowest grade is checked first',
        'Checking score >= 60 first catches every passing score, so nothing above D can ever be returned.',
        'Check the highest range first, or give each branch both a lower and an upper limit.',
        [
          'Which branch does a score of 95 reach first?',
          'Can it ever reach the A branch from there?',
        ],
        `function gradeLetter(score) {
  if (typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 100) return 'Invalid';
  if (score >= 60) return 'D';
  if (score >= 70) return 'C';
  if (score >= 80) return 'B';
  if (score >= 90) return 'A';
  return 'F';
}`,
      ),
      v(
        'no-validation',
        'edge-case',
        'Invalid scores get a grade',
        'There is no check for scores outside 0–100 or for values that are not numbers, so they fall through to a letter.',
        'Return "Invalid" first if the value is not a number or is outside 0–100.',
        [
          'What should gradeLetter(101) return?',
          'Which line in your function handles a score like that?',
        ],
        `function gradeLetter(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}`,
      ),
    ],
  },

  // ───────────────────────── Objects & maps ─────────────────────────
  {
    id: 'count-words',
    topic: 'objects',
    title: 'Word counts',
    difficulty: 2,
    prompt:
      'Write `countWords(words)` that takes an array of words and returns an object mapping each word to the number of times it appears.',
    concept: 'Create the entry the first time you see a key, then increment it.',
    fn: 'countWords',
    starter: `function countWords(words) {
  const counts = {};
  // for each word, add one to its count
  return counts;
}
`,
    reference: `function countWords(words) {
  const counts = {};
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (Object.hasOwn(counts, w)) counts[w] += 1;
    else counts[w] = 1;
  }
  return counts;
}`,
    tests: [
      { args: [['a', 'b', 'a']], cat: 'basic' },
      { args: [['the', 'cat', 'the', 'hat', 'the']], cat: 'basic' },
      { args: [['Apple', 'apple']], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [['x']], cat: 'edge' },
      { args: [['constructor', 'constructor', 'a']], cat: 'edge' },
      { args: [['toString', 'a']], cat: 'edge' },
      { args: [Array.from({ length: 300 }, (_, i) => 'w' + (i % 12))], cat: 'large' },
    ],
    traceArgs: [['to', 'be', 'or', 'not', 'to', 'be']],
    track: ['counts'],
    variants: [
      v(
        'overwrites',
        'logic',
        'Count is reset to 1 every time',
        'Each word is assigned 1 whenever it is seen, so a repeated word never goes above 1.',
        'Add 1 to the existing count when the key is already there.',
        [
          'What is counts["a"] after the second "a"?',
          'Which line sets the value, and does it use the old one?',
        ],
        `function countWords(words) {
  const counts = {};
  for (let i = 0; i < words.length; i++) {
    counts[words[i]] = 1;
  }
  return counts;
}`,
      ),
      v(
        'no-init',
        'bad-init',
        'Increments a key that does not exist yet',
        'The first time a word is seen, counts[word] is undefined, and undefined + 1 is NaN.',
        'Set the key to 1 the first time, or use (counts[w] || 0) + 1.',
        [
          'What is counts["a"] before "a" has been seen?',
          'What does ++ do to that value?',
        ],
        `function countWords(words) {
  const counts = {};
  for (let i = 0; i < words.length; i++) {
    counts[words[i]]++;
  }
  return counts;
}`,
      ),
      v(
        'inherited-keys',
        'edge-case',
        'Words like "constructor" are already "in" the object',
        'Every object inherits keys such as constructor and toString, so counts["constructor"] is already a function and the check "is it there yet?" gives the wrong answer.',
        'Ask whether the object has the key itself: Object.hasOwn(counts, w), or use a Map.',
        [
          'What does {}["constructor"] return?',
          'Does your "have I seen this word?" check tell an own key from an inherited one?',
        ],
        `function countWords(words) {
  const counts = {};
  for (let i = 0; i < words.length; i++) {
    counts[words[i]] = (counts[words[i]] || 0) + 1;
  }
  return counts;
}`,
      ),
    ],
  },
  {
    id: 'group-by-length',
    topic: 'objects',
    title: 'Group by length',
    difficulty: 2,
    prompt:
      'Write `groupByLength(words)` that returns an object whose keys are word lengths and whose values are arrays of the words with that length, in their original order.',
    concept: 'Create the container the first time you need it, then push into it.',
    fn: 'groupByLength',
    starter: `function groupByLength(words) {
  const groups = {};
  // put each word into the array for its length
  return groups;
}
`,
    reference: `function groupByLength(words) {
  const groups = {};
  for (let i = 0; i < words.length; i++) {
    const len = words[i].length;
    if (!groups[len]) groups[len] = [];
    groups[len].push(words[i]);
  }
  return groups;
}`,
    tests: [
      { args: [['a', 'bb', 'cc', 'd']], cat: 'basic' },
      { args: [['one', 'two', 'six', 'four', 'five']], cat: 'basic' },
      { args: [['hello']], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [['', 'a', '']], cat: 'edge' },
      { args: [Array.from({ length: 200 }, (_, i) => 'x'.repeat((i % 9) + 1))], cat: 'large' },
    ],
    traceArgs: [['hi', 'cat', 'yo', 'dog', 'a']],
    track: ['groups'],
    variants: [
      v(
        'no-array',
        'runtime',
        'Pushes into an array that was never created',
        'groups[len] is undefined the first time a length appears, and you cannot call push on undefined, so the code crashes.',
        'Create the array first: if (!groups[len]) groups[len] = [].',
        [
          'What is groups[3] before any 3-letter word has been seen?',
          'What happens when you call .push on that?',
        ],
        `function groupByLength(words) {
  const groups = {};
  for (let i = 0; i < words.length; i++) {
    groups[words[i].length].push(words[i]);
  }
  return groups;
}`,
      ),
      v(
        'overwrites-array',
        'logic',
        'Replaces the array instead of adding to it',
        'A new one-item array is stored each time, so only the last word of each length survives.',
        'Create the array only when it does not exist, then push onto the existing one.',
        [
          'After "cat" and then "dog", what does groups[3] hold in your code?',
          'Which line decides whether a new array is made?',
        ],
        `function groupByLength(words) {
  const groups = {};
  for (let i = 0; i < words.length; i++) {
    groups[words[i].length] = [words[i]];
  }
  return groups;
}`,
      ),
    ],
  },
  {
    id: 'invert-object',
    topic: 'objects',
    title: 'Invert an object',
    difficulty: 3,
    prompt:
      'Write `invertObject(obj)` that returns a new object with the keys and values swapped. If two keys share a value, the later key wins. The original object must not change.',
    concept: 'Read from the input, write to a new object.',
    fn: 'invertObject',
    starter: `function invertObject(obj) {
  const result = {};
  // for each key, store result[value] = key
  return result;
}
`,
    reference: `function invertObject(obj) {
  const result = {};
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    result[obj[keys[i]]] = keys[i];
  }
  return result;
}`,
    tests: [
      { args: [{ a: 'x', b: 'y' }], cat: 'basic' },
      { args: [{ a: 1, b: 2 }], cat: 'basic' },
      { args: [{ one: 1, two: 2, three: 3 }], cat: 'basic' },
      { args: [{}], cat: 'edge' },
      { args: [{ a: 'x', b: 'x' }], cat: 'edge' },
      { args: [{ k: 'v' }], cat: 'edge' },
      {
        args: [Object.fromEntries(Array.from({ length: 80 }, (_, i) => ['key' + i, 'val' + (i % 40)]))],
        cat: 'large',
      },
    ],
    traceArgs: [{ a: 'x', b: 'y', c: 'x' }],
    track: ['result'],
    variants: [
      v(
        'mutates',
        'mutation',
        'Edits the original object',
        'The inverted pairs are written into obj itself and the old keys are deleted, so the caller\'s object is changed.',
        'Create a new object and write the swapped pairs into it.',
        [
          'After the call, what does the original variable contain?',
          'Which object are you writing the swapped pairs into?',
        ],
        `function invertObject(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    obj[obj[keys[i]]] = keys[i];
    delete obj[keys[i]];
  }
  return obj;
}`,
      ),
      v(
        'first-wins',
        'logic',
        'Keeps the first key instead of the last',
        'When two keys share a value, the first one is kept. The problem says the later key wins.',
        'Always assign, so a later key overwrites an earlier one.',
        [
          'For { a: "x", b: "x" }, which key should "x" map to?',
          'What does your check do when "x" is already in the result?',
        ],
        `function invertObject(obj) {
  const result = {};
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (!(obj[keys[i]] in result)) result[obj[keys[i]]] = keys[i];
  }
  return result;
}`,
      ),
    ],
  },

  // ───────────────────────────── Recursion ─────────────────────────────
  {
    id: 'sum-digits',
    topic: 'recursion',
    title: 'Sum of digits',
    difficulty: 2,
    prompt:
      'Write `sumDigits(n)` that returns the sum of the digits of a whole number n ≥ 0, using recursion. sumDigits(1234) is 10.',
    concept: 'Peel off one digit, recurse on the rest, and stop at a single digit.',
    fn: 'sumDigits',
    starter: `function sumDigits(n) {
  // base case first, then the recursive step
}
`,
    reference: `function sumDigits(n) {
  if (n < 10) return n;
  return (n % 10) + sumDigits(Math.floor(n / 10));
}`,
    tests: [
      { args: [123], cat: 'basic' },
      { args: [9999], cat: 'basic' },
      { args: [98765], cat: 'basic' },
      { args: [10], cat: 'basic' },
      { args: [0], cat: 'edge' },
      { args: [7], cat: 'edge' },
      { args: [100], cat: 'edge' },
      { args: [1000000007], cat: 'large' },
    ],
    traceArgs: [472],
    track: [],
    variants: [
      v(
        'no-base-case',
        'base-case',
        'No stopping case',
        'There is no base case, so the function keeps calling itself with 0 forever until the call stack overflows.',
        'Return early when n has a single digit (n < 10).',
        [
          'What is Math.floor(0 / 10), and what does your function do with it?',
          'What is the smallest input, and what should it return without recursing?',
        ],
        `function sumDigits(n) {
  return (n % 10) + sumDigits(Math.floor(n / 10));
}`,
      ),
      v(
        'drops-last-digit',
        'base-case',
        'Base case returns 0 for a single digit',
        'When one digit is left it is thrown away (returns 0) instead of being counted.',
        'A single digit n has digit-sum n, so return n.',
        [
          'What is sumDigits(7) supposed to be?',
          'What does your base case return for it?',
        ],
        `function sumDigits(n) {
  if (n < 10) return 0;
  return (n % 10) + sumDigits(Math.floor(n / 10));
}`,
      ),
      v(
        'skips-digits',
        'logic',
        'Removes two digits per call',
        'Dividing by 100 drops two digits at once, so every second digit is never added.',
        'Divide by 10 to remove exactly one digit.',
        [
          'How many digits does n lose when you divide by 100?',
          'Which digits get added in your version for 1234?',
        ],
        `function sumDigits(n) {
  if (n < 10) return n;
  return (n % 10) + sumDigits(Math.floor(n / 100));
}`,
      ),
    ],
  },
  {
    id: 'fibonacci',
    topic: 'recursion',
    title: 'Fibonacci',
    difficulty: 2,
    prompt:
      'Write `fib(n)` that returns the nth Fibonacci number using recursion, with fib(0) = 0 and fib(1) = 1.',
    concept: 'Two base cases, then combine the two smaller answers.',
    fn: 'fib',
    starter: `function fib(n) {
  // two base cases, then add the previous two
}
`,
    reference: `function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}`,
    tests: [
      { args: [5], cat: 'basic' },
      { args: [8], cat: 'basic' },
      { args: [10], cat: 'basic' },
      { args: [3], cat: 'basic' },
      { args: [0], cat: 'edge' },
      { args: [1], cat: 'edge' },
      { args: [2], cat: 'edge' },
      { args: [20], cat: 'large' },
    ],
    traceArgs: [5],
    track: [],
    variants: [
      v(
        'zero-is-one',
        'base-case',
        'fib(0) returns 1',
        'The base case treats 0 like 1. The sequence starts 0, 1, 1, 2, so fib(0) must be 0.',
        'Return n for n < 2, which gives 0 and 1.',
        ['What should fib(0) return?', 'What does your base case return for 0?'],
        `function fib(n) {
  if (n <= 2) return 1;
  return fib(n - 1) + fib(n - 2);
}`,
      ),
      v(
        'shifted',
        'base-case',
        'Both base cases return 1',
        'Returning 1 for 0 and 1 shifts the whole sequence by one place, so every answer after that is off.',
        'fib(0) is 0 and fib(1) is 1: return n when n < 2.',
        ['What are the first four Fibonacci numbers?', 'What does your code give for fib(0) and fib(1)?'],
        `function fib(n) {
  if (n < 2) return 1;
  return fib(n - 1) + fib(n - 2);
}`,
      ),
      v(
        'same-call-twice',
        'logic',
        'Calls fib(n - 1) twice',
        'The second recursive call should use n − 2. With n − 1 twice, the result doubles instead of following the sequence.',
        'Add fib(n - 1) and fib(n - 2).',
        [
          'Which two earlier numbers does Fibonacci add?',
          'Which two calls are in your return line?',
        ],
        `function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 1);
}`,
      ),
    ],
  },
  {
    id: 'flatten',
    topic: 'recursion',
    title: 'Flatten nested arrays',
    difficulty: 3,
    prompt:
      'Write `flatten(arr)` that returns a single flat array from an array that can be nested to any depth, keeping the order. Use recursion; do not use .flat().',
    concept: 'If an item is an array, flatten it first; otherwise keep it.',
    fn: 'flatten',
    starter: `function flatten(arr) {
  const result = [];
  // for each item: recurse if it is an array, otherwise push it
  return result;
}
`,
    reference: `function flatten(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      result.push(...flatten(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}`,
    tests: [
      { args: [[1, [2, [3, [4]]]]], cat: 'basic' },
      { args: [[1, [2, 3], [[4]], 5]], cat: 'basic' },
      { args: [[[1], [2], [3]]], cat: 'basic' },
      { args: [[1, 2, 3]], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [[[], [[]]]], cat: 'edge' },
      { args: [[[[[[1]]]]]], cat: 'edge' },
      { args: [Array.from({ length: 60 }, (_, i) => (i % 3 === 0 ? [i, [i + 1]] : i))], cat: 'large' },
    ],
    traceArgs: [[1, [2, [3]], 4]],
    track: ['result'],
    variants: [
      v(
        'one-level',
        'logic',
        'Only flattens one level',
        'Items that are arrays are opened once, but arrays inside those arrays are left nested.',
        'Call flatten on each nested array so deeper levels are opened too.',
        [
          'What does your code give for [1, [2, [3]]]?',
          'Which part of the code handles an array found inside an array you just opened?',
        ],
        `function flatten(arr) {
  return [].concat(...arr);
}`,
      ),
      v(
        'no-spread',
        'logic',
        'Pushes the flattened array as one item',
        'The recursive result is itself an array, and pushing it adds the whole array as a single element, so nesting remains.',
        'Spread the result into the push: result.push(...flatten(item)).',
        [
          'What does result.push([2, 3]) do to result?',
          'How could you add 2 and 3 as separate items?',
        ],
        `function flatten(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      result.push(flatten(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}`,
      ),
    ],
  },
];

/** Course exercises first (in course order), then the problem-solving sets. */
export const PROBLEMS: Problem[] = [...COURSE_PROBLEMS, ...SOLVING_PROBLEMS];

const byId = new Map(PROBLEMS.map((p) => [p.id, p]));

export function getProblem(id: string): Problem | undefined {
  return byId.get(id);
}

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
