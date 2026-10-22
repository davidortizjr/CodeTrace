import type { Lesson } from '../types.js';
import { mcq, OUT, short, ts } from './quiz-helpers.js';

export const TS_PRIMITIVES: Lesson = {
  id: 'ts-primitives',
  title: 'Primitive types, unions and literals',
  summary: 'Describe values precisely: basic types, arrays, tuples, literal types, unions and the safe unknown.',
  minutes: 15,
  objectives: [
    'Annotate arrays and tuples',
    'Build a union type and a literal type',
    'Name a type with a type alias',
    'Choose unknown over any and know what never means',
  ],
  sections: [
    {
      heading: 'Arrays and tuples',
      body: [
        'Write an array type as `number[]` (or `Array<number>`). Every item must have that type. A **tuple** is an array of fixed length where each position has its own type: `[string, number]`.',
      ],
      examples: [
        {
          id: 'arrays',
          lang: 'ts',
          code: `const scores: number[] = [90, 85];
scores.push('top');
const entry: [string, number] = ['Ada', 36];
const [who, age] = entry;
console.log(who, age, scores.length);`,
          output: ['Ada 36 3'],
          errors: [{ code: 2345, line: 2 }],
          caption: 'Line 2 pushes a string into a list of numbers.',
        },
      ],
    },
    {
      heading: 'Unions and literal types',
      body: [
        'A **union** `A | B` means "either". A **literal type** is a single exact value, like `"north"`. Together they describe a small set of allowed values, which is usually better than a plain `string` or an `enum`.',
        'A **type alias** gives a type a name: `type Direction = "north" | "south"`.',
      ],
      examples: [
        {
          id: 'literal-union',
          lang: 'ts',
          code: `type Direction = 'north' | 'south' | 'east' | 'west';
function turn(d: Direction): string {
  return 'facing ' + d;
}
console.log(turn('east'));
console.log(turn('up'));`,
          output: ['facing east', 'facing up'],
          errors: [{ code: 2345, line: 6 }],
        },
        {
          id: 'id-union',
          lang: 'ts',
          code: `type Id = string | number;
const a: Id = 'u-1';
const b: Id = 42;
const c: Id = true;
console.log(a, b);`,
          output: ['u-1 42'],
          errors: [{ code: 2322, line: 4 }],
        },
      ],
    },
    {
      heading: 'null and undefined',
      body: [
        'With strict mode on, `null` and `undefined` are their own types. A `string` can never be null. To allow a missing value, say so: `string | null`. This is the single biggest source of bugs that TypeScript removes.',
      ],
      examples: [
        {
          id: 'nullable',
          lang: 'ts',
          code: `let nickname: string = null;
let middle: string | null = null;
middle = 'Q';
console.log(middle);`,
          output: ['Q'],
          errors: [{ code: 2322, line: 1 }],
        },
      ],
    },
    {
      heading: 'any, unknown and never',
      body: [
        '`any` turns the checker off for a value: anything goes, and mistakes appear at runtime. `unknown` also accepts anything, but you must check it before you use it. Prefer `unknown` whenever you do not know the type. `never` is the type of a value that cannot exist, such as the result of a function that always throws.',
        '`as const` on a value makes TypeScript keep the exact literal values and make them read-only.',
      ],
      examples: [
        {
          id: 'unknown',
          lang: 'ts',
          code: `let loose: any = 'text';
console.log(loose.toFixed(1));`,
          runtimeError: 'TypeError',
          caption: 'The checker said nothing, because `any` switches it off. The code then fails at runtime.',
        },
        {
          id: 'unknown-safe',
          lang: 'ts',
          code: `const value: unknown = 'text';
console.log(value.length);
if (typeof value === 'string') {
  console.log(value.length);
}`,
          output: ['4', '4'],
          errors: [{ code: 18046, line: 2 }],
        },
        {
          id: 'as-const',
          lang: 'ts',
          code: `const roles = ['admin', 'user'] as const;
type Role = (typeof roles)[number];
const r: Role = 'admin';
const bad: Role = 'guest';
console.log(r);`,
          output: ['admin'],
          errors: [{ code: 2322, line: 4 }],
        },
      ],
    },
  ],
  recap: [
    '`number[]` is a list of numbers. A tuple `[string, number]` has a fixed shape.',
    'A union `A | B` allows either. A literal type is one exact value.',
    'A type alias names a type: `type Id = string | number`.',
    'In strict mode `null` and `undefined` are separate types: write `string | null` to allow them.',
    'Prefer `unknown` over `any`. `as const` keeps exact literals.',
  ],
  checks: [
    mcq('ts-primitives.c1', 'ts-primitives', 'Which line is the type error?', ['Line 2', 'Line 3', 'Line 4', 'There is no error'], 1,
      'The type `"red" | "green"` only allows those two strings, and "blue" is neither.',
      ts(`type Light = 'red' | 'green';\nconst a: Light = 'red';\nconst b: Light = 'blue';`),
      { kind: 'ts-error', line: 3, code: 2322 }),
    mcq('ts-primitives.c2', 'ts-primitives', 'Why is `unknown` safer than `any`?', ['It is faster', 'You must check the value before using it', 'It only accepts strings', 'It removes null'], 1,
      'Both accept any value, but the compiler stops you from using an `unknown` value until you have narrowed it.'),
    short('ts-primitives.c3', 'ts-primitives', 'Type exactly what this prints.', ['36'],
      'Destructuring a tuple gives each variable the type at its position, so `age` is the number 36.',
      ts(`const entry: [string, number] = ['Ada', 36];\nconst [, age] = entry;\nconsole.log(age);`), OUT),
  ],
  exercises: ['ex-ts-primitives-types'],
};

export const TS_FUNCTIONS: Lesson = {
  id: 'ts-functions',
  title: 'Typing functions',
  summary: 'Optional, default and rest parameters, function types and typed callbacks.',
  minutes: 14,
  objectives: [
    'Mark a parameter optional or give it a default',
    'Type rest parameters and a void return',
    'Write and use a function type',
    'Let TypeScript infer the types of callback parameters',
  ],
  sections: [
    {
      heading: 'Optional and default parameters',
      body: [
        'A parameter followed by `?` is optional, and its type becomes `T | undefined` inside the function. A parameter with a default value is optional too, and keeps its plain type because the default fills in. Optional parameters must come after required ones.',
      ],
      examples: [
        {
          id: 'optional',
          lang: 'ts',
          code: `function greet(name: string, greeting = 'Hello', excited?: boolean): string {
  return greeting + ', ' + name + (excited ? '!' : '.');
}
console.log(greet('Ada'));
console.log(greet('Ada', 'Hi', true));
console.log(greet());`,
          output: ['Hello, Ada.', 'Hi, Ada!', 'Hello, undefined.'],
          errors: [{ code: 2554, line: 6 }],
          caption: 'Line 6 leaves out the required name.',
        },
      ],
    },
    {
      heading: 'Rest parameters and void',
      body: [
        'A rest parameter collects extra arguments into an array, so give it an array type: `...nums: number[]`. A function that returns nothing has the return type `void`.',
      ],
      examples: [
        {
          id: 'rest',
          lang: 'ts',
          code: `function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
function log(message: string): void {
  console.log(message);
}
log(String(sum(1, 2, 3)));
log(String(sum(1, 'x')));`,
          output: ['6', '1x'],
          errors: [{ code: 2345, line: 8 }],
        },
      ],
    },
    {
      heading: 'Function types',
      body: [
        'A function type is written `(a: number, b: number) => number`. Use it to type a variable or a parameter that holds a function, such as a callback. The parameter names in the type are just labels.',
      ],
      examples: [
        {
          id: 'fn-type',
          lang: 'ts',
          code: `type Op = (a: number, b: number) => number;
const add: Op = (a, b) => a + b;
const bad: Op = (a, b) => String(a + b);
function apply(op: Op, x: number, y: number): number {
  return op(x, y);
}
console.log(apply(add, 2, 3));`,
          output: ['5'],
          errors: [{ code: 2322, line: 3 }],
        },
      ],
    },
    {
      heading: 'Callbacks and inference',
      body: [
        'When you pass a function where a function type is expected, TypeScript already knows the parameter types, so you do not annotate them. This is called contextual typing, and it is why `[1, 2].map((n) => n * 2)` needs no annotations. Mistakes inside the callback are still caught.',
      ],
      examples: [
        {
          id: 'contextual',
          lang: 'ts',
          code: `const words = ['tea', 'coffee'];
const lengths = words.map((w) => w.length);
const bad = words.map((w) => w.size);
console.log(lengths);`,
          output: ['[ 3, 6 ]'],
          errors: [{ code: 2339, line: 3 }],
        },
      ],
    },
  ],
  recap: [
    '`name?: T` and `name = value` make a parameter optional. Required parameters come first.',
    'Rest parameters are arrays: `...nums: number[]`. A function that returns nothing is `void`.',
    'A function type: `(a: number) => string`.',
    'Callback parameters are inferred from the expected function type.',
  ],
  checks: [
    mcq('ts-functions.c1', 'ts-functions', 'Which line is the type error?', ['Line 2', 'Line 3', 'Line 4', 'There is no error'], 2,
      '`times` is a number, so the string "3" on line 4 is not accepted.',
      ts(`function repeat(text: string, times: number): string {\n  return text.repeat(times);\n}\nconsole.log(repeat('a', '3'));`),
      { kind: 'ts-error', line: 4, code: 2345 }),
    mcq('ts-functions.c2', 'ts-functions', 'What is the type of `nums` in `function f(...nums: number[])`?', ['number', 'number[]', 'any', '[number]'], 1,
      'A rest parameter gathers the extra arguments into an array.'),
    short('ts-functions.c3', 'ts-functions', 'Type exactly what this prints.', ['6'],
      'The default value 2 is used when `b` is left out, so `3 * 2` is 6.',
      ts(`function scale(a: number, b = 2): number {\n  return a * b;\n}\nconsole.log(scale(3));`), OUT),
  ],
  exercises: ['ex-ts-functions-run'],
};

export const TS_NARROWING: Lesson = {
  id: 'ts-narrowing',
  title: 'Narrowing',
  summary: 'Use checks the compiler understands to turn a wide type into the exact one.',
  minutes: 14,
  objectives: [
    'Narrow a union with typeof, equality and truthiness',
    'Narrow with in and instanceof',
    'Handle null and undefined safely',
    'Explain why a type assertion is not a conversion',
  ],
  sections: [
    {
      heading: 'Checks the compiler follows',
      body: [
        'A value of type `string | number` can only use what both types share. Check it with `typeof` and, inside that branch, TypeScript knows which one it is. This is **narrowing**. Equality checks like `value === null` narrow too.',
      ],
      examples: [
        {
          id: 'typeof',
          lang: 'ts',
          code: `function size(value: string | number): number {
  if (typeof value === 'string') {
    return value.length;
  }
  return value;
}
function broken(value: string | number): number {
  return value.length;
}
console.log(size('tea'), size(7));`,
          output: ['3 7'],
          errors: [{ code: 2339, line: 8 }],
        },
      ],
    },
    {
      heading: 'null, undefined and truthiness',
      body: [
        'A check like `if (value)` narrows away null and undefined, but it also removes `0`, `""` and `false`, which are valid values. When those matter, compare explicitly with `=== null` or `=== undefined`. Optional chaining `?.` and `??` handle the missing case in one step.',
      ],
      examples: [
        {
          id: 'nullable',
          lang: 'ts',
          code: `function shout(text: string | null): string {
  if (text === null) {
    return 'nothing';
  }
  return text.toUpperCase();
}
function broken(text: string | null): string {
  return text.toUpperCase();
}
console.log(shout('hi'), shout(null));`,
          output: ['HI nothing'],
          errors: [{ code: 18047, line: 8 }],
        },
      ],
    },
    {
      heading: 'in and instanceof',
      body: [
        'Use `"key" in obj` to tell object types apart by a property, and `value instanceof Class` to check for instances of a class. Both narrow in the branch where they are true.',
      ],
      examples: [
        {
          id: 'in-instanceof',
          lang: 'ts',
          code: `type Cat = { meow: () => string };
type Dog = { bark: () => string };
function speak(pet: Cat | Dog): string {
  if ('meow' in pet) {
    return pet.meow();
  }
  return pet.bark();
}
console.log(speak({ bark: () => 'woof' }));
function show(when: Date | string): number {
  return when instanceof Date ? when.getTime() : when.length;
}
console.log(show(new Date(0)), show('abc'));`,
          output: ['woof', '0 3'],
        },
      ],
    },
    {
      heading: 'Assertions are promises, not conversions',
      body: [
        '`value as string` tells the compiler to believe you. It does not check or change anything at runtime. If you are wrong, the program still breaks. The non-null assertion `value!` is the same kind of promise. Use a real check instead, and keep assertions for the rare case where you know something the compiler cannot.',
      ],
      examples: [
        {
          id: 'as',
          lang: 'ts',
          code: `const input: unknown = 42;
const text = input as string;
console.log(text.length);`,
          output: ['undefined'],
          caption: 'The cast compiled, but a number has no length. Nothing was converted.',
        },
      ],
    },
  ],
  recap: [
    'Checks like `typeof`, `=== null`, `in` and `instanceof` narrow a union in their branch.',
    '`if (value)` also removes 0, empty strings and false. Compare explicitly when they matter.',
    '`?.` and `??` handle a missing value in one step.',
    '`as` and `!` are promises to the compiler, not conversions. Prefer a real check.',
  ],
  checks: [
    mcq('ts-narrowing.c1', 'ts-narrowing', 'Which line is the type error?', ['Line 2', 'Line 3', 'Line 5', 'There is no error'], 2,
      'Outside the `typeof` check, `value` is still `string | number`, and a number has no `toUpperCase`.',
      ts(`function f(value: string | number) {\n  if (typeof value === 'string') {\n    return value.toUpperCase();\n  }\n  return value.toUpperCase();\n}`),
      { kind: 'ts-error', line: 5, code: 2339 }),
    mcq('ts-narrowing.c2', 'ts-narrowing', 'What does `value as string` do at runtime?', ['Converts the value to a string', 'Throws if it is not a string', 'Nothing at all', 'Checks the type'], 2,
      'A type assertion exists only for the compiler. It is removed before the program runs.'),
    short('ts-narrowing.c3', 'ts-narrowing', 'Type exactly what this prints.', ['0'],
      '`??` only replaces null and undefined. The value 0 is not missing, so it is kept.',
      ts(`const count: number | null = 0;\nconsole.log(count ?? 5);`), OUT),
  ],
  exercises: ['ex-ts-narrowing-run', 'ex-ts-narrowing-types'],
};
