import type { Lesson } from '../types.js';
import { js, mcq, OUT, short } from './quiz-helpers.js';

export const JS_MODULES: Lesson = {
  id: 'js-modules',
  title: 'Modules',
  summary: 'Split code into files, share only what is needed, and read import and export statements.',
  minutes: 12,
  objectives: [
    'Explain why code is split into modules',
    'Read named and default exports and the matching imports',
    'Tell ES modules and CommonJS apart',
    'Group code behind a small public surface',
  ],
  sections: [
    {
      heading: 'One file, one job',
      body: [
        'A **module** is a file with its own scope. Names in it are private unless the file **exports** them, and other files **import** what they need. This keeps big programs readable and stops two files from clashing over a name.',
        'The imports and exports in this lesson cannot run in the practice window, because it runs a single file. They are marked as examples to read.',
      ],
      examples: [
        {
          id: 'named',
          lang: 'js',
          run: false,
          file: 'math.js',
          code: `export function add(a, b) {
  return a + b;
}
export const PI = 3.14159;`,
        },
        {
          id: 'named-import',
          lang: 'js',
          run: false,
          file: 'app.js',
          code: `import { add, PI } from './math.js';
console.log(add(2, 3), PI);`,
          caption: 'Names in braces must match the exported names.',
        },
      ],
    },
    {
      heading: 'Default exports and renaming',
      body: [
        'A file can have one **default export**. It is imported without braces, and the importer picks the name. Named imports can be renamed with `as`, and `import * as math` collects every export into one object.',
      ],
      examples: [
        {
          id: 'default',
          lang: 'js',
          run: false,
          code: `// greet.js
export default function greet(name) {
  return 'Hi ' + name;
}

// app.js
import greet from './greet.js';
import * as math from './math.js';
import { add as plus } from './math.js';
console.log(greet('Ada'), math.PI, plus(1, 2));`,
        },
      ],
      notes: [{ kind: 'tip', text: 'Many teams avoid default exports, because the importer can give the same thing different names in different files.' }],
    },
    {
      heading: 'ES modules and CommonJS',
      body: [
        'The `import` and `export` syntax is **ES modules**, the standard. Older Node code uses **CommonJS**: `const x = require("./x")` and `module.exports = ...`. New projects use ES modules, but you will meet both. In a browser, load a module with `<script type="module">`.',
        '`import()` written like a function loads a module later, when the code reaches it, and gives back a promise.',
      ],
      examples: [
        {
          id: 'commonjs',
          lang: 'js',
          run: false,
          code: `// CommonJS
const { add } = require('./math');
module.exports = { total: add(1, 2) };

// ES modules, loaded later
const math = await import('./math.js');`,
        },
      ],
    },
    {
      heading: 'A small public surface',
      body: [
        'The idea behind modules works inside one file too. Keep helpers private and expose a small object with the useful operations. This is the **module pattern**: a function builds the private state and returns only the functions that others may call.',
      ],
      examples: [
        {
          id: 'namespace',
          lang: 'js',
          code: `const counter = (() => {
  let count = 0;
  return {
    increment() {
      count += 1;
    },
    value() {
      return count;
    },
  };
})();
counter.increment();
counter.increment();
console.log(counter.value());
console.log(counter.count);`,
          output: ['2', 'undefined'],
          caption: '`count` is private. Only `increment` and `value` can touch it.',
        },
      ],
    },
  ],
  recap: [
    'A module is a file with its own scope. Only what it exports can be imported.',
    'Named exports are imported in braces with the same names. A default export has no braces.',
    '`import * as x` gathers all exports. `as` renames an import.',
    'ES modules use import and export. CommonJS uses require and module.exports.',
    'Hide state in a function and return a small object: the module pattern.',
  ],
  checks: [
    mcq('js-modules.c1', 'js-modules', 'Which import matches `export function add() {}`?', ["import add from './math.js'", "import { add } from './math.js'", "import add() from './math.js'", "require { add } from './math.js'"], 1,
      'A named export is imported with braces, using the same name. Without braces you would be asking for the default export.'),
    mcq('js-modules.c2', 'js-modules', 'What does this print?', ['0', '1', 'undefined', 'Error'], 2,
      '`count` lives inside the function and is not part of the returned object, so `box.count` does not exist.',
      js(`const box = (() => {\n  let count = 1;\n  return { get: () => count };\n})();\nconsole.log(box.count);`), OUT),
    mcq('js-modules.c3', 'js-modules', 'Which of these is CommonJS?', ["const fs = require('fs')", "import fs from 'fs'", "export default fs", "import('fs')"], 0,
      '`require` and `module.exports` are CommonJS. `import` and `export` are ES modules.'),
  ],
  exercises: ['ex-js-modules-stats'],
};

export const JS_ASYNC: Lesson = {
  id: 'js-async',
  title: 'Asynchronous code',
  summary: 'Run code later with timers and promises, and write it in order with async and await.',
  minutes: 18,
  objectives: [
    'Predict the order of synchronous code, timers and promise callbacks',
    'Create and chain promises',
    'Run promises together with Promise.all',
    'Write async functions with await and handle errors with try and catch',
  ],
  sections: [
    {
      heading: 'Code that waits',
      body: [
        'Some work takes time: a timer, a network request, reading a file. JavaScript does not stand still while it waits. It sets up a **callback** to run later and carries on with the next line. `setTimeout(fn, ms)` is the simplest example.',
        'All the plain lines run first, in order. Callbacks run afterwards, when the current code has finished, even if the delay is 0.',
      ],
      examples: [
        {
          id: 'timeout',
          lang: 'js',
          code: `console.log('start');
setTimeout(() => console.log('timer'), 0);
console.log('end');`,
          output: ['start', 'end', 'timer'],
          caption: 'The timer callback waits until all the plain code is done.',
        },
      ],
    },
    {
      heading: 'Promises',
      body: [
        'A **promise** is a value that is not ready yet. It ends up **fulfilled** with a result or **rejected** with an error. `.then(fn)` runs when it is fulfilled, `.catch(fn)` when it is rejected, and `.finally(fn)` either way. Each of them returns a new promise, so they can be chained.',
        'Promise callbacks run before timer callbacks, once the plain code has finished.',
      ],
      examples: [
        {
          id: 'then',
          lang: 'js',
          code: `const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
wait(10, 4)
  .then((n) => n * 2)
  .then((n) => console.log('result', n))
  .finally(() => console.log('done'));
console.log('waiting');`,
          output: ['waiting', 'result 8', 'done'],
        },
        {
          id: 'order',
          lang: 'js',
          code: `setTimeout(() => console.log('timer'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('plain');`,
          output: ['plain', 'promise', 'timer'],
          caption: 'Plain code, then promise callbacks, then timers.',
        },
      ],
    },
    {
      heading: 'async and await',
      body: [
        'An `async` function always returns a promise. Inside it, `await` pauses that function until a promise settles and gives you the result, so asynchronous code can read from top to bottom. A rejected promise becomes an exception, which `try` and `catch` handle.',
      ],
      examples: [
        {
          id: 'await',
          lang: 'js',
          code: `const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
async function main() {
  const a = await wait(10, 'one');
  const b = await wait(10, 'two');
  console.log(a, b);
}
main();
console.log('started');`,
          output: ['started', 'one two'],
        },
        {
          id: 'try-await',
          lang: 'js',
          code: `const fail = () => Promise.reject(new Error('no network'));
async function load() {
  try {
    await fail();
    console.log('loaded');
  } catch (error) {
    console.log('caught', error.message);
  }
}
load();`,
          output: ['caught no network'],
        },
      ],
    },
    {
      heading: 'Running promises together',
      body: [
        'Two `await`s in a row run one after the other. If the jobs do not depend on each other, start them all and wait for them together with `Promise.all(array)`, which gives an array of results in the same order. It rejects as soon as one fails. `Promise.allSettled` waits for all and reports each outcome, and `Promise.race` takes the first to finish.',
      ],
      examples: [
        {
          id: 'all',
          lang: 'js',
          code: `const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
async function main() {
  const results = await Promise.all([wait(30, 'slow'), wait(10, 'fast')]);
  console.log(results);
  const first = await Promise.race([wait(30, 'slow'), wait(10, 'fast')]);
  console.log(first);
  const all = await Promise.allSettled([wait(5, 'ok'), Promise.reject(new Error('bad'))]);
  console.log(all.map((r) => r.status));
}
main();`,
          output: ["[ 'slow', 'fast' ]", 'fast', "[ 'fulfilled', 'rejected' ]"],
          caption: '`Promise.all` keeps the order of the input, not the order of finishing.',
        },
      ],
    },
  ],
  recap: [
    'Callbacks run after the plain code has finished. Promise callbacks run before timers.',
    'A promise is fulfilled with a value or rejected with an error: then, catch, finally.',
    '`async` functions return a promise. `await` pauses until a promise settles.',
    'Use try and catch around await to handle a rejection.',
    '`Promise.all` runs jobs together and keeps their order. `allSettled` reports every outcome. `race` takes the first.',
  ],
  checks: [
    mcq('js-async.c1', 'js-async', 'What does this print?', ['a b c', 'a c b', 'b a c', 'c b a'], 1,
      'The plain lines run first, `a` then `c`, and the timer callback `b` runs afterwards even with a delay of 0.',
      js(`console.log('a');\nsetTimeout(() => console.log('b'), 0);\nconsole.log('c');`), OUT),
    short('js-async.c2', 'js-async', 'Type the three lines this prints, separated by spaces.', ['sync promise timer'],
      'Plain code first, then the promise callback, then the timer.',
      js(`setTimeout(() => console.log('timer'), 0);\nPromise.resolve().then(() => console.log('promise'));\nconsole.log('sync');`), OUT),
    mcq('js-async.c3', 'js-async', 'What does an async function return?', ['Its return value, directly', 'A promise', 'undefined', 'A callback'], 1,
      'Whatever an async function returns is wrapped in a promise, so callers use then or await to get the value.'),
  ],
  exercises: ['ex-js-async-load', 'ex-js-async-safe'],
};
