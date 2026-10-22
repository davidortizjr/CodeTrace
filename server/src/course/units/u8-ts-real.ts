import type { Unit } from '../types.js';
import { U8_BONUS, U8_EXAM } from './u8-exam.js';
import { mcq, OUT, short, ts } from './quiz-helpers.js';

export const TS_REAL: Unit = {
  id: 'ts-real',
  track: 'ts',
  title: 'TypeScript in real projects',
  blurb: 'Configuration, safe handling of nulls, errors and async data, and typing a whole module.',
  lessons: [
    {
      id: 'ts-tsconfig',
      title: 'The compiler and tsconfig.json',
      summary: 'What tsc does, the options that matter, and the strict checks that catch real bugs.',
      minutes: 13,
      objectives: [
        'Explain what the TypeScript compiler does with a project',
        'Read the main options in a tsconfig.json',
        'Name what noImplicitAny and strictNullChecks catch',
        'Treat an array lookup as possibly undefined',
      ],
      sections: [
        {
          heading: 'What tsc does',
          body: [
            'The TypeScript compiler is called `tsc`. It does two jobs: it **checks** your types, and it **emits** plain JavaScript with the types removed. Those jobs are separate. Many teams let another tool build the JavaScript and use `tsc` only as a checker.',
            'Run `tsc --noEmit` to check without writing any files. It prints every type error and exits with a failure code, which is what a build pipeline looks for.',
          ],
          examples: [
            {
              id: 'tsc-commands',
              lang: 'bash',
              file: 'terminal',
              code: `npx tsc --noEmit
npx tsc
npx tsc --noEmit --watch`,
              caption: 'Check only, check and write JavaScript, and keep checking while you edit.',
            },
          ],
        },
        {
          heading: 'Reading tsconfig.json',
          body: [
            'A `tsconfig.json` in the project folder tells `tsc` how to behave, so you never repeat flags. `target` is the JavaScript version to emit. `module` and `moduleResolution` say how imports are written and found. `outDir` is where the JavaScript goes, and `include` lists the folders to compile.',
            'The most important option is `strict`. It switches on a whole family of checks at once, and new projects should start with it on.',
          ],
          examples: [
            {
              id: 'tsconfig-file',
              lang: 'json',
              file: 'tsconfig.json',
              code: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"]
}`,
            },
          ],
        },
        {
          heading: 'Two strict checks that earn their keep',
          body: [
            '`noImplicitAny` refuses to guess `any` for a parameter that has no type. Without it, an untyped parameter quietly turns checking off for everything it touches.',
            '`strictNullChecks` stops `null` and `undefined` from hiding inside every type. A value that may be missing gets a type like `string | undefined`, and you must deal with that before using it. This catches the most common crash in JavaScript.',
          ],
          examples: [
            {
              id: 'implicit-any',
              lang: 'ts',
              code: `function double(n) {
  return n * 2;
}
console.log(double(4));`,
              output: ['8'],
              errors: [{ code: 7006, line: 1 }],
              caption: 'The compiler asks for a type on n. Add `: number` and the error is gone.',
            },
            {
              id: 'possibly-undefined',
              lang: 'ts',
              code: `const names = ['ada', 'grace'];
const found = names.find((name) => name.startsWith('z'));
console.log(found.toUpperCase());`,
              runtimeError: "TypeError: Cannot read properties of undefined (reading 'toUpperCase')",
              errors: [{ code: 18048, line: 3 }],
              caption: 'find returns string | undefined. The compiler spotted the crash before it ran.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'Turning strict off to make errors disappear does not remove the bugs. It only hides them until a user finds them.' }],
        },
        {
          heading: 'Array lookups can be undefined',
          body: [
            'By default TypeScript says `prices[2]` is a `number`, even for a two item array. The option `noUncheckedIndexedAccess` fixes that: every index lookup becomes `number | undefined`. It is not part of `strict`, so you switch it on yourself.',
            'You can get the same safety without the flag by writing the honest type yourself. Annotate the lookup as `T | undefined`, then give the missing case a default with `??`.',
          ],
          examples: [
            {
              id: 'index-undefined',
              lang: 'ts',
              code: `const prices = [10, 20];
const third: number | undefined = prices[2];
console.log(third ?? 'no price');
console.log(prices[0] ?? 'no price');`,
              output: ['no price', '10'],
            },
          ],
        },
      ],
      recap: [
        '`tsc` checks types and emits JavaScript. `tsc --noEmit` only checks.',
        '`tsconfig.json` holds options such as `target`, `module`, `moduleResolution`, `outDir` and `include`.',
        '`strict` turns on a group of checks, including `noImplicitAny` and `strictNullChecks`.',
        '`strictNullChecks` makes a maybe-missing value `T | undefined` that you must handle.',
        '`noUncheckedIndexedAccess` makes array and index lookups possibly undefined.',
      ],
      checks: [
        mcq('ts-tsconfig.c1', 'ts-tsconfig', 'Which line reports an error under `strict`?', ['Line 1', 'Line 2', 'Line 3', 'Line 4'], 1,
          '`text` may be undefined, so calling `toUpperCase` on it is an error on line 2. The call on line 4 is fine.',
          ts(`function shout(text: string | undefined): string {\n  return text.toUpperCase();\n}\nconsole.log(shout('hi'));`), { kind: 'ts-error', line: 2, code: 18048 }),
        short('ts-tsconfig.c2', 'ts-tsconfig', 'Which compiler flag checks the types without writing any JavaScript files? Type the flag.', ['--noEmit', 'noEmit'],
          '`--noEmit` runs the whole check and skips the output, which is why it is used in checks and pipelines.'),
        mcq('ts-tsconfig.c3', 'ts-tsconfig', 'What does this print?', ['undefined', '3', 'none', 'It throws an error'], 2,
          'There is no item at index 5, so the lookup is undefined and `??` supplies "none".',
          ts(`const sizes = [1, 2, 3];\nconsole.log(sizes[5] ?? 'none');`), OUT),
      ],
      exercises: ['ex-ts-tsconfig-run'],
    },
    {
      id: 'ts-null-errors',
      title: 'Handling null and errors',
      summary: 'Deal with missing values, unknown errors in catch blocks, and results that carry failure in the type.',
      minutes: 15,
      objectives: [
        'Use ?. and ?? to handle null and undefined',
        'Treat a caught error as unknown and narrow it',
        'Write a custom error class',
        'Model success and failure with a Result union and check it exhaustively',
      ],
      sections: [
        {
          heading: 'Missing values with ?. and ??',
          body: [
            'When a value may be `null` or `undefined`, the type says so, and TypeScript refuses to let you use it as if it were there. Optional chaining `?.` stops and gives `undefined` instead of crashing. Nullish coalescing `??` supplies a default only for `null` and `undefined`.',
            'Together they are the everyday way to handle "might be missing", and the compiler checks you did.',
          ],
          examples: [
            {
              id: 'optional-chain',
              lang: 'ts',
              code: `type Profile = { name: string; city: string | null };

function cityOf(profile: Profile): string {
  return profile.city?.toUpperCase() ?? 'unknown';
}

console.log(cityOf({ name: 'Ada', city: 'london' }));
console.log(cityOf({ name: 'Bo', city: null }));`,
              output: ['LONDON', 'unknown'],
            },
          ],
        },
        {
          heading: 'Errors are unknown',
          body: [
            'In JavaScript you can `throw` anything: an `Error`, a string, a number. So in a `catch` block the value is typed `unknown`, and you must check it before use. The usual check is `instanceof Error`.',
          ],
          examples: [
            {
              id: 'catch-unknown',
              lang: 'ts',
              code: `function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

try {
  throw new Error('boom');
} catch (e) {
  console.log(messageOf(e));
}

try {
  throw 'plain text';
} catch (e) {
  console.log(messageOf(e));
  console.log(e.message);
}`,
              output: ['boom', 'plain text', 'undefined'],
              errors: [{ code: 18046, line: 15 }],
              caption: 'Line 15 reads e.message without checking. The compiler flags it, and at runtime a string has no message.',
            },
          ],
          notes: [{ kind: 'watch-out', text: 'Do not write `catch (e: any)` to silence this. Narrow the error instead, so a thrown string cannot crash your handler.' }],
        },
        {
          heading: 'Custom error classes',
          body: [
            'Extend `Error` to make errors that carry extra facts, such as which field was wrong. Because the class is a real value, `instanceof` can tell your error apart from any other, and TypeScript then knows its extra fields.',
          ],
          examples: [
            {
              id: 'custom-error',
              lang: 'ts',
              code: `class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function requireName(name: string): string {
  if (name === '') {
    throw new ValidationError('name', 'name is required');
  }
  return name;
}

try {
  requireName('');
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(e.name, e.field, e.message);
  }
}`,
              output: ['ValidationError name name is required'],
            },
          ],
        },
        {
          heading: 'Result types and exhaustive checks',
          body: [
            'Throwing hides failure from the type. A **Result** puts it in the type instead: a union where `ok: true` carries a `value` and `ok: false` carries an `error`. After you check `ok`, TypeScript knows which fields exist, and callers cannot forget the failure case.',
            'For a union of fixed names, a `switch` can be made **exhaustive**: in the default branch assign the value to `never`. If someone adds a new case later and forgets to handle it, that line becomes a compile error.',
          ],
          examples: [
            {
              id: 'result-exhaustive',
              lang: 'ts',
              code: `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: 'cannot divide by zero' };
  return { ok: true, value: a / b };
}

function show(result: Result<number, string>): string {
  if (result.ok) return 'result ' + result.value;
  return 'failed: ' + result.error;
}

type Status = 'idle' | 'loading' | 'done';

function label(status: Status): string {
  switch (status) {
    case 'idle':
      return 'Waiting';
    case 'loading':
      return 'Working';
    case 'done':
      return 'Finished';
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
}

console.log(show(divide(6, 3)), '|', show(divide(1, 0)));
console.log(label('loading'));`,
              output: ['result 2 | failed: cannot divide by zero', 'Working'],
            },
          ],
        },
      ],
      recap: [
        '`?.` gives undefined instead of crashing, and `??` replaces only null and undefined.',
        'A caught error is `unknown`. Check `e instanceof Error` before using `e.message`.',
        'Extend `Error` for custom errors, and set `name` and any extra fields in the constructor.',
        'A Result union (`ok: true` with `value`, `ok: false` with `error`) puts failure in the type.',
        'Assign to `never` in a switch default so a missing case becomes a compile error.',
      ],
      checks: [
        mcq('ts-null-errors.c1', 'ts-null-errors', 'What does this print?', ['42', 'unknown problem', 'undefined', 'It does not compile'], 1,
          'The thrown value is a number, not an `Error`, so the `instanceof` check fails and the fallback text is returned.',
          ts(`function messageOf(e: unknown): string {\n  return e instanceof Error ? e.message : 'unknown problem';\n}\ntry {\n  throw 42;\n} catch (e) {\n  console.log(messageOf(e));\n}`), OUT),
        short('ts-null-errors.c2', 'ts-null-errors', 'Type what this prints.', ['-1'],
          '`city` is null, so `city?.length` is undefined, and `??` replaces it with -1.',
          ts(`const city: string | null = null;\nconsole.log(city?.length ?? -1);`), OUT),
        mcq('ts-null-errors.c3', 'ts-null-errors', 'Which line reports a type error?', ['Line 1', 'Line 2', 'Line 4', 'There is no error'], 2,
          'In the else side of the ternary the result is the failure shape, which has no `value`. The error is on line 4.',
          ts(`type Result = { ok: true; value: number } | { ok: false; error: string };\nfunction show(r: Result): string {\n  return r.ok\n    ? String(r.value)\n    : String(r.value);\n}`), { kind: 'ts-error', line: 5, code: 2339 }),
      ],
      exercises: ['ex-ts-null-errors-run', 'ex-ts-null-errors-types'],
    },
    {
      id: 'ts-async-data',
      title: 'Async code and outside data',
      summary: 'Type promises and async functions, and check data from outside instead of trusting it.',
      minutes: 14,
      objectives: [
        'Write the return type of an async function as Promise<T>',
        'Use Promise.all and keep each result typed',
        'Treat outside data as unknown and check it with a guard',
        'Use Awaited<T> to get the type inside a promise',
      ],
      sections: [
        {
          heading: 'Promise<T> and async functions',
          body: [
            'A `Promise<number>` is a value that will become a number later. An `async` function always returns a promise, so you write the type of what it resolves to inside `Promise<...>`, even though the body returns a plain value. Inside another async function, `await` takes the number back out.',
          ],
          examples: [
            {
              id: 'promise-basics',
              lang: 'ts',
              code: `async function loadPrice(item: string): Promise<number> {
  return item.length * 10;
}

async function main(): Promise<void> {
  const price = await loadPrice('tea');
  console.log(price);
}

main();`,
              output: ['30'],
            },
          ],
        },
        {
          heading: 'Promise.all and Awaited',
          body: [
            '`Promise.all` takes several promises and gives one promise of all the results. When you pass an array written in place, TypeScript keeps one type per position, so you get a tuple, not a mixed array.',
            '`Awaited<T>` takes a promise type and gives the type it resolves to. Combine it with `ReturnType` to name what an async function produces without writing it twice.',
          ],
          examples: [
            {
              id: 'promise-all',
              lang: 'ts',
              code: `const getName = async (): Promise<string> => 'Ada';
const getCount = async (): Promise<number> => 3;

async function loadPair() {
  const [name, count] = await Promise.all([getName(), getCount()]);
  return { name, count };
}

type Pair = Awaited<ReturnType<typeof loadPair>>;

async function main() {
  const pair: Pair = await loadPair();
  console.log(pair.name.toUpperCase(), pair.count * 2);
}

main();`,
              output: ['ADA 6'],
              caption: 'name is a string and count is a number, so both methods are checked.',
            },
          ],
        },
        {
          heading: 'Outside data is unknown',
          body: [
            'Anything that comes from outside your program, such as a network response or `JSON.parse`, could be any shape at all. Type it as `unknown`, then prove its shape with a **guard** function that checks each field. Only after the guard says yes does TypeScript treat it as your type.',
            'Writing `data as User` would skip the proof. It tells the compiler to believe you, and a wrong shape will crash somewhere far from the cause.',
          ],
          examples: [
            {
              id: 'guard',
              lang: 'ts',
              code: `type User = { name: string; age: number };

function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof data.name === 'string' &&
    'age' in data &&
    typeof data.age === 'number'
  );
}

const good: unknown = JSON.parse('{"name":"Ada","age":36}');
const bad: unknown = JSON.parse('{"name":"Ada"}');

console.log(isUser(good), isUser(bad));
if (isUser(good)) {
  console.log(good.age + 1);
}`,
              output: ['true false', '37'],
            },
          ],
          notes: [{ kind: 'watch-out', text: 'A guard is only as good as its checks. If it forgets a field, the compiler will still trust it.' }],
        },
        {
          heading: 'A fetch helper without fetch',
          body: [
            'A function that loads data should not reach out to the network by itself. Pass the loader in as a parameter. In production you give it a real fetch, in a test or in this course you give it a fake that returns fixed data. The helper stays the same: get `unknown`, check it, return a real type or throw.',
          ],
          examples: [
            {
              id: 'fetch-helper',
              lang: 'ts',
              code: `type User = { name: string; age: number };
type Fetcher = (url: string) => Promise<unknown>;

function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof data.name === 'string' &&
    'age' in data &&
    typeof data.age === 'number'
  );
}

async function fetchUser(get: Fetcher, id: number): Promise<User> {
  const data = await get('/users/' + id);
  if (!isUser(data)) {
    throw new Error('Bad user data for id ' + id);
  }
  return data;
}

const fakeGet: Fetcher = async (url) =>
  url.endsWith('/1') ? { name: 'Ada', age: 36 } : { name: 'Grace' };

async function main() {
  const user = await fetchUser(fakeGet, 1);
  console.log(user.name);
  try {
    await fetchUser(fakeGet, 2);
  } catch (e) {
    if (e instanceof Error) console.log(e.message);
  }
}

main();`,
              output: ['Ada', 'Bad user data for id 2'],
            },
          ],
        },
      ],
      recap: [
        'An async function returns `Promise<T>`, where T is what the body returns.',
        '`await` unwraps a promise, and `Promise.all` of an array literal gives a tuple of results.',
        '`Awaited<T>` is the type a promise resolves to, often used as `Awaited<ReturnType<typeof fn>>`.',
        'Outside data is `unknown` until a hand-written guard checks every field.',
        'Prefer a guard to `as`, and pass the loader in as a parameter so it is easy to fake.',
      ],
      checks: [
        mcq('ts-async-data.c1', 'ts-async-data', 'What does this print?', ['number false', 'object true', 'number true', 'object false'], 1,
          'An async function always returns a Promise, which is an object. So `result` is not the number 8.',
          ts(`async function double(n: number): Promise<number> {\n  return n * 2;\n}\nconst result = double(4);\nconsole.log(typeof result, result instanceof Promise);`), OUT),
        short('ts-async-data.c2', 'ts-async-data', 'Type what this prints.', ['ababab'],
          '`Promise.all` gives `[3, "ab"]` in order, so `label.repeat(id)` is "ab" repeated three times.',
          ts(`async function main() {\n  const [id, label] = await Promise.all([Promise.resolve(3), Promise.resolve('ab')]);\n  console.log(label.repeat(id));\n}\nmain();`), OUT),
        mcq('ts-async-data.c3', 'ts-async-data', 'Which line reports a type error?', ['Line 1', 'There is no error, JSON.parse returns any', 'Line 2'], 2,
          '`data` is declared `unknown`, so reading `data.n` is rejected until the shape has been checked.',
          ts(`const data: unknown = JSON.parse('{"n": 1}');\nconsole.log(data.n);`), { kind: 'ts-error', line: 2, code: 18046 }),
      ],
      exercises: ['ex-ts-async-data-run', 'ex-ts-async-data-types'],
    },
    {
      id: 'ts-modules',
      title: 'Modules and declaration files',
      summary: 'Share types between files, describe code that has no types, and type a small module in one place.',
      minutes: 13,
      objectives: [
        'Use import type and export type for types only',
        'Explain what .d.ts files and @types packages are for',
        'Know when declare module and declare global are needed',
        'Type a small module-like object and an event emitter',
      ],
      sections: [
        {
          heading: 'import type and export type',
          body: [
            'A type has no runtime existence, so a file that only needs a type can import it with `import type`. The whole line is erased from the JavaScript. `export type` does the same on the sending side. This keeps the output clean and avoids loading a file just for its types.',
          ],
          examples: [
            {
              id: 'import-type',
              lang: 'ts',
              run: false,
              file: 'user.ts',
              code: `export type User = { id: number; name: string };

export function makeUser(id: number, name: string): User {
  return { id, name };
}`,
            },
            {
              id: 'import-type-use',
              lang: 'ts',
              run: false,
              file: 'app.ts',
              code: `import type { User } from './user';
import { makeUser } from './user';

const ada: User = makeUser(1, 'Ada');`,
              caption: 'The first import disappears when compiled. The second stays because makeUser is real code.',
            },
          ],
        },
        {
          heading: 'Declaration files and @types',
          body: [
            'A `.d.ts` file holds only types, no code. It describes the shape of JavaScript that exists elsewhere. Some packages ship their own. For popular libraries written in plain JavaScript, the community publishes types as `@types/*` packages, which you install as development dependencies and TypeScript finds automatically.',
          ],
          examples: [
            {
              id: 'types-install',
              lang: 'bash',
              file: 'terminal',
              code: `npm install express
npm install --save-dev @types/express`,
            },
          ],
        },
        {
          heading: 'declare module and declare global',
          body: [
            'If a package has no types at all, an ambient declaration in a `.d.ts` file tells TypeScript what it exports. `declare module "name"` describes a module. `declare global` adds to something that already exists everywhere, such as a variable your page defines. Both only describe, they never create anything at runtime.',
          ],
          examples: [
            {
              id: 'declare-module',
              lang: 'ts',
              run: false,
              file: 'types/legacy-lib.d.ts',
              code: `declare module 'legacy-lib' {
  export function parseScore(text: string): number;
}

declare global {
  const APP_VERSION: string;
}

export {};`,
            },
          ],
          notes: [{ kind: 'watch-out', text: 'A declaration is a promise. If the real library behaves differently from what you declared, the compiler cannot tell.' }],
        },
        {
          heading: 'A typed module in one file',
          body: [
            'A module is just a place that keeps some state private and shows a few typed functions. A function that returns an object of methods works as a small module, and `ReturnType` gives its type a name. The compiler then checks every call to it.',
          ],
          examples: [
            {
              id: 'todo-store',
              lang: 'ts',
              code: `type Todo = { id: number; title: string; done: boolean };

function createTodoStore() {
  const todos: Todo[] = [];
  return {
    add(title: string): Todo {
      const todo: Todo = { id: todos.length + 1, title, done: false };
      todos.push(todo);
      return todo;
    },
    complete(id: number): boolean {
      const todo = todos.find((item) => item.id === id);
      if (todo === undefined) return false;
      todo.done = true;
      return true;
    },
    titles(): string[] {
      return todos.filter((todo) => !todo.done).map((todo) => todo.title);
    },
  };
}

type TodoStore = ReturnType<typeof createTodoStore>;

const store: TodoStore = createTodoStore();
store.add('write tests');
store.add('ship it');
console.log(store.complete(1));
console.log(store.complete('2'));
console.log(store.titles());`,
              output: ['true', 'false', "[ 'ship it' ]"],
              errors: [{ code: 2345, line: 29 }],
              caption: 'Line 29 passes a string where an id number is expected. It is caught before it can do harm.',
            },
          ],
        },
        {
          heading: 'A typed event emitter',
          body: [
            'A map from event names to payload types makes an emitter safe. The method takes a name `K` that is one of the keys, and the payload type is looked up as `Events[K]`. A wrong name or a wrong payload is then a type error.',
          ],
          examples: [
            {
              id: 'emitter',
              lang: 'ts',
              code: `type Events = { login: { user: string }; score: number };

type Emitter<E> = {
  on<K extends keyof E>(name: K, handler: (payload: E[K]) => void): void;
  emit<K extends keyof E>(name: K, payload: E[K]): void;
};

function createEmitter<E>(): Emitter<E> {
  const handlers: { [K in keyof E]?: ((payload: E[K]) => void)[] } = {};
  return {
    on(name, handler) {
      const list = handlers[name] ?? [];
      list.push(handler);
      handlers[name] = list;
    },
    emit(name, payload) {
      for (const handler of handlers[name] ?? []) {
        handler(payload);
      }
    },
  };
}

const bus = createEmitter<Events>();
bus.on('login', (payload) => console.log('hello', payload.user));
bus.on('score', (payload) => console.log('score', payload + 1));
bus.emit('login', { user: 'ada' });
bus.emit('score', 9);`,
              output: ['hello ada', 'score 10'],
            },
          ],
        },
      ],
      recap: [
        '`import type` and `export type` are erased, so they never load a file at runtime.',
        'A `.d.ts` file describes JavaScript with types only. `@types/*` packages supply them for plain JS libraries.',
        '`declare module` describes an untyped package, and `declare global` adds to a global that exists already.',
        'A function that returns an object of methods is a small typed module, and `ReturnType` names its type.',
        'A map of event name to payload type, used as `E[K]`, keeps an emitter consistent.',
      ],
      checks: [
        mcq('ts-modules.c1', 'ts-modules', 'Which import is always removed from the compiled JavaScript?',
          ["import { User } from './user';", "import * as user from './user';", "import './user';", "import type { User } from './user';"], 3,
          '`import type` can only bring in types, so the compiler always erases the whole line.'),
        short('ts-modules.c2', 'ts-modules', 'What is the package scope on npm that holds type declarations for plain JavaScript libraries? Type it with the @.', ['@types', '@types/*'],
          'Packages such as `@types/node` and `@types/express` are the community-written declarations that TypeScript picks up automatically.'),
        mcq('ts-modules.c3', 'ts-modules', 'Which line reports a type error?', ['Line 1', 'Line 2', 'Line 3', 'There is no error'], 2,
          '`Events["save"]` is `{ id: number }`, which has no `name`, so reading it on line 3 is an error.',
          ts(`type Events = { save: { id: number } };\ntype Handler<K extends keyof Events> = (payload: Events[K]) => void;\nconst onSave: Handler<'save'> = (payload) => console.log(payload.name);`), { kind: 'ts-error', line: 3, code: 2339 }),
      ],
      exercises: ['ex-ts-modules-types'],
    },
  ],
  exam: U8_EXAM,
  bonus: U8_BONUS,
};
