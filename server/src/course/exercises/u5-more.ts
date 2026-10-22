import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

export const U5_MORE: Problem[] = [
  {
    id: 'ex-ts-primitives-types',
    topic: 'ts-basics',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-primitives',
    title: 'Name the types',
    difficulty: 1,
    prompt:
      'Replace the two loose aliases with exact types. `Direction` must be exactly one of `"north"`, `"south"`, `"east"` or `"west"`. `Point` must be a pair of numbers: an array of exactly two numbers, `x` first and `y` second.',
    concept: 'Literal unions and tuples describe exactly the values that are allowed.',
    fn: 'Direction',
    starter: `type Direction = string;
type Point = number[];
`,
    reference: `type Direction = 'north' | 'south' | 'east' | 'west';
type Point = [number, number];`,
    typeChecks: [
      { label: 'All four directions are accepted', code: `const a: Direction = 'north';\nconst b: Direction = 'south';\nconst c: Direction = 'east';\nconst d: Direction = 'west';\nvoid [a, b, c, d];`, cat: 'basic' },
      { label: 'Any other text is rejected as a direction', code: `// @ts-expect-error\nconst x: Direction = 'up';\nvoid x;`, cat: 'basic' },
      { label: 'A pair of numbers is a point', code: `const p: Point = [3, 4];\nconst [px, py]: Point = p;\nvoid [px, py];`, cat: 'basic' },
      { label: 'One number is not a point', code: `// @ts-expect-error\nconst p: Point = [1];\nvoid p;`, cat: 'edge' },
      { label: 'Three numbers are not a point', code: `// @ts-expect-error\nconst p: Point = [1, 2, 3];\nvoid p;`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'direction-loose',
        'ts-too-loose',
        'Direction still allows any string',
        'A plain string accepts "up" as well, so the check that expects an error finds none.',
        'List the four allowed words as a union of literal types.',
        ['Which values should be allowed for a Direction?'],
        `type Direction = string;
type Point = [number, number];`,
      ),
      v(
        'point-loose',
        'ts-too-loose',
        'Point still allows any number of numbers',
        'A number array accepts one, two or three numbers, so the pairs that should be rejected are accepted.',
        'Use a tuple with exactly two number positions.',
        ['How long should a Point be?'],
        `type Direction = 'north' | 'south' | 'east' | 'west';
type Point = number[];`,
      ),
      v(
        'missing-west',
        'ts-mismatch',
        'One of the directions is missing from the union',
        'The union leaves out "west", so assigning "west" is an error.',
        'Check that all four directions are in the union.',
        ['Which of the four words is not in your union?'],
        `type Direction = 'north' | 'south' | 'east';
type Point = [number, number];`,
      ),
    ],
  },
  {
    id: 'ex-ts-functions-run',
    topic: 'ts-basics',
    lang: 'ts',
    lesson: 'ts-functions',
    title: 'Greeting with options',
    difficulty: 1,
    prompt:
      'Write `greet(name, greeting, excited)`. `greeting` is optional and defaults to `"Hello"`, `excited` is optional. The result is `<greeting>, <name>` followed by `!` when `excited` is true and `.` otherwise. `greet("Ada")` returns `"Hello, Ada."` and `greet("Ada", "Hi", true)` returns `"Hi, Ada!"`. Give every parameter a type.',
    concept: 'Default and optional parameters, each with a type.',
    fn: 'greet',
    starter: `function greet(name: string, greeting: string, excited: boolean): string {
  // build the greeting
}
`,
    reference: `function greet(name: string, greeting: string = 'Hello', excited?: boolean): string {
  return greeting + ', ' + name + (excited ? '!' : '.');
}`,
    tests: [
      { args: ['Ada'], cat: 'basic' },
      { args: ['Ada', 'Hi'], cat: 'basic' },
      { args: ['Ada', 'Hi', true], cat: 'basic' },
      { args: ['Bo', 'Hey', false], cat: 'edge' },
      { args: ['Cy', 'Yo', true], cat: 'basic' },
    ],
    traceArgs: ['Ada', 'Hi', true],
    track: [],
    variants: [
      v(
        'always-period',
        'logic',
        'Always ends with a full stop',
        'The excited flag is never used, so the greeting ends with a full stop even when excited is true.',
        'Use the excited flag to choose between ! and the full stop.',
        ['What should greet("Ada", "Hi", true) end with?'],
        `function greet(name: string, greeting: string = 'Hello', excited?: boolean): string {
  return greeting + ', ' + name + '.';
}`,
      ),
      v(
        'no-default',
        'ts-null',
        'The greeting has no default value',
        'When the greeting is left out the code builds "undefined, Ada." and the type of the parameter should say it may be missing.',
        'Give the greeting a default of "Hello".',
        ['What does `greeting` hold when the caller leaves it out?'],
        `function greet(name: string, greeting?: string, excited?: boolean): string {
  return greeting + ', ' + name + (excited ? '!' : '.');
}`,
      ),
      v(
        'wrong-order',
        'logic',
        'Name and greeting are swapped in the text',
        'The result starts with the name instead of the greeting.',
        'The greeting comes first, then the comma, then the name.',
        ['What does the expected text start with?'],
        `function greet(name: string, greeting: string = 'Hello', excited?: boolean): string {
  return name + ', ' + greeting + (excited ? '!' : '.');
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-narrowing-run',
    topic: 'ts-basics',
    lang: 'ts',
    lesson: 'ts-narrowing',
    title: 'Describe a value',
    difficulty: 2,
    prompt:
      'Write `describe(value)` for a value that is a `string`, a `number` or `null`. A string gives `text:` followed by its length, a number gives `number:` followed by the number with one decimal (`toFixed(1)`), and null gives `nothing`. `describe("tea")` is `"text:3"`, `describe(2)` is `"number:2.0"`. The empty string and 0 are real values, not "nothing".',
    concept: 'Narrow a union with explicit checks, not just truthiness.',
    fn: 'describe',
    starter: `function describe(value: string | number | null): string {
  // narrow the value and describe it
}
`,
    reference: `function describe(value: string | number | null): string {
  if (value === null) return 'nothing';
  if (typeof value === 'string') return 'text:' + value.length;
  return 'number:' + value.toFixed(1);
}`,
    tests: [
      { args: ['tea'], cat: 'basic' },
      { args: [2], cat: 'basic' },
      { args: [null], cat: 'basic' },
      { args: [''], cat: 'edge' },
      { args: [0], cat: 'edge' },
      { args: [3.14159], cat: 'basic' },
    ],
    traceArgs: ['tea'],
    track: [],
    variants: [
      v(
        'truthy',
        'edge-case',
        'Empty text and 0 are treated as nothing',
        'The check `if (!value)` is true for "" and 0 as well as null, so these real values are reported as nothing.',
        'Compare with null explicitly.',
        ['What does `!""` give?', 'What does `!0` give?'],
        `function describe(value: string | number | null): string {
  if (!value) return 'nothing';
  if (typeof value === 'string') return 'text:' + value.length;
  return 'number:' + value.toFixed(1);
}`,
      ),
      v(
        'unchecked-null',
        'ts-null',
        'The null case is not handled',
        'TypeScript reports that the value is possibly null, and at runtime null has no type to compare with.',
        'Return "nothing" for null before using the value.',
        ['What can `value` be at the first `typeof` check?'],
        `function describe(value: string | number | null): string {
  if (typeof value === 'string') return 'text:' + value.length;
  return 'number:' + value.toFixed(1);
}`,
      ),
      v(
        'cast',
        'ts-narrowing',
        'Casts the value instead of checking it',
        'The `as string` cast silences the compiler but does not change the value, so a number is described as text with an undefined length.',
        'Use typeof to find out which type it really is.',
        ['Does `as string` check anything while the program runs?'],
        `function describe(value: string | number | null): string {
  if (value === null) return 'nothing';
  return 'text:' + (value as string).length;
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-narrowing-types',
    topic: 'ts-basics',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-narrowing',
    title: 'Make it compile',
    difficulty: 2,
    prompt:
      'Strict TypeScript rejects `shout` because `text` may be null. Fix the function body so it compiles, without changing what the callers may pass: a string, or null. It must return the text in capitals, and `""` for null. Do not use `!` or `as`.',
    concept: 'Handle null with a real check so the code compiles honestly.',
    fn: 'shout',
    starter: `function shout(text: string | null): string {
  return text.toUpperCase();
}
`,
    reference: `function shout(text: string | null): string {
  if (text === null) return '';
  return text.toUpperCase();
}`,
    typeChecks: [
      { label: 'shout("hi") gives a string', code: `const s: string = shout('hi');\nvoid s;`, cat: 'basic' },
      { label: 'shout(null) is allowed', code: `const s: string = shout(null);\nvoid s;`, cat: 'basic' },
      { label: 'A number is not accepted', code: `// @ts-expect-error\nshout(5);`, cat: 'basic' },
      { label: 'undefined is not accepted', code: `// @ts-expect-error\nshout(undefined);`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'still-unchecked',
        'ts-null',
        'The text is still used without a null check',
        'The body is unchanged, so TypeScript still reports that text is possibly null.',
        'Check for null before calling toUpperCase.',
        ['What type does `text` have on the line with toUpperCase?'],
        `function shout(text: string | null): string {
  return text.toUpperCase();
}`,
      ),
      v(
        'no-null-allowed',
        'ts-mismatch',
        'The parameter no longer accepts null',
        'Changing the parameter to string makes the body compile, but callers can no longer pass null.',
        'Keep string | null as the parameter type and handle null inside.',
        ['Which callers does the check "shout(null) is allowed" represent?'],
        `function shout(text: string): string {
  return text.toUpperCase();
}`,
      ),
      v(
        'accepts-anything',
        'ts-too-loose',
        'The parameter accepts more than a string or null',
        'Adding number to the parameter type makes numbers acceptable, so the call that should be rejected is accepted.',
        'The parameter type is exactly string | null.',
        ['Should shout(5) be allowed?'],
        `function shout(text: string | number | null): string {
  if (text === null) return '';
  return String(text).toUpperCase();
}`,
      ),
    ],
  },
];
