import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

export const U7_EXERCISES: Problem[] = [
  // ---------------------------------------------------------------- ts-generic-functions
  {
    id: 'ex-ts-generic-functions-run',
    topic: 'ts-generics',
    lang: 'ts',
    lesson: 'ts-generic-functions',
    title: 'Last item',
    difficulty: 1,
    prompt:
      'Write the generic function `lastItem(items)` that returns the last item of a list, or `undefined` when the list is empty. The result must have the same item type as the list, for example `lastItem(["a", "b"])` returns `"b"`. Do not use `any`.',
    concept: 'A type parameter links the type of the list to the type of the result.',
    fn: 'lastItem',
    starter: `function lastItem<T>(items: T[]): T | undefined {
  // return the last item, or undefined for an empty list
}
`,
    reference: `function lastItem<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}`,
    tests: [
      { args: [[1, 2, 3]], cat: 'basic' },
      { args: [['tea', 'coffee']], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [['only']], cat: 'edge' },
      { args: [[true, false, true, false]], cat: 'basic' },
      { args: [[10, 20, 30, 40, 50, 60, 70]], cat: 'large' },
    ],
    traceArgs: [[1, 2, 3]],
    track: [],
    variants: [
      v(
        'off-by-one',
        'off-by-one',
        'Reads one place past the end',
        'The last index is length minus 1. Index `items.length` does not exist, so the result is always undefined.',
        'Count from zero: a list of 3 items has indexes 0, 1 and 2.',
        ['For a list of 3 items, what is the last index?'],
        `function lastItem<T>(items: T[]): T | undefined {
  return items[items.length];
}`,
      ),
      v(
        'first-item',
        'logic',
        'Returns the first item',
        'Index 0 is the start of the list, not the end.',
        'Use the index of the final item instead of 0.',
        ['Which end of the list is index 0?'],
        `function lastItem<T>(items: T[]): T | undefined {
  return items[0];
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Uses any instead of a type parameter',
        'any makes the code run, but the caller loses the item type. A string list would give back any, not string.',
        'Declare <T> and use T[] for the parameter and T | undefined for the result.',
        ['What links the item type going in to the item type coming out?'],
        `function lastItem(items: any[]): any {
  return items[items.length - 1];
}`,
      ),
      v(
        'second-to-last',
        'boundary',
        'Skips the final item',
        'Using length minus 2 gives the second to last item, and an empty or one-item list gives undefined.',
        'The last item sits at length minus 1.',
        ['Which index does `length - 2` point at in a list of 3 items?'],
        `function lastItem<T>(items: T[]): T | undefined {
  return items[items.length - 2];
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-generic-functions-types',
    topic: 'ts-generics',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-generic-functions',
    title: 'First or fallback',
    difficulty: 2,
    prompt:
      'Write `firstOr(items, fallback)`: it returns the first item of the list, or `fallback` when the list is empty. Give it a type parameter so that the result has the item type, and so that a fallback of a different type is rejected. `firstOr([1, 2], 0)` is a number, and `firstOr([1, 2], "zero")` must be an error. Do not use `any`.',
    concept: 'One type parameter shared by two parameters forces them to agree.',
    fn: 'firstOr',
    starter: `function firstOr(items, fallback) {
  // return the first item, or the fallback when the list is empty
  return items.length > 0 ? items[0] : fallback;
}
`,
    reference: `function firstOr<T>(items: T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback;
}`,
    typeChecks: [
      { label: 'A number list with a number fallback gives a number', code: `const n: number = firstOr([1, 2], 0);\nvoid n;`, cat: 'basic' },
      { label: 'A string list with a string fallback gives a string', code: `const s: string = firstOr(['tea', 'coffee'], 'water');\nvoid s;`, cat: 'basic' },
      { label: 'A fallback of another type is rejected', code: `// @ts-expect-error\nfirstOr([1, 2], 'zero');`, cat: 'basic' },
      { label: 'The result is not widened to unknown', code: `// @ts-expect-error\nconst wrong: string = firstOr([1, 2], 0);\nvoid wrong;`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'two-parameters',
        'ts-too-loose',
        'The fallback gets its own type parameter',
        'With <T, U> the fallback can be any type, so a string fallback for a number list is accepted and the result becomes number | string.',
        'Use the same type parameter for the list items and the fallback.',
        ['Should the fallback be allowed to differ from the items?', 'How many type parameters link two values to one type?'],
        `function firstOr<T, U>(items: T[], fallback: U): T | U {
  return items.length > 0 ? items[0] : fallback;
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Uses any instead of a type parameter',
        'With any nothing is ever rejected, and the result is any, so the check that expects an error finds none.',
        'Declare <T> and use it for items, fallback and the result.',
        ['What would make the compiler remember the item type?'],
        `function firstOr(items: any[], fallback: any): any {
  return items.length > 0 ? items[0] : fallback;
}`,
      ),
      v(
        'unknown',
        'ts-mismatch',
        'Everything is unknown',
        'unknown accepts any argument, but the result is unknown too, so it cannot be put into a number or a string variable.',
        'Keep the type that goes in: use a type parameter instead of unknown.',
        ['What type does the caller get back?', 'Can unknown be assigned to number?'],
        `function firstOr(items: unknown[], fallback: unknown): unknown {
  return items.length > 0 ? items[0] : fallback;
}`,
      ),
    ],
  },

  // ---------------------------------------------------------------- ts-generic-types
  {
    id: 'ex-ts-generic-types-run',
    topic: 'ts-generics',
    lang: 'ts',
    lesson: 'ts-generic-types',
    title: 'Pluck a property',
    difficulty: 1,
    prompt:
      'Write `pluck(items, key)` that returns a list with the `key` property of every object, in order. `pluck([{ name: "Ada" }, { name: "Grace" }], "name")` returns `["Ada", "Grace"]`. Constrain `key` with `keyof` so that a property that does not exist is rejected, and give back the right type. An empty list gives an empty list.',
    concept: 'A `K extends keyof T` constraint ties a key to the object type it belongs to.',
    fn: 'pluck',
    starter: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  // return the key property of every item
}
`,
    reference: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  const result: T[K][] = [];
  for (const item of items) {
    result.push(item[key]);
  }
  return result;
}`,
    tests: [
      { args: [[{ name: 'Ada', age: 36 }, { name: 'Grace', age: 45 }], 'name'], cat: 'basic' },
      { args: [[{ name: 'Ada', age: 36 }, { name: 'Grace', age: 45 }], 'age'], cat: 'basic' },
      { args: [[], 'name'], cat: 'edge' },
      { args: [[{ id: 7 }], 'id'], cat: 'edge' },
      { args: [[{ tea: 3, milk: true }, { tea: 5, milk: false }, { tea: 2, milk: true }], 'milk'], cat: 'basic' },
      { args: [[{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }, { n: 5 }, { n: 6 }, { n: 7 }, { n: 8 }], 'n'], cat: 'large' },
    ],
    traceArgs: [[{ n: 1 }, { n: 2 }, { n: 3 }], 'n'],
    track: ['result'],
    variants: [
      v(
        'returns-items',
        'logic',
        'Returns the objects themselves',
        'Each object is pushed whole, so the result is a copy of the input and not the values of the property.',
        'Push the property of the item, not the item.',
        ['What does `item[key]` give?'],
        `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  const result: T[K][] = [];
  for (const item of items) {
    result.push(item as unknown as T[K]);
  }
  return result;
}`,
      ),
      v(
        'only-first',
        'edge-case',
        'Only reads the first item',
        'The function returns a list with one value no matter how long the input is, and fails on an empty list.',
        'Visit every item, and start from an empty list.',
        ['What happens with three items?', 'What should an empty list give?'],
        `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  const result: T[K][] = [];
  result.push(items[0][key]);
  return result;
}`,
      ),
      v(
        'reversed',
        'logic',
        'The values come out in reverse order',
        'Using unshift puts each new value at the front, so the list ends up backwards.',
        'Add each value at the end of the list.',
        ['Where does unshift add an item?'],
        `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  const result: T[K][] = [];
  for (const item of items) {
    result.unshift(item[key]);
  }
  return result;
}`,
      ),
      v(
        'string-key',
        'ts-implicit-any',
        'The key is a plain string',
        'A string is not known to be a key of T, so indexing item[key] is an error, and callers could pass a name that does not exist.',
        'Constrain the key with K extends keyof T.',
        ['Which strings are valid keys of T?'],
        `function pluck<T>(items: T[], key: string): unknown[] {
  const result: unknown[] = [];
  for (const item of items) {
    result.push(item[key]);
  }
  return result;
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-generic-types-types',
    topic: 'ts-generics',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-generic-types',
    title: 'The longer one',
    difficulty: 2,
    prompt:
      'Write `longer(a, b)`: it returns whichever argument has the larger `length`, the first one when they are equal. It must accept two strings or two arrays, return the same type it was given, and reject values with no `length`, like numbers. Use a constraint on the type parameter. Do not use `any`.',
    concept: 'A constraint with `extends` lets the function use a property while keeping the caller\'s type.',
    fn: 'longer',
    starter: `function longer<T>(a: T, b: T): T {
  // return the one with the larger length
  return a.length >= b.length ? a : b;
}
`,
    reference: `function longer<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}`,
    typeChecks: [
      { label: 'Two strings give a string', code: `const s: string = longer('tea', 'coffee');\nvoid s;`, cat: 'basic' },
      { label: 'Two arrays give an array of the same item type', code: `const list: number[] = longer([1, 2, 3], [4]);\nvoid list;`, cat: 'basic' },
      { label: 'Numbers have no length and are rejected', code: `// @ts-expect-error\nlonger(10, 20);`, cat: 'basic' },
      { label: 'A string and an array do not mix', code: `// @ts-expect-error\nlonger('tea', [1, 2]);`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'string-only',
        'ts-mismatch',
        'The constraint only allows strings',
        'T extends string works for text, but an array is not a string, so the call with two arrays is rejected.',
        'Constrain T to anything that has a numeric length, not to one type.',
        ['Which other values have a length?', 'How can a type say "has a length property"?'],
        `function longer<T extends string>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}`,
      ),
      v(
        'object-types',
        'ts-mismatch',
        'Plain object types lose the original type',
        'With parameters and result typed as { length: number }, the string you pass in comes back as a bare object type, which cannot go into a string variable.',
        'Keep a type parameter so the result has the type that was passed in, and add the constraint to it.',
        ['What type does the caller get back?'],
        `function longer(a: { length: number }, b: { length: number }): { length: number } {
  return a.length >= b.length ? a : b;
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Uses any instead of a constraint',
        'any accepts numbers too, so the calls that should be rejected are not.',
        'Use <T extends { length: number }>.',
        ['What should happen when you pass a number?'],
        `function longer(a: any, b: any): any {
  return a.length >= b.length ? a : b;
}`,
      ),
    ],
  },

  // ---------------------------------------------------------------- ts-mapped-conditional
  {
    id: 'ex-ts-mapped-conditional-run',
    topic: 'ts-generics',
    lang: 'ts',
    lesson: 'ts-mapped-conditional',
    title: 'Double every value',
    difficulty: 1,
    prompt:
      'Write `doubleValues(obj)` that takes an object whose values are all numbers and returns a new object with the same keys and every value doubled: `doubleValues({ a: 1, b: 5 })` returns `{ a: 2, b: 10 }`. Type the result with a mapped type so the keys are kept. An empty object gives an empty object.',
    concept: 'A mapped type `{ [K in keyof T]: ... }` describes an object with the same keys as T.',
    fn: 'doubleValues',
    starter: `function doubleValues<T extends Record<string, number>>(obj: T): { [K in keyof T]: number } {
  const result = {} as { [K in keyof T]: number };
  // double every value of obj into result
  return result;
}
`,
    reference: `function doubleValues<T extends Record<string, number>>(obj: T): { [K in keyof T]: number } {
  const result = {} as { [K in keyof T]: number };
  for (const key in obj) {
    result[key] = obj[key] * 2;
  }
  return result;
}`,
    tests: [
      { args: [{ a: 1, b: 5 }], cat: 'basic' },
      { args: [{ apples: 3, pears: 4, plums: 10 }], cat: 'basic' },
      { args: [{}], cat: 'edge' },
      { args: [{ only: 7 }], cat: 'edge' },
      { args: [{ x: 0, y: -2 }], cat: 'edge' },
      { args: [{ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 }], cat: 'large' },
    ],
    traceArgs: [{ a: 1, b: 2, c: 3 }],
    track: [],
    variants: [
      v(
        'add-two',
        'wrong-operator',
        'Adds 2 instead of doubling',
        'Adding 2 matches doubling only when the value is 2.',
        'Doubling is multiplication by 2.',
        ['What do 5 + 2 and 5 * 2 give?'],
        `function doubleValues<T extends Record<string, number>>(obj: T): { [K in keyof T]: number } {
  const result = {} as { [K in keyof T]: number };
  for (const key in obj) {
    result[key] = obj[key] + 2;
  }
  return result;
}`,
      ),
      v(
        'returns-array',
        'logic',
        'Returns a list of numbers, not an object',
        'Object.values drops the keys, so the result is an array and no longer has the shape of the input.',
        'Build an object and assign each doubled value to its own key.',
        ['What does the result look like for { a: 1 }?'],
        `function doubleValues<T extends Record<string, number>>(obj: T): { [K in keyof T]: number } {
  return Object.values(obj).map((value) => value * 2) as unknown as { [K in keyof T]: number };
}`,
      ),
      v(
        'only-first-key',
        'edge-case',
        'Only the first key is doubled',
        'The loop stops after the first key, so objects with more keys come back incomplete.',
        'Do not leave the loop early: every key needs doubling.',
        ['What happens for an object with three keys?'],
        `function doubleValues<T extends Record<string, number>>(obj: T): { [K in keyof T]: number } {
  const result = {} as { [K in keyof T]: number };
  for (const key in obj) {
    result[key] = obj[key] * 2;
    break;
  }
  return result;
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Uses any for the result',
        'any works at runtime, but the returned object no longer remembers which keys it has.',
        'Type the result with { [K in keyof T]: number }.',
        ['What would the compiler say about result.missing?'],
        `function doubleValues(obj: Record<string, number>): any {
  const result: any = {};
  for (const key in obj) {
    result[key] = obj[key] * 2;
  }
  return result;
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-mapped-conditional-types',
    topic: 'ts-generics',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-mapped-conditional',
    title: 'Make it writable',
    difficulty: 2,
    prompt:
      'Define the generic type `Mutable<T>`: it is `T` with `readonly` removed from every property. Properties keep their types and stay required. Hint: a mapped type can remove a modifier with a minus sign.',
    concept: 'A mapped type with `-readonly` removes a modifier from every property.',
    fn: 'Mutable',
    starter: `type Mutable<T> = T; // remove readonly from every property of T
`,
    reference: `type Mutable<T> = { -readonly [K in keyof T]: T[K] };`,
    typeChecks: [
      {
        label: 'A property of the result can be assigned',
        code: `interface Locked { readonly id: number; readonly name: string }\nconst m: Mutable<Locked> = { id: 1, name: 'Ada' };\nm.id = 2;\nm.name = 'Grace';\nvoid m;`,
        cat: 'basic',
      },
      {
        label: 'Property types are kept',
        code: `interface Locked { readonly id: number; readonly name: string }\nconst m: Mutable<Locked> = { id: 1, name: 'Ada' };\n// @ts-expect-error\nm.id = 'two';\nvoid m;`,
        cat: 'basic',
      },
      {
        label: 'Properties stay required',
        code: `interface Locked { readonly id: number; readonly name: string }\n// @ts-expect-error\nconst m: Mutable<Locked> = { id: 1 };\nvoid m;`,
        cat: 'edge',
      },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'no-minus',
        'ts-mismatch',
        'The mapped type keeps readonly',
        'A mapped type over keyof T copies the readonly modifiers unless you remove them with -readonly.',
        'Put a minus sign in front of readonly in the mapped type.',
        ['What does `[K in keyof T]` do to modifiers by default?'],
        `type Mutable<T> = { [K in keyof T]: T[K] };`,
      ),
      v(
        'all-optional',
        'ts-too-loose',
        'Every property became optional',
        'Adding ? makes the properties optional, so an object with a missing property is accepted.',
        'Only remove readonly. Do not touch the ? modifier.',
        ['Which modifier does the task ask you to remove?'],
        `type Mutable<T> = { -readonly [K in keyof T]?: T[K] };`,
      ),
      v(
        'all-strings',
        'ts-mismatch',
        'Every value is typed as string',
        'The property type was replaced instead of copied, so numbers are rejected.',
        'Use T[K] for the value type, so each property keeps its own type.',
        ['What type should the id property have?'],
        `type Mutable<T> = { -readonly [K in keyof T]: string };`,
      ),
    ],
  },

  // ---------------------------------------------------------------- ts-type-guards
  {
    id: 'ex-ts-type-guards-run',
    topic: 'ts-generics',
    lang: 'ts',
    lesson: 'ts-type-guards',
    title: 'Sum only the numbers',
    difficulty: 1,
    prompt:
      'Write `sumNumbers(values)` for a list of unknown values. It returns the sum of the items that are numbers and ignores everything else, without converting: the string `"2"` is ignored. `sumNumbers([1, "2", 3, null])` returns 4. An empty list gives 0. Use a type guard so that no `any` is needed.',
    concept: 'A type guard narrows `unknown` values so you can use them safely.',
    fn: 'sumNumbers',
    starter: `function sumNumbers(values: unknown[]): number {
  // add up only the items that are numbers
}
`,
    reference: `function sumNumbers(values: unknown[]): number {
  const numbers = values.filter((item): item is number => typeof item === 'number');
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}`,
    tests: [
      { args: [[1, '2', 3, null]], cat: 'basic' },
      { args: [[10, 20, 30]], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [['a', true, null]], cat: 'edge' },
      { args: [[5, '5', true, 5]], cat: 'edge' },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'x']], cat: 'large' },
    ],
    traceArgs: [[1, 'two', 3, 4]],
    track: ['total'],
    variants: [
      v(
        'coerces',
        'coercion',
        'Converts every item to a number',
        'Number("2") is 2 and Number(true) is 1, so strings and booleans are counted instead of ignored.',
        'Only add an item when typeof says it already is a number.',
        ['What does Number(true) give?', 'Which items should be skipped?'],
        `function sumNumbers(values: unknown[]): number {
  let total = 0;
  for (const item of values) {
    total += Number(item);
  }
  return total;
}`,
      ),
      v(
        'counts',
        'logic',
        'Counts the numbers instead of adding them',
        'The total goes up by 1 for each number, not by the number itself.',
        'Add the value of the item to the total.',
        ['What should the total grow by for the item 10?'],
        `function sumNumbers(values: unknown[]): number {
  let total = 0;
  for (const item of values) {
    if (typeof item === 'number') {
      total += 1;
    }
  }
  return total;
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Uses any to skip the narrowing',
        'any lets the addition compile without a check, but it switches the type checker off for the whole list.',
        'Keep unknown and narrow each item with typeof.',
        ['What type is safe for data you know nothing about?'],
        `function sumNumbers(values: any[]): number {
  let total = 0;
  for (const item of values) {
    if (typeof item === 'number') total += item;
  }
  return total;
}`,
      ),
      v(
        'cast',
        'ts-narrowing',
        'Casts instead of checking',
        'The `as number` cast only tells the compiler to believe you. Strings and null are added anyway, so the total becomes text or a wrong number.',
        'Check each item with typeof before adding it, so the compiler and the runtime agree.',
        ['What does `3 + "2"` give in JavaScript?', 'Does `as number` change the value?'],
        `function sumNumbers(values: unknown[]): number {
  let total = 0;
  for (const item of values) {
    total += item as number;
  }
  return total;
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-type-guards-types',
    topic: 'ts-generics',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-type-guards',
    title: 'Is it a list of strings',
    difficulty: 2,
    prompt:
      'Write `isStringArray(value)`: it takes an `unknown` value and tells the compiler whether it is a list of strings. After `if (isStringArray(raw))` the variable `raw` must be usable as `string[]`. Write the body too: the value must be an array and every item a string. Do not use `any`.',
    concept: 'A type predicate `value is string[]` lets a check narrow the type.',
    fn: 'isStringArray',
    starter: `function isStringArray(value: unknown): boolean {
  // make the return type a type predicate
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
`,
    reference: `function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}`,
    typeChecks: [
      {
        label: 'Inside the if, the value can be used as string[]',
        code: `const raw: unknown = JSON.parse('["a"]');\nif (isStringArray(raw)) {\n  const list: string[] = raw;\n  void list;\n}`,
        cat: 'basic',
      },
      {
        label: 'Array methods work after the check',
        code: `function count(raw: unknown): number {\n  if (isStringArray(raw)) {\n    return raw.join('').length;\n  }\n  return 0;\n}\nvoid count;`,
        cat: 'basic',
      },
      {
        label: 'It is not narrowed to a list of numbers',
        code: `const raw: unknown = JSON.parse('["a"]');\nif (isStringArray(raw)) {\n  // @ts-expect-error\n  const list: number[] = raw;\n  void list;\n}`,
        cat: 'edge',
      },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'boolean',
        'ts-narrowing',
        'Returns plain boolean',
        'A boolean result does not tell the compiler anything, so the value is still unknown after the if.',
        'Change the return type to a type predicate: value is string[].',
        ['What does the compiler learn from a plain boolean?'],
        `function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}`,
      ),
      v(
        'wrong-target',
        'ts-mismatch',
        'The predicate names the wrong type',
        'The check promises number[], so the value is narrowed to a list of numbers and cannot be used as strings.',
        'The predicate must name the type the check really proves.',
        ['What does the body check each item for?'],
        `function isStringArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}`,
      ),
      v(
        'single-string',
        'ts-mismatch',
        'The predicate says string, not string[]',
        'The value is narrowed to one string instead of a list of strings, so it cannot be put into a string[] variable.',
        'Narrow to the list type, not to its item type.',
        ['Is the value a string, or a list of strings?'],
        `function isStringArray(value: unknown): value is string {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}`,
      ),
    ],
  },
];
