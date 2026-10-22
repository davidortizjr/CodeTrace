import type { Unit } from '../types.js';
import { TS_GENERIC_TYPES, TS_MAPPED_CONDITIONAL, TS_TYPE_GUARDS } from './u7-lessons.js';
import { U7_BONUS, U7_EXAM } from './u7-exam.js';

export const TS_GENERICS: Unit = {
  id: 'ts-generics',
  track: 'ts',
  title: 'Generics and advanced types',
  blurb: 'Write types that work for many types, and compute new types from old ones.',
  lessons: [
    {
      id: 'ts-generic-functions',
      title: 'Generic functions',
      summary: 'Write one function that works for any type and still keeps the types straight.',
      minutes: 14,
      objectives: [
        'Explain why a type parameter beats copying a function or using any',
        'Write a function with one or several type parameters',
        'Predict what TypeScript infers for T, and pass a type argument when it cannot',
        'Recognise Array<T>, Map<K, V> and Promise<T> as generic types you already use',
      ],
      sections: [
        {
          heading: 'One function, many types',
          body: [
            'Some functions do not care what is inside the values they handle. Taking the first item of a list works the same for names, prices and users. You could write `firstName` and `firstPrice` and every other copy, but that is a lot of repeating.',
            'The quick fix is `any`, and it does run. But `any` forgets what you put in, so the compiler can no longer help with what comes out.',
          ],
          examples: [
            {
              id: 'any-forgets',
              lang: 'ts',
              code: `function firstItem(items: any[]): any {
  return items[0];
}
const name = firstItem(['Ada', 'Grace']);
console.log(name.toUpperCase());
const count = firstItem([10, 20]);
console.log(count.toUpperCase());`,
              output: ['ADA'],
              runtimeError: 'TypeError: count.toUpperCase is not a function',
              caption: 'The compiler said nothing about the crash on the last line, because the result is any.',
            },
          ],
          notes: [{ kind: 'watch-out', text: '`any` does not make a function flexible, it makes it unchecked. A generic function is flexible and checked.' }],
        },
        {
          heading: 'A type parameter',
          body: [
            'A generic function declares a **type parameter** in angle brackets after its name. By habit it is called `T`, for type. `T` is a placeholder: each call fills it in with a real type.',
            'Using the same `T` for the parameter and the result links them. Whatever type goes in is the type that comes out.',
          ],
          examples: [
            {
              id: 'identity',
              lang: 'ts',
              code: `function identity<T>(value: T): T {
  return value;
}
console.log(identity(5), identity('hi'), identity(true));`,
              output: ['5 hi true'],
              caption: 'One function, three calls. T is number, then string, then boolean.',
            },
            {
              id: 'identity-linked',
              lang: 'ts',
              code: `function identity<T>(value: T): T {
  return value;
}
const word = identity('hello');
console.log(word.toUpperCase());
console.log(word.toFixed(2));`,
              output: ['HELLO'],
              runtimeError: 'TypeError: word.toFixed is not a function',
              errors: [{ code: 2551, line: 6 }],
              caption: 'word is a string, so the compiler catches the crash that any would have hidden.',
            },
          ],
        },
        {
          heading: 'Inference and explicit type arguments',
          body: [
            'You almost never write the type yourself. TypeScript works out `T` from the arguments you pass. In `identity(5)` it sees a number and sets `T` to number.',
            'You can still give the type argument by hand, in angle brackets before the parentheses. It is a promise the compiler then checks. It is needed when nothing in the call tells TypeScript what `T` is, such as a function that takes no arguments.',
          ],
          examples: [
            {
              id: 'explicit',
              lang: 'ts',
              code: `function identity<T>(value: T): T {
  return value;
}
const a = identity<number>(42);
const b = identity<string>(42);
console.log(a, b);`,
              output: ['42 42'],
              errors: [{ code: 2345, line: 5 }],
              caption: 'Line 5 asks for T = string and then passes a number.',
            },
            {
              id: 'empty-list',
              lang: 'ts',
              code: `function emptyList<T>(): T[] {
  return [];
}
const tags = emptyList<string>();
tags.push('ts');
console.log(tags[0].toUpperCase());
const mystery = emptyList();
mystery.push('ts');
console.log(mystery[0].toUpperCase());`,
              output: ['TS', 'TS'],
              errors: [{ code: 2571, line: 9 }],
              caption: 'With no argument to learn from, T falls back to unknown. Passing <string> fixes it.',
            },
          ],
        },
        {
          heading: 'Helpers with lists and several type parameters',
          body: [
            'A type parameter can sit inside another type. `first<T>(items: T[]): T | undefined` takes a list of anything and returns one item of that same type, or `undefined` if the list is empty. For a list of strings it returns `string | undefined`.',
            'When values of different types are involved, give each its own name: `A` and `B`, or `T` and `U`. In `mapItems<T, U>` the callback turns a `T` into a `U`, and the result is a list of `U`.',
          ],
          examples: [
            {
              id: 'first',
              lang: 'ts',
              code: `function first<T>(items: T[]): T | undefined {
  return items[0];
}
const scores = [90, 85];
const top = first(scores);
console.log(top.toFixed(1));
console.log(first(['Ada', 'Grace']), first([]));`,
              output: ['90.0', 'Ada undefined'],
              errors: [{ code: 18048, line: 6 }],
              caption: 'top is number | undefined, so the compiler makes you handle the empty list.',
            },
            {
              id: 'pair-map',
              lang: 'ts',
              code: `function pair<A, B>(left: A, right: B): [A, B] {
  return [left, right];
}
function mapItems<T, U>(items: T[], transform: (item: T) => U): U[] {
  const result: U[] = [];
  for (const item of items) result.push(transform(item));
  return result;
}
const entry = pair('age', 36);
const lengths = mapItems(['tea', 'coffee'], (name) => name.length);
console.log(entry, lengths);`,
              output: ["[ 'age', 36 ] [ 3, 6 ]"],
              caption: 'entry is [string, number]. lengths is number[], because the callback returns numbers.',
            },
          ],
        },
        {
          heading: 'Generics you already use',
          body: [
            'You have been using generics since the first lesson on arrays. `string[]` is short for `Array<string>`. A `Map` needs two type arguments, the key type and the value type: `Map<string, number>`. A promise remembers what it will deliver: `Promise<number>`.',
            'These are the same idea as `T`: one definition, and the type argument says what it holds. That is why `names.push(5)` is an error when `names` is a list of strings.',
          ],
          examples: [
            {
              id: 'builtin',
              lang: 'ts',
              code: `const names: Array<string> = ['Ada'];
const ages = new Map<string, number>();
ages.set('Ada', 36);
const later: Promise<number> = Promise.resolve(7);
later.then((n) => console.log('later', n));
console.log(names.length, ages.get('Ada'));
names.push(5);`,
              output: ['1 36', 'later 7'],
              errors: [{ code: 2345, line: 7 }],
            },
          ],
        },
        {
          heading: 'Inside the function, T is a mystery',
          body: [
            'The caller picks `T`, so inside the function you know nothing about it. It could be a number, a string or an object. That is why you cannot ask for `.length` on a plain `T`. Only things that every type has are allowed.',
            'The next lesson shows how to say "T must have a length" with a constraint. Until then, generic functions simply move values around and hand them back.',
          ],
          examples: [
            {
              id: 'unknown-t',
              lang: 'ts',
              code: `function lengthOf<T>(value: T): number {
  return value.length;
}
console.log(lengthOf('abc'));`,
              output: ['3'],
              errors: [{ code: 2339, line: 2 }],
              caption: 'It works for a string, but the compiler has to be sure for every possible T.',
            },
          ],
        },
      ],
      recap: [
        '`any` hides types. A type parameter such as `<T>` keeps them: what goes in is what comes out.',
        'Write `function name<T>(value: T): T`. TypeScript infers `T` from the arguments of each call.',
        'Give a type argument by hand with `name<string>(...)` when nothing in the call tells TypeScript the type.',
        'Use one letter per type that can differ, such as `<A, B>` or `<T, U>`.',
        '`Array<T>`, `Map<K, V>` and `Promise<T>` are generic types. The argument says what they hold.',
        'Inside a generic function `T` could be anything, so you cannot use properties on it yet.',
      ],
      checks: [
        {
          id: 'ts-generic-functions.c1',
          kind: 'mcq',
          prompt: 'Which line is the type error?',
          code: {
            lang: 'ts',
            text: `function pair<A, B>(left: A, right: B): [A, B] { return [left, right]; }
const p = pair('age', 36);
const label: string = p[0];
const years: string = p[1];`,
          },
          options: ['Line 2', 'Line 3', 'Line 4', 'There is no error'],
          answer: 2,
          explanation: 'p is [string, number]. Line 3 reads the string, but line 4 puts the number p[1] into a string variable.',
          review: 'ts-generic-functions',
          verify: { kind: 'ts-error', line: 4, code: 2322 },
        },
        {
          id: 'ts-generic-functions.c2',
          kind: 'short',
          prompt: 'What does this print?',
          code: {
            lang: 'ts',
            text: `function twice<T>(value: T): T[] {
  return [value, value];
}
const echo = twice('ho');
console.log(echo.join('-'));`,
          },
          accept: ['ho-ho'],
          explanation: 'T is string, so `twice` returns the list `["ho", "ho"]`, and join puts a dash between the two items.',
          review: 'ts-generic-functions',
          verify: { kind: 'output' },
        },
        {
          id: 'ts-generic-functions.c3',
          kind: 'mcq',
          prompt: 'In `function last<T>(items: T[]): T | undefined`, what is `T`?',
          options: [
            'A value the caller passes in',
            'A placeholder for a type, filled in on each call',
            'A class that must be declared elsewhere',
            'Always the type unknown',
          ],
          answer: 1,
          explanation: '`T` is a type parameter. Each call fills it in, usually by inference from the arguments, so one definition works for many types.',
          review: 'ts-generic-functions',
        },
      ],
      exercises: ['ex-ts-generic-functions-run', 'ex-ts-generic-functions-types'],
    },
    TS_GENERIC_TYPES,
    TS_MAPPED_CONDITIONAL,
    TS_TYPE_GUARDS,
  ],
  exam: U7_EXAM,
  bonus: U7_BONUS,
};
