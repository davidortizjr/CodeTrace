import type { Lesson } from '../types.js';
import { mcq, OUT, short, ts } from './quiz-helpers.js';

export const TS_GENERIC_TYPES: Lesson = {
  id: 'ts-generic-types',
  title: 'Generic types and constraints',
  summary: 'Make interfaces and classes that work for any type, and limit what a type parameter may be.',
  minutes: 14,
  objectives: [
    'Write a generic interface, type alias and class',
    'Limit a type parameter with extends',
    'Use keyof to accept only real property names',
    'Give a type parameter a default',
  ],
  sections: [
    {
      heading: 'Generic interfaces and aliases',
      body: [
        'A type can take type parameters just like a function takes values. `interface Box<T> { value: T }` describes a box of anything, and you choose when you use it: `Box<string>` or `Box<number>`. The same works for `type` aliases.',
      ],
      examples: [
        {
          id: 'box',
          lang: 'ts',
          code: `interface Box<T> {
  value: T;
}
const a: Box<string> = { value: 'tea' };
const b: Box<number> = { value: 'nine' };
console.log(a.value.length);`,
          output: ['3'],
          errors: [{ code: 2322, line: 5 }],
          caption: 'Line 5 puts a string in a `Box<number>`.',
        },
      ],
    },
    {
      heading: 'Generic classes',
      body: [
        'A class can be generic too. The type parameter is fixed when you create the object, and every method sees it. A stack of numbers will not accept a string.',
      ],
      examples: [
        {
          id: 'stack',
          lang: 'ts',
          code: `class Stack<T> {
  private items: T[] = [];
  push(item: T): void {
    this.items.push(item);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
}
const s = new Stack<number>();
s.push(1);
s.push(2);
console.log(s.pop());`,
          output: ['2'],
        },
      ],
    },
    {
      heading: 'Constraints with extends',
      body: [
        'Sometimes a generic function needs the value to have something. Write `T extends { length: number }` to say "any type, as long as it has a length". Inside, you can use `.length`, and callers passing something without one get an error.',
      ],
      examples: [
        {
          id: 'constraint',
          lang: 'ts',
          code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
console.log(longest('cat', 'horse'));
console.log(longest([1, 2, 3], [4]));
console.log(longest(10, 20));`,
          output: ['horse', '[ 1, 2, 3 ]', '20'],
          errors: [{ code: 2345, line: 6 }],
          caption: 'A number has no `length`, so line 6 is rejected. In JavaScript it would quietly return 20, comparing two undefined lengths.',
        },
      ],
    },
    {
      heading: 'keyof and defaults',
      body: [
        '`keyof T` is the union of the property names of `T`. A parameter `K extends keyof T` accepts only real keys, and `T[K]` is the type of that property, so the result is exactly typed. A type parameter can also have a default, `T = string`, used when none is given.',
      ],
      examples: [
        {
          id: 'getprop',
          lang: 'ts',
          code: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const book = { title: 'Dune', pages: 412 };
console.log(getProp(book, 'pages') + 1);
console.log(getProp(book, 'author'));`,
          output: ['413', 'undefined'],
          errors: [{ code: 2345, line: 6 }],
        },
        {
          id: 'default',
          lang: 'ts',
          code: `interface Result<T = string> {
  data: T;
}
const text: Result = { data: 'ok' };
const count: Result<number> = { data: 3 };
console.log(text.data, count.data);`,
          output: ['ok 3'],
        },
      ],
    },
  ],
  recap: [
    'Types take type parameters: `Box<T>`. You choose the type where you use it.',
    'A generic class fixes `T` when you create the object, and all methods share it.',
    '`T extends Something` limits what callers may pass and lets you use that something.',
    '`K extends keyof T` accepts only real property names, and `T[K]` is the matching type.',
    'A default, `T = string`, is used when no type argument is given.',
  ],
  checks: [
    mcq('ts-generic-types.c1', 'ts-generic-types', 'Which line is the type error?', ['Line 2', 'Line 3', 'Line 4', 'There is no error'], 2,
      '`Stack<number>` only accepts numbers. Line 4 pushes a string.',
      ts(`class Stack<T> {\n  items: T[] = [];\n}\nconst s = new Stack<number>();\ns.items.push('a');`),
      { kind: 'ts-error', line: 5, code: 2345 }),
    mcq('ts-generic-types.c2', 'ts-generic-types', 'What does `T extends { length: number }` mean?', ['T must be a number', 'T can be any type that has a numeric length property', 'T is an array of numbers', 'T is always a string'], 1,
      'A constraint limits the type parameter to types that have at least that shape, such as strings and arrays.'),
    short('ts-generic-types.c3', 'ts-generic-types', 'Type exactly what this prints.', ['Dune'],
      '`K` is inferred as "title", so `getProp(book, "title")` returns the title.',
      ts(`function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\nconsole.log(getProp({ title: 'Dune' }, 'title'));`), OUT),
  ],
  exercises: ['ex-ts-generic-types-run', 'ex-ts-generic-types-types'],
};

export const TS_MAPPED_CONDITIONAL: Lesson = {
  id: 'ts-mapped-conditional',
  title: 'Mapped and conditional types',
  summary: 'Compute new types from old ones by looping over keys and by choosing with a condition.',
  minutes: 16,
  objectives: [
    'Write a mapped type with [K in keyof T]',
    'Add or remove readonly and optional modifiers',
    'Write a conditional type with extends and infer',
    'Explain how a conditional type spreads over a union',
  ],
  sections: [
    {
      heading: 'Mapped types',
      body: [
        'A mapped type builds a new object type by looping over the keys of another: `{ [K in keyof T]: ... }`. In the body, `K` is the current key and `T[K]` is its type. This is how `Partial` and `Readonly` are written.',
      ],
      examples: [
        {
          id: 'flags',
          lang: 'ts',
          code: `type Flags<T> = { [K in keyof T]: boolean };
interface Settings {
  dark: string;
  compact: number;
}
const f: Flags<Settings> = { dark: true, compact: 1 };
console.log(f.dark);`,
          output: ['true'],
          errors: [{ code: 2322, line: 6 }],
          caption: 'Every property became a boolean, so `compact: 1` is wrong.',
        },
      ],
    },
    {
      heading: 'Modifiers',
      body: [
        'Add `readonly` or `?` in front of the key to add the modifier. Put a minus sign in front, `-readonly` or `-?`, to remove it. That is exactly how `Required<T>` removes the optionals.',
      ],
      examples: [
        {
          id: 'modifiers',
          lang: 'ts',
          code: `type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Complete<T> = { [K in keyof T]-?: T[K] };
interface Frozen {
  readonly id: number;
  note?: string;
}
const m: Mutable<Frozen> = { id: 1 };
m.id = 2;
const c: Complete<Frozen> = { id: 1 };
console.log(m.id);`,
          output: ['2'],
          errors: [{ code: 2741, line: 9 }],
          caption: '`Complete` made `note` required, so line 9 is missing it.',
        },
      ],
    },
    {
      heading: 'Conditional types and infer',
      body: [
        'A conditional type chooses between two types: `T extends U ? X : Y`. Inside the condition you can capture a part of the type with `infer`. `T extends (infer E)[] ? E : never` pulls out the item type of an array type.',
      ],
      examples: [
        {
          id: 'infer',
          lang: 'ts',
          code: `type ElementOf<T> = T extends (infer E)[] ? E : never;
const item: ElementOf<string[]> = 'tea';
const bad: ElementOf<number[]> = 'tea';
console.log(item.length);`,
          output: ['3'],
          errors: [{ code: 2322, line: 3 }],
        },
      ],
    },
    {
      heading: 'Spreading over a union',
      body: [
        'When the checked type is a bare type parameter and you pass a union, the condition runs once for each member and the results are joined. `Wrap<string | number>` is `string[] | number[]`, not `(string | number)[]`.',
      ],
      examples: [
        {
          id: 'distributive',
          lang: 'ts',
          code: `type Wrap<T> = T extends unknown ? T[] : never;
const x: Wrap<string | number> = [1, 2];
const y: Wrap<string | number> = [1, 'a'];
console.log(x.length, y.length);`,
          output: ['2 2'],
          errors: [{ code: 2322, line: 3 }],
        },
      ],
    },
  ],
  recap: [
    '`{ [K in keyof T]: ... }` loops over the keys of T. `T[K]` is the type of each one.',
    '`readonly` and `?` add modifiers, `-readonly` and `-?` remove them.',
    '`T extends U ? X : Y` picks a type, and `infer` captures a piece of the matched type.',
    'A conditional on a bare type parameter runs once per member of a union.',
  ],
  checks: [
    mcq('ts-mapped-conditional.c1', 'ts-mapped-conditional', 'What does `{ [K in keyof T]: boolean }` produce?', ['A boolean', 'The same keys as T, each with the type boolean', 'An array of booleans', 'The keys of T as a union'], 1,
      'A mapped type loops over the keys of T and gives each one the type written after the colon.'),
    mcq('ts-mapped-conditional.c2', 'ts-mapped-conditional', 'Which line is the type error?', ['Line 2', 'Line 3', 'Line 4', 'There is no error'], 1,
      '`IsString<number>` is false, so `b` has the type false, and line 3 assigns true to it.',
      ts(`type IsString<T> = T extends string ? true : false;\nconst a: IsString<string> = true;\nconst b: IsString<number> = true;`),
      { kind: 'ts-error', line: 3, code: 2322 }),
    short('ts-mapped-conditional.c3', 'ts-mapped-conditional', 'Type exactly what this prints.', ['5'],
      '`ElementOf<string[]>` is string, so `item` is a string and "hello".length is 5.',
      ts(`type ElementOf<T> = T extends (infer E)[] ? E : never;\nconst item: ElementOf<string[]> = 'hello';\nconsole.log(item.length);`), OUT),
  ],
  exercises: ['ex-ts-mapped-conditional-run', 'ex-ts-mapped-conditional-types'],
};

export const TS_TYPE_GUARDS: Lesson = {
  id: 'ts-type-guards',
  title: 'Type guards and unknown data',
  summary: 'Teach the compiler what a check proves, and validate data of unknown shape.',
  minutes: 14,
  objectives: [
    'Write a user-defined type guard with a value is T return type',
    'Use a guard with filter to narrow a list',
    'Write an assertion function with asserts',
    'Validate unknown data without a cast',
  ],
  sections: [
    {
      heading: 'A check the compiler understands',
      body: [
        'Narrowing with `typeof` and `instanceof` is built in. For your own checks, write a **type guard**: a function whose return type is `value is T`. When it returns true, the compiler treats the value as `T` in that branch.',
      ],
      examples: [
        {
          id: 'guard',
          lang: 'ts',
          code: `function isString(value: unknown): value is string {
  return typeof value === 'string';
}
const input: unknown = 'hello';
if (isString(input)) {
  console.log(input.toUpperCase());
}
console.log(input.length);`,
          output: ['HELLO', '5'],
          errors: [{ code: 18046, line: 8 }],
          caption: 'Inside the if, `input` is a string. Outside, it is still `unknown`.',
        },
      ],
    },
    {
      heading: 'Guards with filter',
      body: [
        'A guard passed to `filter` narrows the whole array: `items.filter(isNumber)` has the type `number[]`, not `unknown[]`.',
      ],
      examples: [
        {
          id: 'filter',
          lang: 'ts',
          code: `function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
const items: unknown[] = [1, 'a', 2, null];
const nums = items.filter(isNumber);
console.log(nums.reduce((sum, n) => sum + n, 0));`,
          output: ['3'],
        },
      ],
    },
    {
      heading: 'Assertion functions',
      body: [
        'An assertion function throws when the check fails, and returns normally when it passes. Its return type `asserts value is T` tells the compiler that everything after the call can treat the value as `T`.',
      ],
      examples: [
        {
          id: 'asserts',
          lang: 'ts',
          code: `function assertString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new TypeError('not a string');
}
const raw: unknown = 'abc';
assertString(raw);
console.log(raw.length);
try {
  assertString(5);
} catch (error) {
  console.log(error instanceof TypeError);
}`,
          output: ['3', 'true'],
        },
      ],
    },
    {
      heading: 'Validating data you do not control',
      body: [
        'Data from JSON or the network has no known type. Type it `unknown` and check it before use. A guard can be generic: `isArrayOf` takes a guard for the items and checks every one. Writing the check yourself is what a cast like `as string[]` only pretends to do.',
      ],
      examples: [
        {
          id: 'array-of',
          lang: 'ts',
          code: `function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}
const isString = (item: unknown): item is string => typeof item === 'string';
const data: unknown = JSON.parse('["a", "b"]');
console.log(isArrayOf(data, isString) ? data.join('') : 'invalid');
const other: unknown = JSON.parse('[1, 2]');
console.log(isArrayOf(other, isString) ? other.join('') : 'invalid');`,
          output: ['ab', 'invalid'],
        },
      ],
    },
  ],
  recap: [
    'A type guard returns `value is T`. In the true branch the value is a T.',
    'Passing a guard to `filter` narrows the array type.',
    'An assertion function returns `asserts value is T` and throws when the check fails.',
    'Unknown data is typed `unknown` and checked with a guard, not forced with `as`.',
  ],
  checks: [
    mcq('ts-type-guards.c1', 'ts-type-guards', 'What does the return type `value is string` tell the compiler?', ['The function returns the string "value"', 'When it returns true, the value is a string', 'The value is always a string', 'The function throws if it is not a string'], 1,
      'A type predicate links the boolean result to the type of the argument, so a true result narrows the value.'),
    mcq('ts-type-guards.c2', 'ts-type-guards', 'What does this print?', ['3', '2', '1', '0'], 1,
      '`filter(isNumber)` keeps only 5 and 7, so the length is 2.',
      ts(`const isNumber = (v: unknown): v is number => typeof v === 'number';\nconsole.log([5, 'x', 7].filter(isNumber).length);`), OUT),
    short('ts-type-guards.c3', 'ts-type-guards', 'Type exactly what this prints.', ['TypeError'],
      'The guard fails for 5, so the function throws a TypeError, which the catch prints.',
      ts(`function assertString(v: unknown): asserts v is string {\n  if (typeof v !== 'string') throw new TypeError('no');\n}\ntry {\n  assertString(5);\n} catch (e) {\n  console.log((e as Error).name);\n}`), OUT),
  ],
  exercises: ['ex-ts-type-guards-run', 'ex-ts-type-guards-types'],
};
