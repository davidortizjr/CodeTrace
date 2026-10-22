# Writing course content

The course is data. Each unit is one file in `units/` and its exercises are one file in `exercises/`.
Everything is checked by running it, so a mistake in an example or an answer shows up as a failing test.

Read these two finished lessons before you write anything. They are the style and format to copy:

- `units/u1-js-foundations.ts` lesson `js-values`, with exercise `ex-js-values` in `exercises/u1-js-foundations.ts`
- `units/u5-ts-basics.ts` lesson `ts-intro`, with exercises `ex-ts-intro-run` (run mode) and `ex-ts-intro-types` (types mode) in `exercises/u5-ts-basics.ts`

The data shapes are in `types.ts` (course) and `../problems/types.ts` (exercises).

## Course plan (lesson ids are fixed, other units link to them)

| Unit | Lessons |
| --- | --- |
| `js-foundations` | `js-values`, `js-operators`, `js-functions`, `js-strings` |
| `js-flow` | `js-conditionals`, `js-loops`, `js-scope`, `js-errors` |
| `js-data` | `js-arrays`, `js-array-methods`, `js-objects`, `js-maps-sets` |
| `js-modern` | `js-destructuring`, `js-classes`, `js-modules`, `js-async` |
| `ts-basics` | `ts-intro`, `ts-primitives`, `ts-functions`, `ts-narrowing` |
| `ts-shapes` | `ts-objects`, `ts-unions`, `ts-classes`, `ts-utility` |
| `ts-generics` | `ts-generic-functions`, `ts-generic-types`, `ts-mapped-conditional`, `ts-type-guards` |
| `ts-real` | `ts-tsconfig`, `ts-null-errors`, `ts-async-data`, `ts-modules` |

A lesson id is also the prefix of its quiz ids and its exercise ids (`ex-<lesson-id>`, with a suffix such as `-run` or `-types` when a lesson has two; see the two examples).
The learner reads the units in this order and has seen all earlier lessons, so you may rely on earlier lessons but never on later ones.

## What each piece needs

**Lesson** (about 10 to 15 minutes of reading)
- 4 to 6 sections. Each has a heading, 1 to 3 short paragraphs in `body`, and usually 1 to 3 runnable `examples`.
- 2 to 5 `objectives`, 4 to 6 `recap` lines, `minutes` between 8 and 20.
- Teach one idea at a time. Show the code, then say what it does and why. Mention the common mistake once, in a `watch-out` note.
- JavaScript lessons teach syntax and behaviour. TypeScript lessons assume JavaScript is known.
- Plain, friendly, concrete. Real names for things (`price`, `users`, `isReady`), no `foo`/`bar`. No em dashes anywhere (use a comma, colon or full stop).
- In `body` text, `` `code` `` and `**bold**` are rendered. Nothing else is (no lists, no links, no headings).

**Examples** (the part that must be exactly right)
- Every `js` and `ts` example is executed by the course test. `output` must list every line it prints (use `console.log`). If it prints nothing, leave `output` out.
- An example that deliberately fails sets `runtimeError: 'Name: message'` (a substring is enough). The output printed before the error still goes in `output`.
- A TypeScript example is type-checked in strict mode. If it is meant to show a compiler error, list them as `errors: [{ code, line }]` (the real TS error code and the 1-based line). Absent means it must compile with no errors.
- Fragments that cannot run (imports, `tsconfig.json`, shell commands, JSON) use `lang: 'json' | 'bash' | 'text'`, or `lang: 'js' | 'ts'` with `run: false`. Use `file: 'tsconfig.json'` to label them. A runnable example has no imports, no `require`, no network, no files, no DOM.
- Available when running: `console.log/error/warn/info/table`, `setTimeout`/`clearTimeout` (timers are virtual, they fire instantly in order), promises and `async`/`await`, all standard JavaScript built-ins. Not available: `process`, `require`, `fetch`, `document`.
- What runs must match real Node's `console.log` output. The test compares against real Node for every example that does not use timers.
- TypeScript: the checker is TypeScript 6 strict, target ES2022, with `lib.es2023` and no DOM and no Node types.
- If you are unsure what something prints, run it: `npm run try -- file.ts` or `echo "code" | npm run try -- --ts`.

**Checks** (`checks`: exactly 3 per lesson, quick "did it land" questions)
- Mix of `mcq` and `short`. ids are `<lesson-id>.c1` to `.c3`. Set `review` to the lesson id.
- Prefer questions about code: "what does this print", "which line is the error". Add `verify` whenever the answer can be proven by running the `code`:
  - `{ kind: 'output' }` the code's printed lines joined by a space equal the right answer (and no wrong option equals it)
  - `{ kind: 'compiles' }`, `{ kind: 'ts-error', line, code? }` for TypeScript, `{ kind: 'throws', message }`
- `short` answers: list every sensible spelling in `accept` (compared after trimming, collapsing spaces and dropping a trailing `;`). Ask for something with exactly one right answer, like a printed value or a single keyword.
- `mcq` has 3 to 5 distinct options, one correct. The `answer` is the index. Vary which index is correct.
- `explanation` says why the right answer is right, in one or two sentences. Never "because it is correct".

**Exercises** (1 or 2 per lesson, in the unit's exercise file)
- A `Problem`. Set `topic` to the unit id, `lesson` to the lesson id, and for TypeScript `lang: 'ts'`. List the id in the lesson's `exercises`. Exercise ids start with `ex-`.
- `run` mode (default): the learner writes a function named `fn`. `tests` has 5 to 8 cases (JSON arguments only, so no functions, `undefined`, `NaN`, `Infinity`, Maps or Sets as arguments). Mark each `basic`, `edge` or `large`. The expected answer is whatever `reference` returns. A function that returns `undefined`, `NaN` and so on is fine, but arguments must be JSON.
- `types` mode (TypeScript, `mode: 'types'`): the compiler is the test. `typeChecks` are snippets appended to the learner's code inside `{ }` blocks. Use `// @ts-expect-error` on the line before a call that must be rejected (if TypeScript does not reject it, that is an error, which is how "too loose" is detected). Provide `tests: []`, `traceArgs: []`, `track: []` and a `fn` (the main name in the exercise).
- Exercises that need a runtime behaviour in a TypeScript lesson can use `lang: 'ts'` in run mode (types are checked in strict mode first, then the code runs).
- `starter` must NOT pass. It should leave the learner a clear job, with a comment that says what to do. `reference` must pass everything with no TypeScript errors and no `any`.
- `track`: names of variables inside the reference function whose history should be compared with the learner's (for loops and accumulators). Use `[]` when there is no useful variable history. When non-empty each tracked variable must change value at least twice during the `traceArgs` run.
- `variants`: 3 or 4 known wrong solutions per exercise. Each is a complete function a real beginner would write. Fields: `id`, `type` (an error type id from `engine/errors.ts`), `label` (what is wrong, shown to the learner), `why`, `fix` (a hint, not the answer's code), `ask` (1 or 2 Socratic questions), `code`.
  - Every variant must fail at least one test and must behave differently from every other variant on the tests (the bank test checks that they are distinguishable, and that each is recognised as itself).
  - In TypeScript exercises, a variant's type errors are part of its fingerprint, so a variant with a type error behaves differently from one without.
  - Do not write a variant that merely has a syntax error.
- Difficulty 1 for the first exercise of a lesson, 2 for harder ones. Prompts say exactly what the function is called, what it takes and what it returns, with one example. Tell the learner about edge cases that the tests cover.
- Exercises must be about the lesson's idea. A learner who has read the lesson can solve it.

**Unit exam** (`exam`: exactly 8 questions) and **bonus** (`bonus`: exactly 4, harder, they appear only in the final exam)
- Ids `<unit-id>.e1` to `.e8` and `<unit-id>.b1` to `.b4`.
- Cover every lesson in the unit, in roughly equal weight. At least 5 of the 8 exam questions are about code. Use `short` for 2 or 3 of the 8. Do not repeat a lesson check; ask the same idea with different code.
- Set `review` to the lesson that teaches it, so a missed question links back.
- Distribute the correct `answer` indexes (at least three different positions across the exam's mcq items).
- Bonus questions can combine ideas from two lessons in the unit.
- Use `verify` as above wherever it applies.

## Checking your work

```
npx vitest run tests/course.test.ts -t "<unit-id or lesson-id>"   # structure, examples, quiz answers
npx vitest run tests/bank.test.ts -t "<exercise-id>"              # exercises and their wrong-answer variants
npx tsc --noEmit -p .                                              # the files type-check
npm run try -- some-file.js                                        # see what code prints
```

Run the whole thing for your unit before you report back. Only edit your own unit's files (`units/uN-*.ts` and `exercises/uN-*.ts`).
Do not change `types.ts`, the engine, tests, or other units. If something in the format blocks you, say so in your report instead of working around it.
