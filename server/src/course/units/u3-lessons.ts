import type { Lesson } from '../types.js';
import { js, mcq, OUT, short } from './quiz-helpers.js';

export const JS_OBJECTS: Lesson = {
  id: 'js-objects',
  title: 'Objects',
  summary: 'Group related values under names, read and change them, and copy an object without sharing it.',
  minutes: 14,
  objectives: [
    'Create an object and read, add, change and delete properties',
    'Choose between dot access and bracket access',
    'List keys, values and entries with Object.keys, Object.values and Object.entries',
    'Use optional chaining to read nested data safely',
    'Copy an object with spread and turn data into JSON text and back',
  ],
  sections: [
    {
      heading: 'Values with names',
      body: [
        'An **object** stores values under names, called **properties**. Write it with curly braces, and each property is a `name: value` pair. Use it when the things you store are different kinds of facts about one thing, like a user.',
        'Read a property with a dot, `user.name`. Assign to a property to change it, or to add a new one. `delete` removes one. Reading a property that does not exist gives `undefined`.',
      ],
      examples: [
        {
          id: 'basic',
          lang: 'js',
          code: `const user = { name: 'Ada', age: 36 };
console.log(user.name);
user.age = 37;
user.city = 'London';
console.log(user.age, user.city);
delete user.city;
console.log(user.city);`,
          output: ['Ada', '37 London', 'undefined'],
        },
        {
          id: 'const-object',
          lang: 'js',
          code: `const user = { name: 'Ada' };
user.name = 'Grace';
console.log(user.name);`,
          output: ['Grace'],
          caption: '`const` stops you reassigning `user`, not changing what is inside it.',
        },
      ],
    },
    {
      heading: 'Dot or brackets',
      body: [
        'Use brackets, `user["name"]`, when the property name is stored in a variable or is not a valid identifier. The text inside the brackets is calculated first. Shorthand lets you write `{ name }` instead of `{ name: name }`, and `[expression]` as a key computes the key.',
      ],
      examples: [
        {
          id: 'brackets',
          lang: 'js',
          code: `const field = 'age';
const name = 'Ada';
const user = { name, [field]: 36, 'home town': 'London' };
console.log(user[field]);
console.log(user['home town']);
console.log(user.field);`,
          output: ['36', 'London', 'undefined'],
          caption: '`user.field` looks for a property literally called "field".',
        },
      ],
    },
    {
      heading: 'Looking through an object',
      body: [
        '`Object.keys(obj)` gives an array of the property names, `Object.values(obj)` the values, and `Object.entries(obj)` an array of `[name, value]` pairs. Once you have an array, all the array methods work, and `for...of` can loop over the entries.',
      ],
      examples: [
        {
          id: 'entries',
          lang: 'js',
          code: `const stock = { apples: 3, pears: 0, plums: 5 };
console.log(Object.keys(stock));
console.log(Object.values(stock));
for (const [fruit, count] of Object.entries(stock)) {
  console.log(fruit + ': ' + count);
}`,
          output: ["[ 'apples', 'pears', 'plums' ]", '[ 3, 0, 5 ]', 'apples: 3', 'pears: 0', 'plums: 5'],
        },
      ],
    },
    {
      heading: 'Nested data and optional chaining',
      body: [
        'Objects can hold objects and arrays. Reading through a missing level, like `user.address.city` when `address` is undefined, throws a TypeError. Write `?.` to stop and give `undefined` instead.',
      ],
      examples: [
        {
          id: 'optional',
          lang: 'js',
          code: `const user = { name: 'Ada', address: { city: 'London' } };
console.log(user.address.city);
console.log(user.contact?.email);
console.log(user.contact?.email ?? 'no email');`,
          output: ['London', 'undefined', 'no email'],
        },
        {
          id: 'missing-level',
          lang: 'js',
          code: `const user = { name: 'Ada' };
console.log(user.address.city);`,
          runtimeError: 'TypeError',
          caption: '`user.address` is undefined, and you cannot read `city` from undefined.',
        },
      ],
    },
    {
      heading: 'Copies, references and JSON',
      body: [
        'Like arrays, objects are references. `const b = a` gives two names for one object. Copy the top level with spread, `{ ...a }`. The copy is shallow: nested objects are still shared.',
        '`JSON.stringify` turns a value into text, and `JSON.parse` turns that text back into a value. It is how data is sent and stored.',
      ],
      examples: [
        {
          id: 'copy',
          lang: 'js',
          code: `const a = { n: 1, tags: ['x'] };
const same = a;
const copy = { ...a, n: 2 };
same.n = 9;
console.log(a.n, copy.n);
copy.tags.push('y');
console.log(a.tags);`,
          output: ['9 2', "[ 'x', 'y' ]"],
          caption: 'The copy has its own `n`, but still shares the `tags` array.',
        },
        {
          id: 'json',
          lang: 'js',
          code: `const text = JSON.stringify({ id: 7, ok: true });
console.log(text);
console.log(JSON.parse(text).id);`,
          output: ['{"id":7,"ok":true}', '7'],
        },
      ],
    },
  ],
  recap: [
    'An object stores values under names. Read with `obj.name` or `obj["name"]`, and assign to change or add.',
    'Use brackets when the name is in a variable. `{ name }` is shorthand for `{ name: name }`.',
    '`Object.keys`, `Object.values` and `Object.entries` turn an object into arrays you can loop over.',
    '`?.` reads through a possibly missing level and gives undefined instead of an error.',
    'Spread copies the top level only. `JSON.stringify` and `JSON.parse` convert to and from text.',
  ],
  checks: [
    mcq('js-objects.c1', 'js-objects', 'What does this print?', ['3', 'undefined', 'key', 'NaN'], 0,
      'The brackets contain the variable `key`, which holds "score", so `obj[key]` reads `obj.score`. Writing `obj.key` would look for a property called key.',
      js(`const key = 'score';\nconst obj = { score: 3 };\nconsole.log(obj[key]);`), OUT),
    mcq('js-objects.c2', 'js-objects', 'What does this print?', ['1 1', '2 2', '1 2', '2 1'], 1,
      '`b` is not a copy, it is a second name for the same object, so changing `b.n` also changes `a.n`.',
      js(`const a = { n: 1 };\nconst b = a;\nb.n = 2;\nconsole.log(a.n, b.n);`), OUT),
    short('js-objects.c3', 'js-objects', 'Type exactly what this prints.', ['none'],
      '`config.theme` is undefined, so `?.` stops there and the `??` supplies the fallback "none".',
      js(`const config = {};\nconsole.log(config.theme?.color ?? 'none');`), OUT),
  ],
  exercises: ['ex-js-objects-describe', 'ex-js-objects-priciest'],
};

export const JS_MAPS_SETS: Lesson = {
  id: 'js-maps-sets',
  title: 'Maps and Sets',
  summary: 'Count, look up and de-duplicate with Map and Set, and know when a plain object or array is enough.',
  minutes: 12,
  objectives: [
    'Store and look up values with a Map',
    'Remove duplicates and test membership with a Set',
    'Count things with a Map',
    'Choose between an object, a Map, an array and a Set',
  ],
  sections: [
    {
      heading: 'Map: keys of any kind',
      body: [
        'A **Map** stores key and value pairs, like an object, but the keys can be any value and it remembers insertion order. Use `set(key, value)`, `get(key)`, `has(key)` and `delete(key)`, and read how many pairs there are from `size`. Getting a missing key gives `undefined`.',
      ],
      examples: [
        {
          id: 'map',
          lang: 'js',
          code: `const ages = new Map();
ages.set('Ada', 36);
ages.set('Grace', 45);
console.log(ages.get('Ada'));
console.log(ages.has('Alan'), ages.size);
ages.delete('Ada');
console.log(ages.size);`,
          output: ['36', 'false 2', '1'],
        },
      ],
    },
    {
      heading: 'Counting with a Map',
      body: [
        'The most common job for a Map is counting. For each item, read the current count (or 0 if there is none), add one and store it. A Map can be looped with `for...of`, giving `[key, value]` pairs.',
      ],
      examples: [
        {
          id: 'count',
          lang: 'js',
          code: `const counts = new Map();
for (const word of ['a', 'b', 'a', 'c', 'a']) {
  counts.set(word, (counts.get(word) ?? 0) + 1);
}
console.log(counts.get('a'));
for (const [word, n] of counts) {
  console.log(word, n);
}`,
          output: ['3', 'a 3', 'b 1', 'c 1'],
        },
      ],
    },
    {
      heading: 'Set: each value once',
      body: [
        'A **Set** holds values with no duplicates. `add(value)` ignores a value that is already there, `has(value)` checks quickly, and `size` counts them. Passing an array to `new Set(...)` and spreading it back gives the array without duplicates.',
      ],
      examples: [
        {
          id: 'set',
          lang: 'js',
          code: `const seen = new Set([3, 1, 3, 2, 1]);
console.log(seen.size);
console.log(seen.has(2));
console.log([...seen]);
seen.add(3);
console.log(seen.size);`,
          output: ['3', 'true', '[ 3, 1, 2 ]', '3'],
        },
      ],
    },
    {
      heading: 'Which one to use',
      body: [
        'Use an **array** for an ordered list. Use a **Set** when you only care whether something is in the collection. Use a plain **object** for a record with known names, like a user. Use a **Map** when keys come from data, you will add and remove often, or the keys are not strings.',
        'One more reason to prefer a Map for lookups: an object has built-in properties, so a key like `"constructor"` can behave surprisingly.',
      ],
      examples: [
        {
          id: 'object-trap',
          lang: 'js',
          code: `const counts = {};
console.log(typeof counts['constructor']);
console.log(new Map().get('constructor'));`,
          output: ['function', 'undefined'],
          caption: 'The object already has a `constructor` it inherited. The Map starts empty.',
        },
      ],
    },
  ],
  recap: [
    'A Map pairs any key with a value: `set`, `get`, `has`, `delete`, `size`.',
    'Count with `map.set(key, (map.get(key) ?? 0) + 1)`.',
    'A Set keeps each value once. `[...new Set(array)]` removes duplicates.',
    'Array for an ordered list, Set for membership, object for a record, Map for lookups by data.',
  ],
  checks: [
    mcq('js-maps-sets.c1', 'js-maps-sets', 'What does this print?', ['4', '3', '2', '1'], 2,
      'A Set keeps each value once, so the duplicates collapse to the two values 1 and 2.',
      js(`console.log(new Set([1, 2, 2, 1]).size);`), OUT),
    short('js-maps-sets.c2', 'js-maps-sets', 'Type exactly what this prints.', ['undefined'],
      'Getting a key that was never set from a Map gives undefined.',
      js(`const m = new Map([['a', 1]]);\nconsole.log(m.get('b'));`), OUT),
    mcq('js-maps-sets.c3', 'js-maps-sets', 'You need to know quickly whether a username is already taken. Which is the best fit?', ['An array', 'A Set', 'A string', 'A function'], 1,
      'A Set answers "is this value in here?" directly with `has`, and never stores a duplicate.'),
  ],
  exercises: ['ex-js-maps-sets-unique', 'ex-js-maps-sets-common'],
};
