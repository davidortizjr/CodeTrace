import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

export const U3_EXERCISES: Problem[] = [
  // ── js-arrays ─────────────────────────────────────────────────────────
  {
    id: 'ex-js-arrays-remove',
    topic: 'js-data',
    lesson: 'js-arrays',
    title: 'Remove one item',
    difficulty: 1,
    prompt:
      'Write `removeAt(items, index)` that returns a new array with the item at `index` left out. Do not change the original array. If `index` is past the end, return a copy with nothing removed. Example: `removeAt([10, 20, 30], 1)` returns `[10, 30]`.',
    concept: 'slice copies part of an array, and spread joins the parts into a new one without touching the original.',
    fn: 'removeAt',
    starter: `function removeAt(items, index) {
  // return a new array without the item at index
}
`,
    reference: `function removeAt(items, index) {
  return [...items.slice(0, index), ...items.slice(index + 1)];
}`,
    tests: [
      { args: [[10, 20, 30], 1], cat: 'basic' },
      { args: [['a', 'b', 'c', 'd'], 0], cat: 'basic' },
      { args: [[1, 2, 3], 2], cat: 'basic' },
      { args: [['x', 'y'], 1], cat: 'basic' },
      { args: [[5], 0], cat: 'edge' },
      { args: [[1, 2, 3], 7], cat: 'edge' },
      { args: [[], 0], cat: 'edge' },
    ],
    traceArgs: [[10, 20, 30], 1],
    track: [],
    variants: [
      v(
        'returns-removed',
        'mutation',
        'Returns the removed item instead of the remaining array',
        'splice changes the original array and returns the items it cut out, so the function hands back [20] and not [10, 30].',
        'Build a new array from the parts before and after the index instead of using splice.',
        ['What does splice return?', 'Is the original array supposed to change?'],
        `function removeAt(items, index) {
  return items.splice(index, 1);
}`,
      ),
      v(
        'keeps-item',
        'off-by-one',
        'The item at the index is kept',
        'The second slice starts at index instead of index + 1, so the item you wanted to remove is copied back in.',
        'The part after the removed item starts one place later than the index.',
        ['Which position does slice(index) start from?', 'Which position should the second part start from?'],
        `function removeAt(items, index) {
  return [...items.slice(0, index), ...items.slice(index)];
}`,
      ),
      v(
        'drops-tail',
        'logic',
        'Everything after the index is lost',
        'slice(0, index) keeps only the items before the index. The items after it are never copied.',
        'Add the items after the removed one back into the result.',
        ['What does slice(0, 1) return for [10, 20, 30]?', 'Where do the items after index go?'],
        `function removeAt(items, index) {
  return items.slice(0, index);
}`,
      ),
      v(
        'delete-hole',
        'logic',
        'Leaves an empty slot instead of closing the gap',
        'The delete operator empties the slot but does not move the other items, so the array keeps its length and has a hole.',
        'Delete does not shift anything. Build the result from two slices instead.',
        ['What is the length of the result compared with the original?', 'Does delete move the later items down?'],
        `function removeAt(items, index) {
  const copy = [...items];
  delete copy[index];
  return copy;
}`,
      ),
    ],
  },
  {
    id: 'ex-js-arrays-last',
    topic: 'js-data',
    lesson: 'js-arrays',
    title: 'Last few items',
    difficulty: 2,
    prompt:
      'Write `lastN(items, n)` that returns a new array with the last `n` items, in their original order. If `n` is 0, return an empty array. If `n` is bigger than the array, return all the items. Example: `lastN([1, 2, 3, 4], 2)` returns `[3, 4]`.',
    concept: 'A negative slice start counts from the end, and 0 is the one number where that trick breaks.',
    fn: 'lastN',
    starter: `function lastN(items, n) {
  // return the last n items as a new array
}
`,
    reference: `function lastN(items, n) {
  if (n === 0) return [];
  return items.slice(-n);
}`,
    tests: [
      { args: [[1, 2, 3, 4], 2], cat: 'basic' },
      { args: [['a', 'b', 'c'], 1], cat: 'basic' },
      { args: [[9, 8, 7, 6, 5], 4], cat: 'basic' },
      { args: [[1, 2, 3], 3], cat: 'edge' },
      { args: [[1, 2, 3], 0], cat: 'edge' },
      { args: [[1, 2, 3], 5], cat: 'edge' },
      { args: [[], 2], cat: 'edge' },
    ],
    traceArgs: [[1, 2, 3, 4], 2],
    track: [],
    variants: [
      v(
        'no-zero-check',
        'edge-case',
        'Asking for 0 items returns the whole array',
        'slice(-0) is the same as slice(0), which starts at the beginning, so the result is a full copy and not an empty array.',
        'Handle n === 0 before you use a negative slice.',
        ['What is -0 compared with 0?', 'What does slice(0) return?'],
        `function lastN(items, n) {
  return items.slice(-n);
}`,
      ),
      v(
        'length-minus-n',
        'boundary',
        'Goes wrong when n is bigger than the array',
        'items.length - n becomes negative when n is larger than the length, and a negative start counts from the end, so some items are lost.',
        'Make sure the start is never below 0, or use a negative start directly.',
        ['What is items.length - n for 3 items and n = 5?', 'What does slice do with that number?'],
        `function lastN(items, n) {
  return items.slice(items.length - n);
}`,
      ),
      v(
        'first-n',
        'logic',
        'Returns the first n items, not the last',
        'slice(0, n) copies from the start of the array, so it gives the first n items.',
        'You want the end of the array. A negative start counts from the end.',
        ['Which end of the array does slice(0, n) take from?'],
        `function lastN(items, n) {
  return items.slice(0, n);
}`,
      ),
      v(
        'skip-n',
        'logic',
        'Drops the first n items instead of keeping the last n',
        'slice(n) skips the first n items and keeps everything after them, which is the opposite of what is asked.',
        'Keep n items from the end, not everything after the first n.',
        ['For [1, 2, 3, 4] and n = 2, what does slice(2) return?'],
        `function lastN(items, n) {
  return items.slice(n);
}`,
      ),
    ],
  },

  // ── js-array-methods ──────────────────────────────────────────────────
  {
    id: 'ex-js-array-methods-odds',
    topic: 'js-data',
    lesson: 'js-array-methods',
    title: 'Sum of odd squares',
    difficulty: 1,
    prompt:
      'Write `sumOddSquares(numbers)` that squares every odd number in the array and returns the sum of those squares. An empty array, or an array with no odd numbers, gives 0. Negative numbers count too: -3 is odd. Example: `sumOddSquares([1, 2, 3])` returns `10` (1 + 9).',
    concept: 'Chain filter, map and reduce, and give reduce a starting value so an empty array works.',
    fn: 'sumOddSquares',
    starter: `function sumOddSquares(numbers) {
  // keep the odd numbers, square them, add them up
}
`,
    reference: `function sumOddSquares(numbers) {
  return numbers
    .filter((n) => n % 2 !== 0)
    .map((n) => n * n)
    .reduce((sum, n) => sum + n, 0);
}`,
    tests: [
      { args: [[1, 2, 3]], cat: 'basic' },
      { args: [[4, 5, 6, 7]], cat: 'basic' },
      { args: [[9]], cat: 'basic' },
      { args: [[1, 3, 5, 7, 9, 11]], cat: 'large' },
      { args: [[2, 4, 6]], cat: 'edge' },
      { args: [[]], cat: 'edge' },
      { args: [[-3, 2]], cat: 'edge' },
    ],
    traceArgs: [[1, 2, 3]],
    track: [],
    variants: [
      v(
        'no-initial',
        'bad-init',
        'reduce has no starting value',
        'Without a starting value reduce uses the first item as the start, and on an empty array it throws a TypeError.',
        'Pass 0 as the second argument to reduce.',
        ['What does reduce do on an empty array when it has no starting value?', 'Which test crashed?'],
        `function sumOddSquares(numbers) {
  return numbers
    .filter((n) => n % 2 !== 0)
    .map((n) => n * n)
    .reduce((sum, n) => sum + n);
}`,
      ),
      v(
        'negative-odd',
        'edge-case',
        'Negative odd numbers are missed',
        'In JavaScript -3 % 2 is -1, not 1, so a test of === 1 skips negative odd numbers.',
        'Test for "not zero" instead of "equal to one".',
        ['What is -3 % 2?', 'What does your test say about -1?'],
        `function sumOddSquares(numbers) {
  return numbers
    .filter((n) => n % 2 === 1)
    .map((n) => n * n)
    .reduce((sum, n) => sum + n, 0);
}`,
      ),
      v(
        'no-square',
        'logic',
        'Adds the odd numbers without squaring them',
        'The map step is missing, so the odd numbers are summed as they are.',
        'Square each odd number before adding.',
        ['For [1, 2, 3], what should be added: 1 + 3 or 1 + 9?'],
        `function sumOddSquares(numbers) {
  return numbers
    .filter((n) => n % 2 !== 0)
    .reduce((sum, n) => sum + n, 0);
}`,
      ),
      v(
        'evens',
        'wrong-operator',
        'Uses the even numbers instead of the odd ones',
        'The filter keeps numbers where n % 2 is 0, and those are the even numbers.',
        'An odd number leaves a remainder when you divide by 2.',
        ['What is 3 % 2?', 'What does your filter keep for [1, 2, 3]?'],
        `function sumOddSquares(numbers) {
  return numbers
    .filter((n) => n % 2 === 0)
    .map((n) => n * n)
    .reduce((sum, n) => sum + n, 0);
}`,
      ),
    ],
  },
  {
    id: 'ex-js-array-methods-top',
    topic: 'js-data',
    lesson: 'js-array-methods',
    title: 'Top scores',
    difficulty: 2,
    prompt:
      'Write `topScores(scores, n)` that returns the `n` highest scores, highest first. Do not change the original array. If there are fewer than `n` scores, return them all. Example: `topScores([50, 9, 100, 25], 2)` returns `[100, 50]`.',
    concept: 'sort needs a comparator for numbers, and it changes the array unless you copy first.',
    fn: 'topScores',
    starter: `function topScores(scores, n) {
  // sort from highest to lowest, then keep the first n
}
`,
    reference: `function topScores(scores, n) {
  return [...scores].sort((a, b) => b - a).slice(0, n);
}`,
    tests: [
      { args: [[50, 9, 100, 25], 2], cat: 'basic' },
      { args: [[5, 12, 8], 3], cat: 'basic' },
      { args: [[70, 95, 80, 100], 1], cat: 'basic' },
      { args: [[10, 9, 100, 1000, 99], 4], cat: 'large' },
      { args: [[7, 7, 3], 2], cat: 'edge' },
      { args: [[3, 1, 2], 10], cat: 'edge' },
      { args: [[], 3], cat: 'edge' },
    ],
    traceArgs: [[50, 9, 100, 25], 2],
    track: [],
    variants: [
      v(
        'default-sort',
        'sort-lexicographic',
        'Sorts the numbers as text',
        'sort() with no comparator compares the numbers as strings, so 100 comes before 25 and 9 comes last.',
        'Pass a comparator such as (a, b) => b - a.',
        ['How does "9" compare with "100" as text?', 'What does sort do when you give it no function?'],
        `function topScores(scores, n) {
  return [...scores].sort().reverse().slice(0, n);
}`,
      ),
      v(
        'ascending',
        'logic',
        'Sorts lowest first, so the lowest scores are returned',
        'The comparator a - b puts small numbers first, so slice(0, n) keeps the n lowest scores.',
        'Swap the comparator so the biggest number comes first.',
        ['Which end of the sorted array holds the highest scores?'],
        `function topScores(scores, n) {
  return [...scores].sort((a, b) => a - b).slice(0, n);
}`,
      ),
      v(
        'slice-first',
        'logic',
        'Takes the first n scores before sorting',
        'The array is cut down to its first n items and only then sorted, so a high score further along is never considered.',
        'Sort the whole array first, then take the first n.',
        ['In what order should sort and slice happen?', 'Which scores does slice(0, 2) see for [50, 9, 100, 25]?'],
        `function topScores(scores, n) {
  return scores.slice(0, n).sort((a, b) => b - a);
}`,
      ),
      v(
        'one-short',
        'off-by-one',
        'Returns one score too few',
        'slice(0, n - 1) stops before the last wanted item, so only n - 1 scores come back.',
        'The end of slice is not included, so it should be n.',
        ['How many items does slice(0, 1) return?', 'What should the end position be for n items?'],
        `function topScores(scores, n) {
  return [...scores].sort((a, b) => b - a).slice(0, n - 1);
}`,
      ),
    ],
  },

  // ── js-objects ────────────────────────────────────────────────────────
  {
    id: 'ex-js-objects-describe',
    topic: 'js-data',
    lesson: 'js-objects',
    title: 'Where do they live?',
    difficulty: 1,
    prompt:
      'Write `describeUser(user)` that returns `"<name> lives in <city>"` using `user.name` and `user.address.city`. If there is no city to show (the address is missing, `null`, or has no city), return `"<name> has no city"`. Example: `describeUser({ name: "Ada", address: { city: "London" } })` returns `Ada lives in London`.',
    concept: 'Optional chaining reads nested data without crashing when a middle step is missing.',
    fn: 'describeUser',
    starter: `function describeUser(user) {
  // read the city from the address, if there is one
}
`,
    reference: `function describeUser(user) {
  const city = user.address?.city;
  if (city === undefined) return user.name + ' has no city';
  return user.name + ' lives in ' + city;
}`,
    tests: [
      { args: [{ name: 'Ada', address: { city: 'London' } }], cat: 'basic' },
      { args: [{ name: 'Ben', address: { city: 'Oslo', zip: '0150' } }], cat: 'basic' },
      { args: [{ name: 'Fay', age: 30, address: { city: 'Rome' } }], cat: 'basic' },
      { args: [{ name: 'Cy' }], cat: 'edge' },
      { args: [{ name: 'Dee', address: null }], cat: 'edge' },
      { args: [{ name: 'Eli', address: {} }], cat: 'edge' },
    ],
    traceArgs: [{ name: 'Ada', address: { city: 'London' } }],
    track: [],
    variants: [
      v(
        'no-optional-chaining',
        'edge-case',
        'Crashes when the address is missing',
        'user.address is undefined for some users, and reading .city from undefined throws a TypeError.',
        'Use ?. so the read stops quietly when the address is missing.',
        ['What is user.address when a user has no address?', 'What happens when you read a key of undefined?'],
        `function describeUser(user) {
  const city = user.address.city;
  if (city === undefined) return user.name + ' has no city';
  return user.name + ' lives in ' + city;
}`,
      ),
      v(
        'only-undefined-address',
        'edge-case',
        'Only handles a missing address, not null',
        'The check catches undefined but a null address gets past it, and reading .city from null throws a TypeError.',
        'Optional chaining handles both undefined and null in one go.',
        ['What does user.address === undefined say when the address is null?'],
        `function describeUser(user) {
  if (user.address === undefined) return user.name + ' has no city';
  const city = user.address.city;
  if (city === undefined) return user.name + ' has no city';
  return user.name + ' lives in ' + city;
}`,
      ),
      v(
        'prints-undefined',
        'edge-case',
        'Prints "undefined" when there is no city',
        'The city is read safely but never checked, so the text ends up saying "lives in undefined".',
        'Check whether the city is undefined before you build the sentence.',
        ['What does "lives in " + undefined give?', 'Where do you handle the no-city case?'],
        `function describeUser(user) {
  const city = user.address?.city;
  return user.name + ' lives in ' + city;
}`,
      ),
      v(
        'wrong-place',
        'logic',
        'Looks for the city on the user, not inside the address',
        'The city lives at user.address.city. user.city does not exist, so every user is reported as having no city.',
        'The city is one level down, inside address.',
        ['Which object holds the city key?'],
        `function describeUser(user) {
  const city = user?.city;
  if (city === undefined) return user.name + ' has no city';
  return user.name + ' lives in ' + city;
}`,
      ),
    ],
  },
  {
    id: 'ex-js-objects-priciest',
    topic: 'js-data',
    lesson: 'js-objects',
    title: 'Priciest item',
    difficulty: 2,
    prompt:
      'Write `priciest(prices)` that takes an object of item names and prices and returns the name of the most expensive item. If two items cost the same, return the one that comes first. For an empty object, return `null`. Example: `priciest({ tea: 3, cake: 5, jam: 2 })` returns `cake`.',
    concept: 'Object.keys gives you the names to loop over, and the name looks up the value.',
    fn: 'priciest',
    starter: `function priciest(prices) {
  // loop over the keys and remember the best one so far
}
`,
    reference: `function priciest(prices) {
  let bestName = null;
  let bestPrice = -Infinity;
  for (const name of Object.keys(prices)) {
    if (prices[name] > bestPrice) {
      bestName = name;
      bestPrice = prices[name];
    }
  }
  return bestName;
}`,
    tests: [
      { args: [{ tea: 3, cake: 5, jam: 2 }], cat: 'basic' },
      { args: [{ pen: 2, ink: 8, pad: 5, cap: 11 }], cat: 'basic' },
      { args: [{ x: 1.5, y: 1.25 }], cat: 'basic' },
      { args: [{ a: 10 }], cat: 'edge' },
      { args: [{ a: 2, b: 9, c: 4, d: 9 }], cat: 'edge' },
      { args: [{ a: 0, b: 0 }], cat: 'edge' },
      { args: [{}], cat: 'edge' },
    ],
    traceArgs: [{ pen: 2, ink: 8, pad: 5, cap: 11 }],
    track: ['bestName', 'bestPrice'],
    variants: [
      v(
        'cheapest',
        'wrong-operator',
        'Finds the cheapest item instead of the priciest',
        'The comparison is the wrong way round: it replaces the best item whenever it sees a smaller price.',
        'Replace the best item when the new price is larger.',
        ['Which comparison operator means "more expensive than"?'],
        `function priciest(prices) {
  let bestName = null;
  let bestPrice = Infinity;
  for (const name of Object.keys(prices)) {
    if (prices[name] < bestPrice) {
      bestName = name;
      bestPrice = prices[name];
    }
  }
  return bestName;
}`,
      ),
      v(
        'tie-last',
        'boundary',
        'On a tie it returns the later item',
        'Using >= replaces the best item even when the price is only equal, so the last of the equal items wins.',
        'Only replace the best item when the new price is strictly larger.',
        ['What should happen when the new price equals the best price?'],
        `function priciest(prices) {
  let bestName = null;
  let bestPrice = -Infinity;
  for (const name of Object.keys(prices)) {
    if (prices[name] >= bestPrice) {
      bestName = name;
      bestPrice = prices[name];
    }
  }
  return bestName;
}`,
      ),
      v(
        'returns-price',
        'logic',
        'Returns the price instead of the name',
        'The function finds the right item but returns its price. The question asks for the name.',
        'Return the variable that holds the name.',
        ['What does the function return on the last line?', 'What did the prompt ask for?'],
        `function priciest(prices) {
  let bestName = null;
  let bestPrice = -Infinity;
  for (const name of Object.keys(prices)) {
    if (prices[name] > bestPrice) {
      bestName = name;
      bestPrice = prices[name];
    }
  }
  return bestPrice;
}`,
      ),
      v(
        'zero-start',
        'bad-init',
        'Starts the best price at 0, so free items are never chosen',
        'With a start of 0 and a strict > test, a price of 0 never beats it, so when every price is 0 no item is picked.',
        'Start from a value that every price can beat, such as -Infinity.',
        ['What happens when every price is 0?', 'Which starting value can any number beat?'],
        `function priciest(prices) {
  let bestName = null;
  let bestPrice = 0;
  for (const name of Object.keys(prices)) {
    if (prices[name] > bestPrice) {
      bestName = name;
      bestPrice = prices[name];
    }
  }
  return bestName;
}`,
      ),
    ],
  },

  // ── js-maps-sets ──────────────────────────────────────────────────────
  {
    id: 'ex-js-maps-sets-unique',
    topic: 'js-data',
    lesson: 'js-maps-sets',
    title: 'Remove duplicates',
    difficulty: 1,
    prompt:
      'Write `removeDuplicates(items)` that returns a new array with each value once, in the order each value first appears. Example: `removeDuplicates([3, 1, 3, 2, 1])` returns `[3, 1, 2]`. The number 1 and the text "1" are different values.',
    concept: 'A Set keeps each value once, and spread turns it back into an array.',
    fn: 'removeDuplicates',
    starter: `function removeDuplicates(items) {
  // return each value once, in order of first appearance
}
`,
    reference: `function removeDuplicates(items) {
  return [...new Set(items)];
}`,
    tests: [
      { args: [[3, 1, 3, 2, 1]], cat: 'basic' },
      { args: [['a', 'b', 'a']], cat: 'basic' },
      { args: [[4, 2, 4, 2, 9, 9, 1]], cat: 'basic' },
      { args: [[1, '1', 1]], cat: 'edge' },
      { args: [[5, 5, 5, 5]], cat: 'edge' },
      { args: [['x']], cat: 'edge' },
      { args: [[]], cat: 'edge' },
    ],
    traceArgs: [[3, 1, 3, 2, 1]],
    track: [],
    variants: [
      v(
        'sorted',
        'logic',
        'Sorts the result, so the original order is lost',
        'sort() reorders the values (and as text), but the answer must keep the order each value first appeared in.',
        'A Set already keeps the order of first appearance, so no sort is needed.',
        ['Does the problem ask for the values to be sorted?', 'What order does a Set keep?'],
        `function removeDuplicates(items) {
  return [...new Set(items)].sort();
}`,
      ),
      v(
        'only-unique',
        'logic',
        'Removes every value that repeats instead of keeping one copy',
        'The filter keeps only values that appear exactly once, so a repeated value disappears completely.',
        'Each repeated value should stay once. A Set does that for you.',
        ['For [3, 1, 3], should 3 stay or go?'],
        `function removeDuplicates(items) {
  return items.filter((item) => items.indexOf(item) === items.lastIndexOf(item));
}`,
      ),
      v(
        'only-neighbours',
        'logic',
        'Only removes duplicates that sit next to each other',
        'The loop compares each item with the last one added, so a repeat that comes later after a different value gets through.',
        'Check against everything seen so far, not only the previous item. A Set does exactly that.',
        ['For [3, 1, 3], what is the last item added when the second 3 arrives?'],
        `function removeDuplicates(items) {
  const result = [];
  for (const item of items) {
    if (item !== result[result.length - 1]) {
      result.push(item);
    }
  }
  return result;
}`,
      ),
      v(
        'returns-set',
        'logic',
        'Returns a Set, not an array',
        'new Set(items) is a Set object. The function must return an array, so it needs spreading or Array.from.',
        'Turn the Set back into an array with [...set].',
        ['What type does new Set(items) give you?', 'How do you turn a Set into an array?'],
        `function removeDuplicates(items) {
  return new Set(items);
}`,
      ),
    ],
  },
  {
    id: 'ex-js-maps-sets-common',
    topic: 'js-data',
    lesson: 'js-maps-sets',
    title: 'Most common word',
    difficulty: 2,
    prompt:
      'Write `mostCommon(words)` that returns the word that appears most often. If two words appear equally often, return the one that appeared first in the list. For an empty array, return `null`. Example: `mostCommon(["red", "blue", "red"])` returns `red`.',
    concept: 'Count with a Map, then loop over the counts to find the best one.',
    fn: 'mostCommon',
    starter: `function mostCommon(words) {
  // count each word in a Map, then find the word with the highest count
}
`,
    reference: `function mostCommon(words) {
  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const word of counts.keys()) {
    if (counts.get(word) > bestCount) {
      best = word;
      bestCount = counts.get(word);
    }
  }
  return best;
}`,
    tests: [
      { args: [['red', 'blue', 'red']], cat: 'basic' },
      { args: [['a', 'b', 'b', 'c', 'c', 'c']], cat: 'basic' },
      { args: [['cat', 'dog', 'cat', 'bird', 'dog', 'cat', 'dog', 'dog']], cat: 'large' },
      { args: [['x']], cat: 'edge' },
      { args: [['a', 'b', 'b', 'a']], cat: 'edge' },
      { args: [['one', 'two', 'three']], cat: 'edge' },
      { args: [[]], cat: 'edge' },
    ],
    traceArgs: [['a', 'b', 'b', 'c', 'c', 'c']],
    track: ['best', 'bestCount'],
    variants: [
      v(
        'missing-start',
        'bad-init',
        'A new word is counted from undefined, so the counts become NaN',
        'counts.get(word) is undefined the first time a word is seen, and undefined + 1 is NaN. No NaN is ever greater than the best count.',
        'Use a starting count of 0 when the word is not in the Map yet.',
        ['What does counts.get return for a word you have not stored?', 'What is undefined + 1?'],
        `function mostCommon(words) {
  const counts = new Map();
  for (const word of words) {
    counts.set(word, counts.get(word) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const word of counts.keys()) {
    if (counts.get(word) > bestCount) {
      best = word;
      bestCount = counts.get(word);
    }
  }
  return best;
}`,
      ),
      v(
        'tie-last',
        'boundary',
        'On a tie it returns the word that appeared later',
        'Using >= replaces the best word even when the count is only equal, so the last of the tied words wins.',
        'Only replace the best word when the count is strictly higher.',
        ['What should happen when a count equals the best count?'],
        `function mostCommon(words) {
  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const word of counts.keys()) {
    if (counts.get(word) >= bestCount) {
      best = word;
      bestCount = counts.get(word);
    }
  }
  return best;
}`,
      ),
      v(
        'returns-count',
        'logic',
        'Returns the count instead of the word',
        'The loop finds the highest count correctly, but the function returns that count and not the word it belongs to.',
        'Return the variable that holds the word.',
        ['What did the prompt ask the function to return?', 'Which variable holds the word?'],
        `function mostCommon(words) {
  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const word of counts.keys()) {
    if (counts.get(word) > bestCount) {
      best = word;
      bestCount = counts.get(word);
    }
  }
  return bestCount;
}`,
      ),
      v(
        'start-at-one',
        'bad-init',
        'Starts the best count at 1, so a word seen once is never chosen',
        'With bestCount starting at 1 and a strict > test, a count of 1 never wins, so a list where every word appears once gives null.',
        'Start the best count at 0 so that any real count can beat it.',
        ['What happens when every word appears only once?', 'Which starting count can a count of 1 beat?'],
        `function mostCommon(words) {
  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  let best = null;
  let bestCount = 1;
  for (const word of counts.keys()) {
    if (counts.get(word) > bestCount) {
      best = word;
      bestCount = counts.get(word);
    }
  }
  return best;
}`,
      ),
    ],
  },
];
