import type { QuizItem } from '../types.js';
import { js, mcq, OUT, short } from './quiz-helpers.js';

const U = 'js-modern';

export const U4_EXAM: QuizItem[] = [
  mcq(`${U}.e1`, 'js-destructuring', 'What does this print?', ['1 2', '1 1', '2 2', '2 1'], 3,
    'The array destructuring on the left takes `b` and `a` from the right-hand array `[a, b]`, which swaps their values.',
    js(`let a = 1;\nlet b = 2;\n[a, b] = [b, a];\nconsole.log(a, b);`), OUT),
  short(`${U}.e2`, 'js-destructuring', 'Type what this prints.', ['Ada 36 none'],
    'The names are taken from the object, `age` comes from the object too, and `role` is missing so its default "none" is used.',
    js(`const { name, age, role = 'none' } = { name: 'Ada', age: 36 };\nconsole.log(name, age, role);`), OUT),
  mcq(`${U}.e3`, 'js-destructuring', 'What does this print?', ['[ 1, 2 ] [ 3 ]', '1 [ 2, 3 ]', '[ 1 ] [ 2, 3 ]', '1 2'], 1,
    'The rest element `...rest` collects everything that is left after the first item into a new array.',
    js(`const [first, ...rest] = [1, 2, 3];\nconsole.log(first, rest);`), OUT),
  mcq(`${U}.e4`, 'js-classes', 'What does this print?', ['0', 'undefined', '2', '1'], 2,
    'Each `increment` call adds one to this object\'s `count` field, starting from 0, so two calls make 2.',
    js(`class Counter {\n  count = 0;\n  increment() {\n    this.count += 1;\n  }\n}\nconst c = new Counter();\nc.increment();\nc.increment();\nconsole.log(c.count);`), OUT),
  short(`${U}.e5`, 'js-classes', 'Type the two values this prints, separated by a space.', ['Rex true'],
    '`Dog` inherits `name` through `super(name)`, and an instance of a subclass is also an instance of its parent class.',
    js(`class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n}\nclass Dog extends Animal {}\nconst d = new Dog('Rex');\nconsole.log(d.name, d instanceof Animal);`), OUT),
  mcq(`${U}.e6`, 'js-modules', 'Which import matches `export default function greet() {}`?', ["import greet from './greet.js'", "import { greet } from './greet.js'", "import * greet from './greet.js'", "import default greet from './greet.js'"], 0,
    'A default export is imported without braces, and the importing file chooses the name.'),
  mcq(`${U}.e7`, 'js-async', 'What does this print?', ['one two three', 'one three two', 'two one three', 'three two one'], 1,
    '`one` and `three` are plain lines. The timer callback, `two`, runs after the current code is finished.',
    js(`console.log('one');\nsetTimeout(() => console.log('two'), 0);\nconsole.log('three');`), OUT),
  short(`${U}.e8`, 'js-async', 'Type what this prints.', ['caught boom'],
    'Awaiting a rejected promise throws its error inside the async function, so the catch block runs.',
    js(`async function run() {\n  try {\n    await Promise.reject(new Error('boom'));\n  } catch (e) {\n    console.log('caught', e.message);\n  }\n}\nrun();`), OUT),
];

export const U4_BONUS: QuizItem[] = [
  mcq(`${U}.b1`, 'js-destructuring', 'What does this print?', ['1 3', '1 2', '2 3', '3 1'], 0,
    'The spread copies the properties of `a` into `b` and then adds `y: 3`. `a` itself is not changed, so `a.x` is 1 and `b.y` is 3.',
    js(`const a = { x: 1 };\nconst b = { ...a, y: 3 };\nconsole.log(a.x, b.y);`), OUT),
  mcq(`${U}.b2`, 'js-classes', 'What does this print?', ['undefined', 'Ada', 'TypeError', 'Error'], 2,
    'A method copied into a variable loses its object, so `this` is undefined inside it, and reading `name` from undefined throws a TypeError.',
    js(`class User {\n  constructor() {\n    this.name = 'Ada';\n  }\n  show() {\n    return this.name;\n  }\n}\nconst show = new User().show;\ntry {\n  console.log(show());\n} catch (e) {\n  console.log(e.name);\n}`), OUT),
  short(`${U}.b3`, 'js-async', 'Type the two lines this prints, separated by a space.', ['promise timer'],
    'Promise callbacks run before timer callbacks, whatever order they were created in.',
    js(`setTimeout(() => console.log('timer'), 0);\nPromise.resolve().then(() => console.log('promise'));`), OUT),
  mcq(`${U}.b4`, 'js-async', 'What does this print?', ['[ 1, 2 ]', '[ 2, 1 ]', '1', 'undefined'], 0,
    '`Promise.all` returns the results in the order of the input array, not in the order they finish, even though 2 finishes first.',
    js(`const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nPromise.all([wait(20, 1), wait(5, 2)]).then((r) => console.log(r));`), OUT),
];
