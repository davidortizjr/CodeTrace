import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

export const U8_EXERCISES: Problem[] = [
  {
    id: 'ex-ts-tsconfig-run',
    topic: 'ts-real',
    lang: 'ts',
    lesson: 'ts-tsconfig',
    title: 'Safe lookup',
    difficulty: 1,
    prompt:
      'Write `itemAt(items, index, fallback)` that returns `items[index]`, or `fallback` when there is no item at that index. `itemAt(["a", "b"], 1, "none")` is `"b"` and `itemAt(["a", "b"], 5, "none")` is `"none"`. A negative index has no item either, and an empty string that really is in the array must be returned as it is.',
    concept: 'An array lookup can be undefined, so handle the missing case with `??` instead of trusting the index.',
    fn: 'itemAt',
    starter: `function itemAt(items: string[], index: number, fallback: string): string {
  // return the item at index, or the fallback when there is none
}
`,
    reference: `function itemAt(items: string[], index: number, fallback: string): string {
  const item: string | undefined = items[index];
  return item ?? fallback;
}`,
    tests: [
      { args: [['a', 'b', 'c'], 1, 'none'], cat: 'basic' },
      { args: [['a', 'b', 'c'], 0, 'none'], cat: 'basic' },
      { args: [['a', 'b'], 5, 'none'], cat: 'edge' },
      { args: [['a', 'b', 'c'], -1, 'none'], cat: 'edge' },
      { args: [['', 'x'], 0, 'none'], cat: 'edge' },
      { args: [[], 0, 'empty'], cat: 'edge' },
      { args: [['a', 'b', 'c'], 3, 'none'], cat: 'edge' },
    ],
    traceArgs: [['a', 'b', 'c'], 1, 'none'],
    track: [],
    variants: [
      v(
        'falsy-fallback',
        'coercion',
        'Uses || so an empty string is replaced',
        'The operator || replaces every falsy value, and "" is falsy, so a real empty string in the array is swapped for the fallback.',
        'Use the operator that only replaces null and undefined.',
        ['What does `"" || "none"` give?', 'Which operator only reacts to a missing value?'],
        `function itemAt(items: string[], index: number, fallback: string): string {
  return items[index] || fallback;
}`,
      ),
      v(
        'upper-bound-only',
        'boundary',
        'Only checks the index against the length',
        'A negative index passes the length check, but items[-1] does not exist, so undefined is returned instead of the fallback.',
        'A valid index is also at least 0.',
        ['What is `items[-1]` for an array?', 'Which indexes count as having an item?'],
        `function itemAt(items: string[], index: number, fallback: string): string {
  if (index < items.length) {
    return items[index];
  }
  return fallback;
}`,
      ),
      v(
        'uses-at',
        'edge-case',
        'Uses at(), which counts negative indexes from the end',
        'items.at(-1) is the last item, not a missing one, so a negative index returns an item instead of the fallback.',
        'Plain bracket access treats -1 as a missing key.',
        ['What does `["a", "b"].at(-1)` give?'],
        `function itemAt(items: string[], index: number, fallback: string): string {
  return items.at(index) ?? fallback;
}`,
      ),
      v(
        'returns-undefined',
        'ts-null',
        'Returns the lookup without handling undefined',
        'The lookup is typed string | undefined here, so it cannot be returned as a string, and a missing item gives undefined at runtime.',
        'Handle the missing case before returning.',
        ['What type does `items.at(index)` have?', 'What should be returned when it is undefined?'],
        `function itemAt(items: string[], index: number, fallback: string): string {
  return items.at(-1 - items.length) as string;
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-null-errors-run',
    topic: 'ts-real',
    lang: 'ts',
    lesson: 'ts-null-errors',
    title: 'Parse an age',
    difficulty: 1,
    prompt:
      'Write `parseAge(text)` that returns a result object instead of throwing. For a good age return `{ ok: true, value: 42 }`. Otherwise return `{ ok: false, error }` where `error` is `"empty"` for blank text, `"not a number"` for text that is not entirely a number (such as `"12abc"`), and `"out of range"` for a number below 0 or above 150. Give the function a discriminated union return type.',
    concept: 'A Result-style discriminated union makes failure part of the type, so callers must handle it.',
    fn: 'parseAge',
    starter: `type AgeResult = unknown; // describe the success and the failure shape

function parseAge(text: string): AgeResult {
  // return { ok: true, value } or { ok: false, error }
}
`,
    reference: `type AgeResult = { ok: true; value: number } | { ok: false; error: string };

function parseAge(text: string): AgeResult {
  if (text.trim() === '') {
    return { ok: false, error: 'empty' };
  }
  const age = Number(text);
  if (Number.isNaN(age)) {
    return { ok: false, error: 'not a number' };
  }
  if (age < 0 || age > 150) {
    return { ok: false, error: 'out of range' };
  }
  return { ok: true, value: age };
}`,
    tests: [
      { args: ['42'], cat: 'basic' },
      { args: [' 7 '], cat: 'basic' },
      { args: [''], cat: 'edge' },
      { args: ['   '], cat: 'edge' },
      { args: ['abc'], cat: 'basic' },
      { args: ['12abc'], cat: 'edge' },
      { args: ['-3'], cat: 'edge' },
      { args: ['151'], cat: 'edge' },
      { args: ['150'], cat: 'edge' },
    ],
    traceArgs: ['42'],
    track: [],
    variants: [
      v(
        'blank-is-zero',
        'edge-case',
        'Blank text becomes the age 0',
        'Number("") is 0, so without an explicit check blank text counts as a valid age of 0.',
        'Check for blank text before converting.',
        ['What does `Number("")` give?', 'Where should the blank check go?'],
        `type AgeResult = { ok: true; value: number } | { ok: false; error: string };

function parseAge(text: string): AgeResult {
  const age = Number(text);
  if (Number.isNaN(age)) {
    return { ok: false, error: 'not a number' };
  }
  if (age < 0 || age > 150) {
    return { ok: false, error: 'out of range' };
  }
  return { ok: true, value: age };
}`,
      ),
      v(
        'parse-int',
        'coercion',
        'Uses parseInt, which accepts "12abc"',
        'parseInt reads the digits at the start and ignores the rest, so "12abc" becomes 12 instead of an error.',
        'Use a conversion that rejects text with extra characters.',
        ['What does `parseInt("12abc")` give?', 'Which conversion gives NaN for "12abc"?'],
        `type AgeResult = { ok: true; value: number } | { ok: false; error: string };

function parseAge(text: string): AgeResult {
  if (text.trim() === '') {
    return { ok: false, error: 'empty' };
  }
  const age = parseInt(text, 10);
  if (Number.isNaN(age)) {
    return { ok: false, error: 'not a number' };
  }
  if (age < 0 || age > 150) {
    return { ok: false, error: 'out of range' };
  }
  return { ok: true, value: age };
}`,
      ),
      v(
        'no-upper-limit',
        'boundary',
        'Only rejects negative ages',
        'The upper limit is missing, so 151 and every larger number are accepted.',
        'The range has two ends.',
        ['Which value should be the largest accepted age?'],
        `type AgeResult = { ok: true; value: number } | { ok: false; error: string };

function parseAge(text: string): AgeResult {
  if (text.trim() === '') {
    return { ok: false, error: 'empty' };
  }
  const age = Number(text);
  if (Number.isNaN(age)) {
    return { ok: false, error: 'not a number' };
  }
  if (age < 0) {
    return { ok: false, error: 'out of range' };
  }
  return { ok: true, value: age };
}`,
      ),
      v(
        'forgot-error',
        'ts-missing-prop',
        'A failure has no error message',
        'The failure object is missing the error property, so it does not match the union and the caller cannot tell what went wrong.',
        'Every failure needs an error string.',
        ['Which property does `{ ok: false }` lack?'],
        `type AgeResult = { ok: true; value: number } | { ok: false; error: string };

function parseAge(text: string): AgeResult {
  if (text.trim() === '') {
    return { ok: false };
  }
  const age = Number(text);
  if (Number.isNaN(age)) {
    return { ok: false, error: 'not a number' };
  }
  if (age < 0 || age > 150) {
    return { ok: false, error: 'out of range' };
  }
  return { ok: true, value: age };
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-null-errors-types',
    topic: 'ts-real',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-null-errors',
    title: 'Define Result',
    difficulty: 2,
    prompt:
      'Replace `unknown` with a generic discriminated union `Result<T, E>`: a success has `ok: true` and a `value` of type `T`, a failure has `ok: false` and an `error` of type `E`. After that `unwrapOr` compiles, mixed-up objects are rejected, and the error type can be anything. Do not use `any`.',
    concept: 'A tag property plus one shape per case lets the compiler narrow `ok` to the right fields.',
    fn: 'unwrapOr',
    starter: `type Result<T, E> = unknown; // success and failure shapes go here

function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
`,
    reference: `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}`,
    typeChecks: [
      { label: 'A success and a failure are valid values', code: `const good: Result<number, string> = { ok: true, value: 1 };\nconst bad: Result<number, string> = { ok: false, error: 'x' };\nconst n: number = unwrapOr(good, 0) + unwrapOr(bad, 0);\nvoid n;`, cat: 'basic' },
      { label: 'A success cannot carry an error', code: `// @ts-expect-error\nconst r: Result<number, string> = { ok: true, error: 'x' };\nvoid r;`, cat: 'basic' },
      { label: 'A failure cannot carry a value', code: `// @ts-expect-error\nconst r: Result<number, string> = { ok: false, value: 1 };\nvoid r;`, cat: 'basic' },
      { label: 'The error type E is used', code: `const r: Result<string, number> = { ok: false, error: 404 };\n// @ts-expect-error\nconst s: Result<string, number> = { ok: false, error: 'text' };\nvoid r;\nvoid s;`, cat: 'edge' },
      { label: 'The fallback must match the value type', code: `const r: Result<number, string> = { ok: true, value: 1 };\n// @ts-expect-error\nunwrapOr(r, 'zero');`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'optional-fields',
        'ts-narrowing',
        'One object type with optional fields',
        'With optional value and error, checking ok does not narrow anything, so result.value may be undefined and mixed objects are accepted.',
        'Give each outcome its own shape and join them with |.',
        ['What does `ok` tell the compiler when the shape is a single object type?', 'How many shapes should the type have?'],
        `type Result<T, E> = { ok: boolean; value?: T; error?: E };

function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}`,
      ),
      v(
        'error-is-string',
        'ts-too-loose',
        'The error type ignores E',
        'The failure shape fixes the error to string, so a Result with a number error is rejected and the E parameter does nothing.',
        'Use E for the type of the error property.',
        ['Which property should use the type parameter E?'],
        `type Result<T, E> = { ok: true; value: T } | { ok: false; error: string };

function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Uses any for the fields',
        'With any as the field types, nothing is checked, so a wrong fallback and a wrong error type are no longer rejected.',
        'Use T and E in the shapes.',
        ['Which types should the value and error have?'],
        `type Result<T, E> = { ok: true; value: any } | { ok: false; error: any };

function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}`,
      ),
      v(
        'no-tag',
        'ts-missing-prop',
        'The shapes have no ok tag',
        'Without an ok property in each shape, `result.ok` does not exist on the union and the compiler cannot tell the cases apart.',
        'Each shape needs the same tag property with a different literal value.',
        ['What property does `unwrapOr` read first?'],
        `type Result<T, E> = { value: T } | { error: E };

function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-async-data-run',
    topic: 'ts-real',
    lang: 'ts',
    lesson: 'ts-async-data',
    title: 'Check outside data',
    difficulty: 1,
    prompt:
      'Write `isUser(data)` that takes a value of type `unknown` and returns `true` only for an object with a string `name` and a number `age`, otherwise `false`. It must never throw: `null`, strings, arrays and numbers are simply `false`. Do not use `as` or `any`.',
    concept: 'Data from outside is `unknown` until a hand-written guard proves its shape.',
    fn: 'isUser',
    starter: `function isUser(data: unknown): boolean {
  // true only for an object with a string name and a number age
}
`,
    reference: `function isUser(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  return 'name' in data && typeof data.name === 'string' && 'age' in data && typeof data.age === 'number';
}`,
    tests: [
      { args: [{ name: 'Ada', age: 36 }], cat: 'basic' },
      { args: [{ name: 'Ada' }], cat: 'basic' },
      { args: [{ name: 'Ada', age: '36' }], cat: 'edge' },
      { args: [{ name: 1, age: 36 }], cat: 'edge' },
      { args: [null], cat: 'edge' },
      { args: ['Ada'], cat: 'edge' },
      { args: [[]], cat: 'edge' },
      { args: [{ name: 'Linus', age: 0, admin: true }], cat: 'edge' },
    ],
    traceArgs: [{ name: 'Ada', age: 36 }],
    track: [],
    variants: [
      v(
        'null-crash',
        'ts-null',
        'Does not rule out null',
        'typeof null is "object", so null gets past the first check, and then reading or probing it fails, both for the compiler and at runtime.',
        'Check for null explicitly after the typeof check.',
        ['What does `typeof null` give?', 'What happens when you use `in` on null?'],
        `function isUser(data: unknown): boolean {
  if (typeof data !== 'object') {
    return false;
  }
  return 'name' in data && typeof data.name === 'string' && 'age' in data && typeof data.age === 'number';
}`,
      ),
      v(
        'skips-age-type',
        'logic',
        'Only checks that age exists',
        'An age of "36" is present, so it passes, but the guard promised a number.',
        'Check the type of age, not just whether the key is there.',
        ['What does typeof say for the string "36"?'],
        `function isUser(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  return 'name' in data && typeof data.name === 'string' && 'age' in data;
}`,
      ),
      v(
        'skips-age',
        'logic',
        'Never looks at age',
        'An object with only a name is accepted because the age is not checked at all.',
        'Check both fields.',
        ['Which field is missing from the check?'],
        `function isUser(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  return 'name' in data && typeof data.name === 'string';
}`,
      ),
      v(
        'cast-instead',
        'ts-narrowing',
        'Casts with as instead of checking',
        'The cast tells the compiler to trust the shape, so a missing property is read as undefined, and null crashes when it is read.',
        'Narrow unknown with typeof and in instead of casting.',
        ['What does `as` prove about the data at runtime?'],
        `function isUser(data: unknown): boolean {
  const user = data as { name: string; age: number };
  return typeof user.name === 'string' && typeof user.age === 'number';
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-async-data-types',
    topic: 'ts-real',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-async-data',
    title: 'Type an async pair',
    difficulty: 2,
    prompt:
      'The function `loadPair` waits for two async getters and returns their results together, but nothing is typed. Give the parameters function types and the return type `Promise<[string, number]>` so that the name comes first and the count second, and mismatched getters are rejected. Do not use `any`.',
    concept: 'An async function returns a Promise, and `Promise.all` keeps each position typed as a tuple.',
    fn: 'loadPair',
    starter: `async function loadPair(getName, getCount) {
  const [name, count] = await Promise.all([getName(), getCount()]);
  return [name, count];
}
`,
    reference: `async function loadPair(
  getName: () => Promise<string>,
  getCount: () => Promise<number>,
): Promise<[string, number]> {
  const [name, count] = await Promise.all([getName(), getCount()]);
  return [name, count];
}`,
    typeChecks: [
      { label: 'The result is a Promise of a string and number tuple', code: `const p: Promise<[string, number]> = loadPair(async () => 'Ada', async () => 3);\nvoid p;`, cat: 'basic' },
      { label: 'The order is name then count', code: `// @ts-expect-error\nconst p: Promise<[number, string]> = loadPair(async () => 'Ada', async () => 3);\nvoid p;`, cat: 'basic' },
      { label: 'A getter returning the wrong type is rejected', code: `// @ts-expect-error\nloadPair(async () => 1, async () => 3);`, cat: 'basic' },
      { label: 'Swapped getters are rejected', code: `// @ts-expect-error\nloadPair(async () => 3, async () => 'Ada');`, cat: 'edge' },
      { label: 'The result is not a plain array', code: `async function use(): Promise<void> {\n  const [name, count] = await loadPair(async () => 'Ada', async () => 3);\n  const upper: string = name.toUpperCase();\n  const double: number = count * 2;\n  void upper;\n  void double;\n}\nvoid use;`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'array-result',
        'ts-too-loose',
        'Returns an array of a union instead of a tuple',
        'Promise<(string | number)[]> forgets which position is which, so the tuple checks fail and name.toUpperCase is no longer safe.',
        'Use a tuple type with one type per position.',
        ['What does the first item of `(string | number)[]` have as a type?'],
        `async function loadPair(
  getName: () => Promise<string>,
  getCount: () => Promise<number>,
): Promise<(string | number)[]> {
  const [name, count] = await Promise.all([getName(), getCount()]);
  return [name, count];
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Uses any for the getters',
        'With any getters, a getter that returns the wrong type is accepted, so nothing is rejected.',
        'Give each getter a function type returning a Promise.',
        ['What should `getName` return?', 'What should `getCount` return?'],
        `async function loadPair(
  getName: () => Promise<any>,
  getCount: () => Promise<any>,
): Promise<[string, number]> {
  const [name, count] = await Promise.all([getName(), getCount()]);
  return [name, count];
}`,
      ),
      v(
        'unannotated-params',
        'ts-implicit-any',
        'Only the return type is written',
        'The parameters have no types, so strict mode reports implicit any on them and getters of any type are accepted.',
        'Annotate getName and getCount as well.',
        ['Which parts of the function are still untyped?'],
        `async function loadPair(getName, getCount): Promise<[string, number]> {
  const [name, count] = await Promise.all([getName(), getCount()]);
  return [name, count];
}`,
      ),
      v(
        'swapped-types',
        'ts-mismatch',
        'The tuple order is the wrong way round',
        'The getters are typed correctly but the return says number first, so returning name first does not match.',
        'The first item returned is the name.',
        ['Which value does the function put first in the array?'],
        `async function loadPair(
  getName: () => Promise<string>,
  getCount: () => Promise<number>,
): Promise<[number, string]> {
  const [name, count] = await Promise.all([getName(), getCount()]);
  return [name, count];
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-modules-types',
    topic: 'ts-real',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-modules',
    title: 'Typed emitter',
    difficulty: 2,
    prompt:
      'Make `createEmitter<Events>()` type safe. `Events` maps an event name to its payload type, so with `{ login: { user: string }; score: number }` the call `emit("score", 5)` is fine, while `emit("score", "five")` and `emit("logout", 1)` are errors, and the handler given to `on("login", ...)` receives `{ user: string }`. Give `Emitter` generic `on` and `emit` methods. Do not use `any`.',
    concept: 'A type that maps names to payloads lets one small module keep every event and handler consistent.',
    fn: 'createEmitter',
    starter: `type Emitter<Events> = {
  on(name: string, handler: (payload: unknown) => void): void;
  emit(name: string, payload: unknown): void;
};

function createEmitter<Events>(): Emitter<Events> {
  const handlers: { [K in keyof Events]?: ((payload: Events[K]) => void)[] } = {};
  return {
    on(name, handler) {
      // store the handler under its event name
    },
    emit(name, payload) {
      // call every handler stored for that event
    },
  };
}
`,
    reference: `type Emitter<Events> = {
  on<K extends keyof Events>(name: K, handler: (payload: Events[K]) => void): void;
  emit<K extends keyof Events>(name: K, payload: Events[K]): void;
};

function createEmitter<Events>(): Emitter<Events> {
  const handlers: { [K in keyof Events]?: ((payload: Events[K]) => void)[] } = {};
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
}`,
    typeChecks: [
      { label: 'Valid events and handlers are accepted', code: `type Ev = { login: { user: string }; score: number };\nconst bus = createEmitter<Ev>();\nbus.on('login', (p) => console.log(p.user.toUpperCase()));\nbus.on('score', (p) => console.log(p + 1));\nbus.emit('login', { user: 'ada' });\nbus.emit('score', 5);`, cat: 'basic' },
      { label: 'A wrong payload is rejected', code: `type Ev = { login: { user: string }; score: number };\nconst bus = createEmitter<Ev>();\n// @ts-expect-error\nbus.emit('score', 'five');`, cat: 'basic' },
      { label: 'An unknown event name is rejected', code: `type Ev = { login: { user: string }; score: number };\nconst bus = createEmitter<Ev>();\n// @ts-expect-error\nbus.emit('logout', 1);`, cat: 'basic' },
      { label: 'The handler receives the right payload type', code: `type Ev = { login: { user: string }; score: number };\nconst bus = createEmitter<Ev>();\n// @ts-expect-error\nbus.on('score', (p: string) => console.log(p));`, cat: 'edge' },
      { label: 'Each event takes only its own payload', code: `type Ev = { login: { user: string }; score: number };\nconst bus = createEmitter<Ev>();\n// @ts-expect-error\nbus.emit('score', { user: 'ada' });`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'string-names',
        'ts-too-loose',
        'Event names are plain strings',
        'With name: string and payload: unknown, any name and any payload are accepted, and the handler gets unknown.',
        'Use a type parameter K that extends keyof Events and look the payload up with Events[K].',
        ['How can the payload type depend on the event name?'],
        `type Emitter<Events> = {
  on(name: string, handler: (payload: unknown) => void): void;
  emit(name: string, payload: unknown): void;
};

function createEmitter<Events>(): Emitter<Events> {
  const handlers: Record<string, ((payload: unknown) => void)[]> = {};
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
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Payloads are any',
        'With any payloads the compiler accepts every payload, including the wrong ones.',
        'Look the payload type up from the Events type instead.',
        ['What type should the payload of "score" be?'],
        `type Emitter<Events> = {
  on<K extends keyof Events>(name: K, handler: (payload: any) => void): void;
  emit<K extends keyof Events>(name: K, payload: any): void;
};

function createEmitter<Events>(): Emitter<Events> {
  const handlers: { [K in keyof Events]?: ((payload: Events[K]) => void)[] } = {};
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
}`,
      ),
      v(
        'payload-union',
        'ts-too-loose',
        'emit accepts any payload from any event',
        'The payload is typed as the union of all payloads, so a login payload is accepted for the score event.',
        'Look up the payload with the same name type: Events[K].',
        ['Which event does the payload type belong to?'],
        `type Emitter<Events> = {
  on<K extends keyof Events>(name: K, handler: (payload: Events[K]) => void): void;
  emit<K extends keyof Events>(name: K, payload: Events[keyof Events]): void;
};

function createEmitter<Events>(): Emitter<Events> {
  const handlers: { [K in keyof Events]?: ((payload: Events[K]) => void)[] } = {};
  return {
    on(name, handler) {
      const list = handlers[name] ?? [];
      list.push(handler);
      handlers[name] = list;
    },
    emit(name, payload) {
      for (const handler of handlers[name] ?? []) {
        handler(payload as Events[typeof name]);
      }
    },
  };
}`,
      ),
      v(
        'handler-untyped',
        'ts-mismatch',
        'The handler payload is not tied to the event',
        'Only emit is generic. The handler still receives unknown, so a handler written for a string payload is accepted for a number event.',
        'Make on generic in the same way as emit.',
        ['Which method still uses `unknown` for the payload?'],
        `type Emitter<Events> = {
  on(name: keyof Events, handler: (payload: never) => void): void;
  emit<K extends keyof Events>(name: K, payload: Events[K]): void;
};

function createEmitter<Events>(): Emitter<Events> {
  const handlers: { [K in keyof Events]?: ((payload: Events[K]) => void)[] } = {};
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
}`,
      ),
    ],
  },
];
