# CodeTrace: Show me how you got there

A practice site for programming students, built on the same idea as LabMath. It checks the **whole solution**, finds the **exact step** where it went wrong, names the **kind of mistake** and explains why.

> You're close. Here's the part that needs fixing.

Stack: **React + TypeScript + Vite + Tailwind** (client), **Express + TypeScript** (server), **Supabase** (auth and database), **Google Gemini** (optional AI layer).

```
codetrace/
├── client/   React frontend (Vite, Tailwind, CodeMirror)
└── server/   Express backend (checker engine, API, Supabase, Gemini)
```

## Run it

```bash
npm install
npm run dev          # client http://localhost:5173, API http://localhost:8787
npm test             # 119 engine checks
npm run build && npm start   # production: the server also serves client/dist
```

No keys needed. Open the site and choose **Try the demo as Sam Reyes** on the login page.

### Turn on accounts (Supabase)

1. Create a project at supabase.com and run `server/supabase/schema.sql` in the SQL editor.
2. `cp server/.env.example server/.env` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (secret, server only).
3. `cp client/.env.example client/.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (safe in the browser).

The browser signs in with Supabase Auth and sends its access token to the API. The server verifies every token with Supabase and filters all data by the verified user id. Attempts are stored in the `attempts` table with row-level security on.

### Turn on the AI layer (Gemini)

Get a free key at <https://aistudio.google.com/apikey>, then set `GEMINI_API_KEY` in `server/.env`. It enables:

- **Explanations** at three depths (quick, standard, deep) written from the checker's findings
- **Coach chat** that guides with questions instead of giving the answer
- **Photo to code**: read handwritten or printed code from a picture

The model defaults to `gemini-3.5-flash` and falls back to `gemini-3.5-flash-lite`. Change them with `GEMINI_MODEL` and `GEMINI_FALLBACK_MODEL`. Without a key, or if a request fails or is rate limited, every screen still works using wording built directly from the checker's report.

Privacy: on Google's free tier, submitted content may be used to improve their products. Consider a paid key for real students.

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
- `server/src/problems/bank.ts` 18 problems in 6 topics, each with a reference, tests and known mistakes
- `server/src/ai/` Gemini client, prompts, offline wording
- `server/src/store/` Supabase store, in-memory store, demo seed data
- `server/src/routes/api.ts` the REST API; `server/src/auth.ts` token verification
- `server/supabase/schema.sql` the database table and policies
- `client/src/pages/` dashboard, practice, problem, skill map, mistakes, drill, coach, login
- `client/src/components/` editor, result panel, charts, shell

### Adding a problem

Add an entry to `server/src/problems/bank.ts` with a `reference`, `tests`, a `traceArgs` input, the variables to `track`, and `variants` (known wrong solutions). `npm test` then verifies the reference passes, the starter does not, and that every variant is recognised as itself.

## Known limits

- The sandbox is a practice-tool sandbox, not a security boundary. If you deploy publicly, run the server in a container with no secrets in its environment.
- The demo account lives in server memory and resets when the server restarts.
- Only JavaScript is supported for now.
- A practice tool for learning, not an assessment or proctoring system.
