import type { Guide } from '../types';

export const crud: Guide = {
  slug: 'build-a-crud-api',
  title: 'Build a REST API with Express and SQL',
  summary: 'Create, read, update and delete tasks, using parameterized queries so user input can never become SQL.',
  level: 'Beginner',
  minutes: 20,
  tags: ['express', 'rest', 'sql', 'security'],
  goal: 'Four working endpoints for tasks that you can call with curl.',
  youNeed: ['Guide 5 done: the `tasks` table exists.'],
  steps: [
    {
      id: 'router',
      title: 'Write the tasks router',
      body: [
        'Create `server/src/routes/tasks.js`. A `Router` is a mini app that handles one family of URLs, which keeps `index.js` short.',
        'Read each handler as three moves: take values from the request, run one SQL statement, send the result. `RETURNING` makes PostgreSQL hand back the row it just inserted or changed, so you do not need a second query.',
        'Look at how values reach SQL: always as `$1`, `$2` in the text with the real values in a separate array. Never build SQL with string concatenation.',
      ],
      blocks: [
        { lang: 'js', file: 'server/src/routes/tasks.js', ref: '06-tasks.js' },
        {
          lang: 'js',
          caption: 'Never do this: the title becomes part of the SQL.',
          code: "// If title is:  x'); DROP TABLE tasks; --\nawait query(\"INSERT INTO tasks (title) VALUES ('\" + title + \"')\");",
        },
      ],
    },
    {
      id: 'mount',
      title: 'Mount the router',
      body: ['Replace `server/src/index.js`. `app.use(\'/api/tasks\', tasksRouter)` means a route written as `/` in the router answers at `/api/tasks`, and `/:id` answers at `/api/tasks/5`.'],
      blocks: [{ lang: 'js', file: 'server/src/index.js', ref: '06-server-index.js' }],
    },
    {
      id: 'try',
      title: 'Call every endpoint',
      body: [
        'The server restarts on its own. Run these one at a time and read each response before running the next.',
        'On Windows PowerShell, `curl` is an alias for something else: type `curl.exe` instead, or use an app like Postman or Thunder Client.',
      ],
      blocks: [
        {
          lang: 'bash',
          code: 'curl http://localhost:3001/api/tasks\n\ncurl -X POST http://localhost:3001/api/tasks -H "Content-Type: application/json" -d \'{"title":"Write my first API"}\'\n\ncurl -X PATCH http://localhost:3001/api/tasks/1 -H "Content-Type: application/json" -d \'{"done":true}\'\n\ncurl -i -X DELETE http://localhost:3001/api/tasks/1',
        },
      ],
      check: 'The list shows your tasks as JSON. The POST returns the new task with status 201 and an `id`. The PATCH returns the task with `"done":true`. The DELETE returns `204 No Content`, and the task is gone from the list.',
    },
    {
      id: 'break',
      title: 'Break it on purpose',
      body: [
        'Now find what this version does not handle. Try each of these and look at the status code and the server terminal:',
        '`curl -i -X PATCH http://localhost:3001/api/tasks/abc -H "Content-Type: application/json" -d \'{"done":true}\'` gives a **500**, because PostgreSQL cannot read “abc” as an integer. A wrong id is the caller’s mistake, so it should be a 400.',
        '`curl -i -X POST http://localhost:3001/api/tasks -H "Content-Type: application/json" -d \'{}\'` gives a **500** too: the title is missing, and the database’s `NOT NULL` rule is what catches it.',
        'Both are the same weakness: nothing checks input before it reaches the database. Guide 7 fixes it.',
      ],
    },
  ],
  troubleshooting: [
    {
      problem: 'Cannot destructure property “title” of “req.body” as it is undefined',
      cause: 'The request had no JSON body, or no `Content-Type: application/json` header, so `req.body` was never filled in. In Express 5 it is `undefined` in that case.',
      fix: 'Send the header with the request, and make sure `app.use(express.json())` comes before the routes. Guide 7 also makes the route handle this case cleanly.',
    },
    {
      problem: 'Cannot GET /api/tasks',
      cause: 'The router is not mounted, or the path does not match.',
      fix: 'Check `app.use(\'/api/tasks\', tasksRouter)` is in `index.js` and the import path is `./routes/tasks.js` (with the `.js`).',
    },
    {
      problem: 'null value in column “title” violates not-null constraint',
      cause: 'The body did not contain a `title`, or the JSON key is spelled differently.',
      fix: 'Send `{"title":"..."}` exactly. Guide 7 turns this into a clear 400 message.',
    },
    {
      problem: 'Quotes break the curl command on Windows',
      cause: 'Windows shells handle single quotes differently.',
      fix: 'Use double quotes and escape the inner ones: `-d "{\\"title\\":\\"Hello\\"}"`, or use Postman.',
    },
  ],
  learned: [
    'POST creates (201), GET reads, PATCH changes part of a row, DELETE removes it (204).',
    'Parameterized queries keep user input out of the SQL text.',
    '`RETURNING` gives you the changed row without a second query.',
  ],
};
