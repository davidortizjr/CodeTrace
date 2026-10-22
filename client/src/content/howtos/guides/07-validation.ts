import type { Guide } from '../types';

export const validation: Guide = {
  slug: 'validate-input-and-handle-errors',
  title: 'Validate input and handle errors',
  summary: 'Reject bad input with a clear 400 before it reaches the database, and give every error one consistent shape.',
  level: 'Intermediate',
  minutes: 15,
  tags: ['express', 'zod', 'errors', 'validation'],
  goal: 'Bad requests get a 400 with a readable message, missing tasks get a 404, and real bugs get a safe 500.',
  youNeed: ['Guide 6 done, including the “Break it on purpose” step.'],
  steps: [
    {
      id: 'install',
      title: 'Install zod',
      body: [
        '`zod` describes what valid data looks like and checks data against it. You describe the shape once and get both the check and the error messages.',
      ],
      blocks: [{ lang: 'bash', run: 'server', code: 'npm install zod' }],
    },
    {
      id: 'errors',
      title: 'Create one place for errors',
      body: [
        'Create `server/src/errors.js`. It does three things.',
        '`HttpError` lets a route say “this is a 404” by throwing. `notFound` answers when no route matched. `errorHandler` is the safety net: it turns each kind of error into a JSON response, and for anything unexpected it logs the details on the server but tells the client nothing sensitive.',
        'Express knows a function is an error handler only because it has **four** parameters. Remove `next` and it silently stops working.',
      ],
      blocks: [{ lang: 'js', file: 'server/src/errors.js', ref: '07-errors.js' }],
    },
    {
      id: 'routes',
      title: 'Validate inside the routes',
      body: [
        'Replace `server/src/routes/tasks.js`. Schemas are defined once at the top. `schema.parse(value)` returns clean data or throws a `ZodError`, which the handler above turns into a 400.',
        '`z.coerce.number()` converts the text from the URL (`"5"`) into a number, and the `.max(2147483647)` matches the largest value an `integer` column can hold, so an absurdly large id gets a 400 instead of a database error.',
        '`.trim()` removes spaces around the title before it is checked, so `"   "` counts as empty.',
      ],
      blocks: [{ lang: 'js', file: 'server/src/routes/tasks.js', ref: '07-tasks.js' }],
    },
    {
      id: 'wire',
      title: 'Register the handlers last',
      body: [
        'Replace `server/src/index.js`. Order matters: `notFound` and `errorHandler` go **after** every route, because Express tries things top to bottom and these are the “nothing else matched” and “something went wrong” cases.',
      ],
      blocks: [{ lang: 'js', file: 'server/src/index.js', ref: '07-server-index.js' }],
    },
    {
      id: 'retry',
      title: 'Run the broken requests again',
      body: ['These are the requests that gave 500 in guide 6.'],
      blocks: [
        {
          lang: 'bash',
          code: 'curl -i -X PATCH http://localhost:3001/api/tasks/abc -H "Content-Type: application/json" -d \'{"done":true}\'\n\ncurl -i -X POST http://localhost:3001/api/tasks -H "Content-Type: application/json" -d \'{}\'\n\ncurl -i -X DELETE http://localhost:3001/api/tasks/99999\n\ncurl -i http://localhost:3001/api/nothing-here',
        },
      ],
      check: 'You get 400 “Invalid input” (with a `details` list naming the field), 400 again for the missing title, 404 “Task not found”, and 404 “No route for GET /api/nothing-here”. All four are JSON.',
    },
  ],
  troubleshooting: [
    {
      problem: 'Cannot find package “zod”',
      cause: 'It was installed in the wrong folder.',
      fix: 'Run `npm install zod` inside `taskboard/server`.',
    },
    {
      problem: 'Errors still come back as an HTML page with a stack trace',
      cause: '`errorHandler` is not registered, is above the routes, or lost its fourth parameter.',
      fix: 'Check `index.js`: `app.use(errorHandler)` must be the last `app.use`, and the function signature must be `(err, req, res, next)`.',
    },
    {
      problem: 'Bad JSON in the body gives a long HTML error',
      cause: 'The JSON parser failed before any route ran.',
      fix: 'The `entity.parse.failed` branch in `errorHandler` turns it into a 400. Make sure it is present.',
    },
    {
      problem: 'A valid-looking id returns “Invalid input”',
      cause: 'The id has a decimal point, a minus sign, or is larger than the integer limit.',
      fix: 'Ids are whole positive numbers. Read the `message` in `details`: it says which rule failed.',
    },
  ],
  learned: [
    'Validate at the edge: check input before it reaches the database.',
    'One error handler gives every failure the same JSON shape, so React can show it.',
    'Use 400 for “you sent something wrong”, 404 for “that does not exist”, 500 for “we have a bug”.',
  ],
};
