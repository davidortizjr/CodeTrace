# CodeTrace: Show me how you got there

A JavaScript and TypeScript course with practice, built on the same idea as LabMath. It checks the **whole solution**, finds the **exact step** where it went wrong, names the **kind of mistake** and explains why.

> You're close. Here's the part that needs fixing.

Stack: **React + TypeScript + Vite + Tailwind** (client), **Express + TypeScript** (server), **Supabase** (auth and database), **Google Gemini** (optional AI layer).

```
codetrace/
├── client/   React frontend (Vite, Tailwind, CodeMirror)
├── server/   Express backend (checker engine, API, Supabase, Gemini)
└── tools/    howto-check: builds the how-to guides' app and tests it
```

## Run it

```bash
npm install
npm run dev          # client http://localhost:5173, API http://localhost:8787
npm test             # ~1000 checks: engine, every course example, every quiz answer, every exercise
npm run build && npm start   # production: the server also serves client/dist
```

No keys needed. Open the site and choose **Try the demo as Sam Reyes** on the login page.

To see what a piece of code prints (or what TypeScript says about it): `npm run try -- file.js`, `npm run try -- file.ts`, or `echo "console.log(1+1)" | npm run try -- --ts`.

### Turn on accounts (Supabase)

1. Create a project at supabase.com and run `server/supabase/schema.sql` in the SQL editor.
2. `cp server/.env.example server/.env` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (secret, server only).
3. `cp client/.env.example client/.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (safe in the browser).

The browser signs in with Supabase Auth and sends its access token to the API. The server verifies every token with Supabase and filters all data by the verified user id. Attempts are stored in the `attempts` table and quiz and exam scores in `quiz_results`, both with row-level security on. If you set Supabase up earlier, run `server/supabase/schema.sql` again to add `quiz_results`.

### Turn on the AI layer (Gemini)

Get a free key at <https://aistudio.google.com/apikey>, then set `GEMINI_API_KEY` in `server/.env`. It enables:

- **Explanations** at three depths (quick, standard, deep) written from the checker's findings
- **Coach chat** that guides with questions instead of giving the answer
- **Photo to code**: read handwritten or printed code from a picture

The model defaults to `gemini-3.5-flash` and falls back to `gemini-3.5-flash-lite`. Change them with `GEMINI_MODEL` and `GEMINI_FALLBACK_MODEL`. Without a key, or if a request fails or is rate limited, every screen still works using wording built directly from the checker's report.

Privacy: on Google's free tier, submitted content may be used to improve their products. Consider a paid key for real students.

## The course: JavaScript, then TypeScript

Open **Course** in the sidebar. Two tracks, four units each, four lessons per unit (32 lessons):

| Track | Units |
| --- | --- |
| JavaScript | Foundations, Control flow, Arrays and objects, Modern JavaScript |
| TypeScript | TypeScript basics, Object shapes and unions, Generics, TypeScript in real projects |

Each lesson has runnable examples (Run, Edit, Reset; TypeScript examples show the real compiler errors), a recap, and three ways to check yourself:

- **Check yourself:** 3 quick questions per lesson, with an explanation for every answer.
- **Exercises:** 1 or 2 per lesson. CodeTrace runs your code, shows the exact step that went wrong and names the mistake. TypeScript exercises are judged by the real strict TypeScript compiler: a "types" exercise has no code to run, and the compiler is the test.
- **Unit exam:** 8 questions, 70% to pass. Questions you miss link back to the lesson that teaches them.
- **Final exam** per track: 20 questions drawn at random from the unit exams and a bonus set (harder questions that only appear here). Available after you have tried each unit exam.

Why this order: the short check right after a lesson catches a misunderstanding while it is fresh, the exercise makes you write the syntax yourself, and the exam later makes you retrieve it again after some time. Answers are graded on the server, so the browser never receives them in advance.

Every example output and every quiz answer in the course is proven by the test suite (examples are run, and compared with real Node for the ones that do not use timers), so a lesson that says a line prints `23` really prints `23`. See `server/src/course/README.md` for how to write a lesson.

## Projects: React + Express + PostgreSQL

Optional full-stack guides, for when you want to use JavaScript in an app. Open **Projects** in the sidebar. Eleven guides build one app, a Task Board, from an empty folder to a production build:

1. How a request travels from React to PostgreSQL (the map)
2. Set up a React and Express project
3. Set up a PostgreSQL database
4. Connect Express to PostgreSQL with `pg`
5. Create a table and run a migration
6. Build a REST API with Express and SQL
7. Validate input and handle errors
8. Show database data in React
9. Add, tick off and delete tasks from React
10. Find where it broke: debugging the full stack
11. Build for production and deploy

Each guide has numbered steps with copy-ready code, a "check it works" note, a troubleshooting list of real error messages, and a "what you learned" summary. Step progress is saved in the browser (`localStorage`).

The guide text lives in `client/src/content/howtos/guides/`, and every code block is a real file in `client/src/content/howtos/code/`, so the code on screen is the code that was tested.

### Check that the guides really work

```bash
cd tools/howto-check
npm install
npm run verify
```

The verifier follows the guides in order in a temporary folder: it runs the commands, writes the files, creates the table, starts Express and Vite, calls every endpoint, drives the finished page in a browser (add, tick, delete, reload), and checks the production build served by Express. It runs on Windows, macOS and Linux.

It needs Node 20.6+, a running PostgreSQL, and a browser:

- **PostgreSQL:** it connects with `HOWTO_ADMIN_URL` (default `postgresql://postgres:postgres@localhost:5432/postgres`) and creates and drops a database called `taskboard`. If your password differs, set the variable, for example in PowerShell `$env:HOWTO_ADMIN_URL="postgresql://postgres:YOURPASS@localhost:5432/postgres"`. You do not need `psql`.
- **Browser:** Playwright's Chromium, then installed Chrome, then Edge. Run `npx playwright-core install chromium` once, or set `CHROMIUM_PATH`.

Run it again after editing a guide or its code.

## The one rule: the model never judges the code

| Layer | Does | Where |
| --- | --- | --- |
| Deterministic engine | runs the code, compares against a reference, traces variables, finds the first wrong step, classifies the mistake, scores skills, plans what to practise next | `server/src/engine/` |
| AI (optional) | words the explanation, coaches with questions, reads handwriting | `server/src/ai/` |

Every verdict, test result, score and mistake type comes from the engine. The AI only receives what the engine decided, and its prompts forbid it from re-judging the code or writing the full solution.

### How the checker works

1. **Sandbox.** Student code runs in a worker thread inside a fresh `vm` context with hard time limits, so infinite loops and crashes are caught. Only plain strings cross the boundary.
2. **Tests.** Each problem has typical, edge-case and large inputs. Expected outputs come from a reference solution run in the same sandbox, and mutating the input counts as a failure when the problem forbids it.
3. **Trace.** The student's function is rewritten with `acorn` so every statement records its variables. The same is done to the reference solution on one input.
4. **First wrong step.** The student's value history for each variable is aligned with the reference's (by name, by shared history, or by role) and the first point where they split is reported, with its line.
5. **Mistake type.** Each problem ships known wrong approaches. The engine runs them too and matches the student's behaviour test for test (`exact`), nearly (`likely`), then falls back to source patterns (`heuristic`) and failure shape (`generic`). The UI states which one it was.

## What is where

- `server/src/engine/` sandbox, instrumenter, analyser, static rules, scoring, planner, error taxonomy
- `server/src/course/` the course as data: `units/` (lessons, checks, exams), `exercises/`, and an authoring guide
- `server/src/problems/bank.ts` extra problem-solving practice, each with a reference, tests and known mistakes
- `server/src/ai/` Gemini client, prompts, offline wording
- `server/src/store/` Supabase store, in-memory store, demo seed data
- `server/src/routes/api.ts` the REST API; `server/src/auth.ts` token verification
- `server/supabase/schema.sql` the database table and policies
- `client/src/pages/` dashboard, course, lesson, quiz, exams, practice, problem, skill map, mistakes, drill, coach, projects, login
- `client/src/content/howtos/` guide text, plus the tested code files it shows
- `client/src/components/` editor, result panel, charts, shell

### Adding a lesson or an exercise

Lessons and exercises are data files, see `server/src/course/README.md`. `npm test` runs every example and checks every answer.

### Adding a problem

Add an entry to `server/src/problems/bank.ts` with a `reference`, `tests`, a `traceArgs` input, the variables to `track`, and `variants` (known wrong solutions). `npm test` then verifies the reference passes, the starter does not, and that every variant is recognised as itself.

## Known limits

- The sandbox is a practice-tool sandbox, not a security boundary. If you deploy publicly, run the server in a container with no secrets in its environment.
- The demo account lives in server memory and resets when the server restarts.
- JavaScript and TypeScript only. TypeScript is checked in strict mode with the `typescript-classic` package (TypeScript 6), because TypeScript 7 has no JavaScript API yet.
- Course examples cannot use imports, files, the network or the DOM; they run in the sandbox.
- A practice tool for learning, not an assessment or proctoring system.
