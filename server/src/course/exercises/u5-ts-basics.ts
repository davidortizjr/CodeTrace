import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

export const U5_EXERCISES: Problem[] = [
  {
    id: 'ex-ts-intro-run',
    topic: 'ts-basics',
    lang: 'ts',
    lesson: 'ts-intro',
    title: 'Initials',
    difficulty: 1,
    prompt:
      'Write `initials(first, last)` that returns the two initials in capitals with a dot after each, like `A.L.`. Give both parameters and the return value a type.',
    concept: 'Typed parameters and a return type on an ordinary function.',
    fn: 'initials',
    starter: `function initials(first: string, last: string): string {
  // return the two initials, for example "A.L."
}
`,
    reference: `function initials(first: string, last: string): string {
  return first[0].toUpperCase() + '.' + last[0].toUpperCase() + '.';
}`,
    tests: [
      { args: ['ada', 'lovelace'], cat: 'basic' },
      { args: ['Grace', 'Hopper'], cat: 'basic' },
      { args: ['alan', 'Turing'], cat: 'basic' },
      { args: ['x', 'y'], cat: 'edge' },
      { args: ['Linus', 'torvalds'], cat: 'basic' },
    ],
    traceArgs: ['ada', 'lovelace'],
    track: [],
    variants: [
      v(
        'no-uppercase',
        'case-handling',
        'Initials are not capitalised',
        'The first letters are used as they are, so lower case names give lower case initials.',
        'Call toUpperCase() on each first letter.',
        ['What does "ada"[0] give?', 'How do you make it a capital?'],
        `function initials(first: string, last: string): string {
  return first[0] + '.' + last[0] + '.';
}`,
      ),
      v(
        'swapped',
        'logic',
        'Last name comes first',
        'The initials are in the wrong order: the last name initial is placed before the first name initial.',
        'Put the first name initial first.',
        ['Which parameter should supply the first letter of the result?'],
        `function initials(first: string, last: string): string {
  return last[0].toUpperCase() + '.' + first[0].toUpperCase() + '.';
}`,
      ),
      v(
        'missing-last-dot',
        'wrong-operator',
        'No dot after the last initial',
        'The result ends after the second letter, so it reads "A.L" instead of "A.L.".',
        'Add a dot after the second initial too.',
        ['What does the expected result end with?'],
        `function initials(first: string, last: string): string {
  return first[0].toUpperCase() + '.' + last[0].toUpperCase();
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Uses any instead of string',
        'Typing a parameter as any switches the type checker off for it. The code works, but it no longer protects callers.',
        'Use string for both parameters.',
        ['What type should a name have?'],
        `function initials(first: any, last: any): string {
  return first[0].toUpperCase() + '.' + last[0].toUpperCase() + '.';
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-intro-types',
    topic: 'ts-basics',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-intro',
    title: 'Type the function',
    difficulty: 1,
    prompt:
      'The function `repeat` works, but its parameters have no types, so strict TypeScript reports errors. Add types so that `repeat("ab", 2)` is accepted and calls with the wrong kind of argument are rejected. Do not use `any`.',
    concept: 'Parameter types are what let the compiler reject bad calls.',
    fn: 'repeat',
    starter: `function repeat(text, times) {
  return text.repeat(times);
}
`,
    reference: `function repeat(text: string, times: number): string {
  return text.repeat(times);
}`,
    typeChecks: [
      { label: 'repeat("ab", 2) is accepted and gives a string', code: `const s: string = repeat('ab', 2);\nvoid s;`, cat: 'basic' },
      { label: 'A number as the text is rejected', code: `// @ts-expect-error\nrepeat(5, 2);`, cat: 'basic' },
      { label: 'A string as the count is rejected', code: `// @ts-expect-error\nrepeat('ab', '2');`, cat: 'basic' },
      { label: 'Leaving out the count is rejected', code: `// @ts-expect-error\nrepeat('ab');`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'text-is-number',
        'ts-mismatch',
        'The text parameter is typed as a number',
        'A number has no repeat method, and the call with a string is rejected.',
        'The first parameter is the text to repeat, so it is a string.',
        ['What does the function do with `text`?', 'Which type has a `repeat` method?'],
        `function repeat(text: number, times: number): string {
  return text.repeat(times);
}`,
      ),
      v(
        'uses-any',
        'ts-any',
        'Uses any instead of real types',
        'With any, nothing is ever rejected, so the checks that expect an error fail.',
        'Give text the type string and times the type number.',
        ['What kinds of value should be allowed for each parameter?'],
        `function repeat(text: any, times: any): string {
  return text.repeat(times);
}`,
      ),
      v(
        'only-text',
        'ts-implicit-any',
        'Only the first parameter has a type',
        'The count has no type, so strict mode reports an implicit any on it and nothing stops a string being passed.',
        'Annotate times as well.',
        ['Which parameter is still unannotated?'],
        `function repeat(text: string, times): string {
  return text.repeat(times);
}`,
      ),
    ],
  },
];
