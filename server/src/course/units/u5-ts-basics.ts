import type { Unit } from '../types.js';
import { U5_BONUS, U5_EXAM } from './u5-exam.js';
import { TS_FUNCTIONS, TS_NARROWING, TS_PRIMITIVES } from './u5-lessons.js';

export const TS_BASICS: Unit = {
  id: 'ts-basics',
  track: 'ts',
  title: 'TypeScript basics',
  blurb: 'Add types to the JavaScript you already know and let the compiler check them.',
  lessons: [
    {
      id: 'ts-intro',
      title: 'Your first types',
      summary: 'Annotate variables and functions, and learn to read a type error.',
      minutes: 12,
      objectives: [
        'Explain what TypeScript adds to JavaScript',
        'Annotate variables, parameters and return values',
        'Read a type error and find the line it points at',
        'Know that types disappear before the code runs',
      ],
      sections: [
        {
          heading: 'JavaScript plus types',
          body: [
            'TypeScript is JavaScript with types added. A type says what kind of value a name holds. The TypeScript compiler checks your code against those types and reports mistakes before anything runs.',
            'You write the type after a colon. `const count: number = 3` says count holds a number.',
          ],
          examples: [
            {
              id: 'annotate',
              lang: 'ts',
              code: `const count: number = 3;
const label: string = 'items';
const ready: boolean = true;
console.log(count, label, ready);`,
              output: ['3 items true'],
            },
          ],
        },
        {
          heading: 'Reading a type error',
          body: [
            'Break a rule and the compiler reports an error with a code like `TS2322` and a message. The line number points at the problem. The message usually reads "Type X is not assignable to type Y": you tried to put an X where a Y is expected.',
          ],
          examples: [
            {
              id: 'mismatch',
              lang: 'ts',
              code: `let age: number = 30;
age = 'thirty';
console.log(age);`,
              output: ['thirty'],
              errors: [{ code: 2322, line: 2 }],
              caption: 'Line 2 is the error. The code still runs here, because types are removed first.',
            },
          ],
          notes: [
            { kind: 'in-ts', text: 'In a real project the compiler stops you before you ship. In this course the code still runs so you can see what would have happened.' },
          ],
        },
        {
          heading: 'Typing functions',
          body: [
            'Annotate each parameter, and optionally the return value after the parentheses. Parameters are where types matter most: they are the boundary between your function and everything that calls it.',
            'Calling the function with the wrong type is an error on the call, not inside the function.',
          ],
          examples: [
            {
              id: 'fn',
              lang: 'ts',
              code: `function area(width: number, height: number): number {
  return width * height;
}
console.log(area(3, 4));`,
              output: ['12'],
            },
            {
              id: 'fn-bad-call',
              lang: 'ts',
              code: `function area(width: number, height: number): number {
  return width * height;
}
console.log(area(3, '4'));`,
              output: ['12'],
              errors: [{ code: 2345, line: 4 }],
              caption: 'JavaScript multiplies "4" into a number anyway. TypeScript still calls it out.',
            },
          ],
        },
        {
          heading: 'You often do not need to write the type',
          body: [
            'TypeScript infers a type from the value you give. `const n = 5` is already a number. Annotate where inference cannot help: function parameters, and values that start empty.',
            'Inference also means the compiler knows which methods exist. A number has no `toUpperCase`.',
          ],
          examples: [
            {
              id: 'infer',
              lang: 'ts',
              code: `const n = 5;
console.log(n.toUpperCase());`,
              runtimeError: 'TypeError: n.toUpperCase is not a function',
              errors: [{ code: 2339, line: 2 }],
              caption: 'The compiler found this crash before the code ran.',
            },
          ],
          notes: [{ kind: 'tip', text: 'Hover over a name in your editor to see the type TypeScript worked out.' }],
        },
        {
          heading: 'Types vanish at runtime',
          body: [
            'When the code runs, every type annotation is gone. The program is plain JavaScript. That is why `typeof` and `if` checks still matter: types only help you while you write.',
          ],
        },
      ],
      recap: [
        'TypeScript is JavaScript with types, checked before the code runs.',
        'Write a type after a colon: `const n: number`, `(name: string): string`.',
        'A type error has a code, a line and a message like "Type X is not assignable to type Y".',
        'Inference fills in types from values, so annotate parameters and leave the rest.',
        'Types are removed before running, so they do not change how the program behaves.',
      ],
      checks: [
        {
          id: 'ts-intro.c1',
          kind: 'mcq',
          prompt: 'Which line is the type error?',
          code: { lang: 'ts', text: `const a: number = 1;\nconst b: string = 2;\nconst c: boolean = false;` },
          options: ['Line 1', 'Line 2', 'Line 3', 'There is no error'],
          answer: 1,
          explanation: 'Line 2 puts the number 2 where a string is expected. Lines 1 and 3 match their annotations.',
          review: 'ts-intro',
          verify: { kind: 'ts-error', line: 2, code: 2322 },
        },
        {
          id: 'ts-intro.c2',
          kind: 'mcq',
          prompt: 'What happens to the type annotations when the program runs?',
          options: ['They are checked again', 'They are removed', 'They slow it down', 'They become comments in the output'],
          answer: 1,
          explanation: 'Types exist only for the compiler. The code that runs is plain JavaScript without them.',
          review: 'ts-intro',
        },
        {
          id: 'ts-intro.c3',
          kind: 'short',
          prompt: 'What type does TypeScript infer for `total`? Type it as written in the code.',
          code: { lang: 'ts', text: `const total = 10 * 3;` },
          accept: ['number'],
          explanation: 'Multiplying numbers gives a number, and `const total` keeps that type.',
          review: 'ts-intro',
        },
      ],
      exercises: ['ex-ts-intro-run', 'ex-ts-intro-types'],
    },
    TS_PRIMITIVES,
    TS_FUNCTIONS,
    TS_NARROWING,
  ],
  exam: U5_EXAM,
  bonus: U5_BONUS,
};
