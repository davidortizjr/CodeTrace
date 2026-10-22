import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

const FETCH = `const fetchUser = (id) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id < 0) reject(new Error('not found'));
      else resolve({ id, name: 'user' + id });
    }, 10);
  });
`;

export const U4_MORE: Problem[] = [
  {
    id: 'ex-js-modules-stats',
    topic: 'js-modern',
    lesson: 'js-modules',
    title: 'Small helpers, one result',
    difficulty: 1,
    prompt:
      'Write `stats(nums)` that returns an object `{ min, max, mean }` for an array of numbers. Build it from small helper functions. For an empty array return `{ min: null, max: null, mean: null }`. Example: `stats([2, 4, 9])` returns `{ min: 2, max: 9, mean: 5 }`.',
    concept: 'Small private helpers behind one public function.',
    fn: 'stats',
    starter: `function stats(nums) {
  // return { min, max, mean }
}
`,
    reference: `function stats(nums) {
  if (nums.length === 0) return { min: null, max: null, mean: null };
  const sum = (list) => list.reduce((a, b) => a + b, 0);
  return { min: Math.min(...nums), max: Math.max(...nums), mean: sum(nums) / nums.length };
}`,
    tests: [
      { args: [[2, 4, 9]], cat: 'basic' },
      { args: [[5]], cat: 'basic' },
      { args: [[-3, 3]], cat: 'basic' },
      { args: [[10, 20, 30, 40]], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [[1, 2]], cat: 'edge' },
    ],
    traceArgs: [[2, 4, 9]],
    track: [],
    variants: [
      v(
        'no-empty-guard',
        'edge-case',
        'Empty arrays are not handled',
        'With no numbers, `Math.min()` is Infinity, `Math.max()` is -Infinity and the mean is NaN, instead of null.',
        'Return the object of nulls early when the array is empty.',
        ['What does Math.min() give with no arguments?'],
        `function stats(nums) {
  const sum = (list) => list.reduce((a, b) => a + b, 0);
  return { min: Math.min(...nums), max: Math.max(...nums), mean: sum(nums) / nums.length };
}`,
      ),
      v(
        'swapped',
        'logic',
        'min and max are swapped',
        'The smallest value is stored under max and the biggest under min.',
        'Use Math.min for min and Math.max for max.',
        ['Which property holds the smallest number in your result?'],
        `function stats(nums) {
  if (nums.length === 0) return { min: null, max: null, mean: null };
  const sum = (list) => list.reduce((a, b) => a + b, 0);
  return { min: Math.max(...nums), max: Math.min(...nums), mean: sum(nums) / nums.length };
}`,
      ),
      v(
        'sum-not-mean',
        'logic',
        'Returns the sum as the mean',
        'The total is never divided by how many numbers there are.',
        'Divide the sum by nums.length.',
        ['What is the mean of 2, 4 and 9?'],
        `function stats(nums) {
  if (nums.length === 0) return { min: null, max: null, mean: null };
  const sum = (list) => list.reduce((a, b) => a + b, 0);
  return { min: Math.min(...nums), max: Math.max(...nums), mean: sum(nums) };
}`,
      ),
    ],
  },
  {
    id: 'ex-js-async-load',
    topic: 'js-modern',
    lesson: 'js-async',
    title: 'Load every user',
    difficulty: 2,
    prompt:
      'The helper `fetchUser(id)` is given: it returns a promise of `{ id, name }` after a short wait. Write `loadNames(ids)` as an `async` function that fetches every id at the same time and returns the array of names in the same order as `ids`. For an empty array return `[]`. Example: `loadNames([1, 2])` resolves to `["user1", "user2"]`.',
    concept: 'Promise.all runs the jobs together and keeps their order.',
    fn: 'loadNames',
    starter: `${FETCH}
async function loadNames(ids) {
  // fetch every user and return their names
}
`,
    reference: `${FETCH}
async function loadNames(ids) {
  const users = await Promise.all(ids.map((id) => fetchUser(id)));
  return users.map((user) => user.name);
}`,
    tests: [
      { args: [[1, 2]], cat: 'basic' },
      { args: [[5]], cat: 'basic' },
      { args: [[3, 1, 2]], cat: 'basic' },
      { args: [[10, 20, 30, 40]], cat: 'basic' },
      { args: [[]], cat: 'edge' },
    ],
    traceArgs: [[1, 2]],
    track: [],
    variants: [
      v(
        'missing-await',
        'logic',
        'Maps the promises without waiting for them',
        'The map is applied to the promises themselves, so `user.name` is undefined and the result is an array of undefined.',
        'Wait for the promises with await Promise.all before reading the names.',
        ['What does fetchUser return: a user or a promise of a user?'],
        `${FETCH}
async function loadNames(ids) {
  const users = ids.map((id) => fetchUser(id));
  return users.map((user) => user.name);
}`,
      ),
      v(
        'returns-users',
        'logic',
        'Returns whole users instead of names',
        'The array of user objects is returned as it is.',
        'Map the users to their name property.',
        ['What should each item of the result be?'],
        `${FETCH}
async function loadNames(ids) {
  return await Promise.all(ids.map((id) => fetchUser(id)));
}`,
      ),
      v(
        'reversed',
        'logic',
        'Names come back in the wrong order',
        'The result is reversed, so it no longer lines up with the ids.',
        'Keep the order of ids.',
        ['Which name should come first for [3, 1, 2]?'],
        `${FETCH}
async function loadNames(ids) {
  const users = await Promise.all(ids.map((id) => fetchUser(id)));
  return users.map((user) => user.name).reverse();
}`,
      ),
    ],
  },
  {
    id: 'ex-js-async-safe',
    topic: 'js-modern',
    lesson: 'js-async',
    title: 'Safe lookup',
    difficulty: 2,
    prompt:
      'Using the given `fetchUser(id)` (it rejects for a negative id), write the `async` function `nameOrUnknown(id)` that returns the user\'s name, or the text `"unknown"` when the lookup fails. Example: `nameOrUnknown(4)` resolves to `"user4"` and `nameOrUnknown(-1)` resolves to `"unknown"`.',
    concept: 'try and catch around await handle a rejected promise.',
    fn: 'nameOrUnknown',
    starter: `${FETCH}
async function nameOrUnknown(id) {
  // return the name, or "unknown" when the lookup fails
}
`,
    reference: `${FETCH}
async function nameOrUnknown(id) {
  try {
    const user = await fetchUser(id);
    return user.name;
  } catch (error) {
    return 'unknown';
  }
}`,
    tests: [
      { args: [4], cat: 'basic' },
      { args: [-1], cat: 'basic' },
      { args: [0], cat: 'edge' },
      { args: [99], cat: 'basic' },
      { args: [-50], cat: 'edge' },
    ],
    traceArgs: [4],
    track: [],
    variants: [
      v(
        'no-catch',
        'runtime',
        'The rejection is not handled',
        'When fetchUser rejects, the error travels out of the function, so the result is a failure instead of "unknown".',
        'Wrap the await in try and catch, and return "unknown" in the catch.',
        ['What happens to an await when the promise is rejected?'],
        `${FETCH}
async function nameOrUnknown(id) {
  const user = await fetchUser(id);
  return user.name;
}`,
      ),
      v(
        'no-await',
        'logic',
        'The await is missing',
        'Without await the promise is never waited for, so the catch never sees the rejection and a user object is read as a promise.',
        'Put await in front of fetchUser(id).',
        ['What does `fetchUser(id).name` read when it is still a promise?'],
        `${FETCH}
async function nameOrUnknown(id) {
  try {
    const user = fetchUser(id);
    return user.name;
  } catch (error) {
    return 'unknown';
  }
}`,
      ),
      v(
        'zero-is-unknown',
        'edge-case',
        'Treats id 0 as a failure',
        'A check like `if (!id)` rejects 0, which is a valid id.',
        'Let fetchUser decide what fails, and only handle its rejection.',
        ['Is 0 a valid id for fetchUser?'],
        `${FETCH}
async function nameOrUnknown(id) {
  if (!id) return 'unknown';
  try {
    const user = await fetchUser(id);
    return user.name;
  } catch (error) {
    return 'unknown';
  }
}`,
      ),
    ],
  },
];
