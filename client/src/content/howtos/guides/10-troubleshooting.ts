import type { Guide } from '../types';

export const troubleshooting: Guide = {
  slug: 'find-where-it-broke',
  title: 'Find where it broke: debugging the full stack',
  summary: 'When the page is empty, test one layer at a time: database, Express, the Vite proxy, then the browser. Plus the errors every beginner hits.',
  level: 'Intermediate',
  minutes: 15,
  tags: ['debugging', 'react', 'express', 'postgresql'],
  goal: 'A repeatable way to locate a bug in any of the three layers in under five minutes.',
  youNeed: ['The Task Board from guides 2 to 9, or any React + Express + PostgreSQL app.'],
  steps: [
    {
      id: 'idea',
      title: 'Test from the bottom up',
      body: [
        'A full-stack bug always lives in one place, but the symptom shows up in another: an empty page can be a React bug, a proxy problem, a server crash or a missing table. Do not guess. Test each layer on its own, starting at the bottom, and stop at the first layer that fails. The bug is in that layer or the connection just below it.',
        'The four checks, in order: **psql** (is the data there?), **curl to Express on 3001** (does the API answer?), **curl through Vite on 5173** (does the proxy forward?), **the browser Network tab** (does React ask for the right thing?).',
      ],
    },
    {
      id: 'db',
      title: 'Layer 1: ask the database directly',
      body: ['Skip Express and React and talk to PostgreSQL. If this fails, nothing above it can work.'],
      blocks: [
        {
          lang: 'bash',
          code: 'psql "postgresql://postgres:postgres@localhost:5432/taskboard" -c "SELECT count(*) FROM tasks;"',
        },
      ],
      check: 'You get a number. If you get `connection refused`, PostgreSQL is not running. If you get `relation "tasks" does not exist`, run `npm run migrate` in `server`.',
    },
    {
      id: 'api',
      title: 'Layer 2: ask Express directly',
      body: ['Now call the API on its own port, bypassing React and the proxy. Use `-i` to see the status line and headers.'],
      blocks: [
        { lang: 'bash', code: 'curl -i http://localhost:3001/api/health' },
        { lang: 'bash', code: 'curl -i http://localhost:3001/api/tasks' },
      ],
      check: 'The first returns `200` and `{"ok":true,...}`. The second returns `200` and a JSON array. If the first works and the second returns 500, the problem is in the route or the SQL: read the terminal where Express runs, the real error is printed there.',
    },
    {
      id: 'proxy',
      title: 'Layer 3: ask through the Vite proxy',
      body: [
        'The browser never calls port 3001. It calls the Vite dev server on 5173, which forwards `/api` to Express. Test that hop with the same request on the other port.',
      ],
      blocks: [{ lang: 'bash', code: 'curl -i http://localhost:5173/api/tasks' }],
      check: 'You should get the same JSON as layer 2. If you get HTML (`<!doctype html>`), the proxy is not configured, or `vite.config.js` was edited and the dev server was not restarted.',
    },
    {
      id: 'browser',
      title: 'Layer 4: watch what the browser sends',
      body: [
        'Open DevTools, then the **Network** tab, then reload. Click the `tasks` request. Check the **Status**, the **Request URL** (is it `/api/tasks`, with no typo and no `localhost:3001`?) and the **Response** tab (is it JSON?). Then open the **Console** tab for red errors from React.',
        'If the request is fine and the response is the right JSON but the page is still empty, the bug is in how the component stores or renders it. Add `console.log(tasks)` right before the `return`.',
      ],
      check: 'You can say which of the four layers first disagrees with what you expected.',
    },
    {
      id: 'logs',
      title: 'Read the error where it was written',
      body: [
        'The browser only sees `500 Internal Server Error`. The reason is in the terminal running Express, because the error handler logs it. Keep that terminal visible while you click around the app. Most bugs are solved by reading the first line of the stack trace there.',
      ],
    },
  ],
  troubleshooting: [
    {
      problem: 'Unexpected token \'<\', "<!doctype "... is not valid JSON',
      cause: 'React asked for JSON and got an HTML page. The request never reached Express, usually because the proxy is missing, the dev server was not restarted, or the URL is missing the `/api` prefix.',
      fix: 'Run the layer 3 check. Confirm `vite.config.js` has the `/api` proxy, restart `npm run dev` in `client`, and make sure `api.js` calls `/api/tasks`.',
    },
    {
      problem: 'ECONNREFUSED 127.0.0.1:5432',
      cause: 'Nothing is listening on the PostgreSQL port: the server is stopped, or it runs on another port.',
      fix: 'Start PostgreSQL (start the Docker container, or the service). Check the port in `DATABASE_URL`.',
    },
    {
      problem: 'password authentication failed for user "postgres"',
      cause: 'The password in `DATABASE_URL` is not the one PostgreSQL was created with.',
      fix: 'Use the password you chose at install time, or the one in your `docker run` command. If it contains `@`, `:` or `/`, URL-encode it (`@` becomes `%40`).',
    },
    {
      problem: 'database "taskboard" does not exist',
      cause: 'The server is running, but you never created the database, or the name in `DATABASE_URL` is different.',
      fix: 'Run `CREATE DATABASE taskboard;` (guide 3) and check the name after the last `/` in the URL.',
    },
    {
      problem: 'relation "tasks" does not exist',
      cause: 'The database exists but the migration did not run, or it ran against a different database.',
      fix: 'Run `npm run migrate` in `server`. Check with `psql ... -c "\\dt"` that the table is in the database your app uses.',
    },
    {
      problem: 'Access to fetch ... has been blocked by CORS policy',
      cause: 'The browser called Express on another origin (for example `http://localhost:3001` from the page on 5173), and Express did not allow it.',
      fix: 'Do not call 3001 from React. Call `/api/...` and let the Vite proxy forward it: the browser then sees one origin and CORS never applies. The `cors` package is only needed if you really host the API on another domain.',
    },
    {
      problem: 'req.body is undefined, or the new task has no title',
      cause: '`express.json()` is missing or registered after the routes, or the client forgot the `Content-Type: application/json` header.',
      fix: 'Add `app.use(express.json())` before `app.use(\'/api/tasks\', ...)`, and send the header in `fetch`.',
    },
    {
      problem: 'node: --env-file= is not allowed in NODE_OPTIONS, or "bad option: --env-file"',
      cause: 'Your Node.js is older than 20.6, which added the `--env-file` flag.',
      fix: 'Run `node --version` and update Node to 20.6 or newer (22 LTS or newer is a good choice).',
    },
    {
      problem: 'The server connects locally but fails on a hosted database with an SSL error',
      cause: 'Hosted PostgreSQL providers usually require an encrypted connection, which your local one does not.',
      fix: 'Use the connection string exactly as the provider gives it. Many include `?sslmode=require` already. If yours does not and the provider requires SSL, check their docs for the right `pg` setting rather than disabling certificate checks.',
    },
    {
      problem: 'Too many re-renders, or the request fires again and again',
      cause: 'A `fetch` or `setState` runs in the body of the component, or the `useEffect` dependency array is missing, so every render triggers another.',
      fix: 'Put the fetch inside `useEffect(() => { ... }, [])`. The empty array means: run once, after the first render.',
    },
    {
      problem: 'Warning: Each child in a list should have a unique "key" prop',
      cause: 'React needs a stable identity for each list item to update the right one.',
      fix: 'Use the database id: `<li key={task.id}>`. Do not use the array index if items can be deleted or reordered.',
    },
    {
      problem: 'Port 3001 is already in use (EADDRINUSE)',
      cause: 'An earlier copy of the server is still running.',
      fix: 'Find the terminal where it runs and stop it with Ctrl+C. If you can not find it, change `PORT` in `server/.env` (and the proxy target in `vite.config.js`).',
    },
  ],
  learned: [
    'Bugs live in one layer: test the layers one at a time, bottom up.',
    '`psql`, `curl` and the browser Network tab are the three tools that cover the whole stack.',
    'The real error message is in the terminal where Express runs, not in the browser.',
    'The Vite proxy gives the browser one origin, which is why you do not fight CORS in development.',
  ],
};
