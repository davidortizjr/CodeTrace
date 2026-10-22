import type { Guide } from '../types';

export const connect: Guide = {
  slug: 'connect-express-to-postgresql',
  title: 'Connect Express to PostgreSQL with pg',
  summary: 'Create a connection pool, run your first query, and expose a health route that proves the database answers.',
  level: 'Beginner',
  minutes: 10,
  tags: ['express', 'postgresql', 'pg'],
  goal: 'A `GET /api/health/db` route that returns the database’s current time.',
  youNeed: ['Guides 2 and 3 done, with PostgreSQL running and `DATABASE_URL` set.'],
  steps: [
    {
      id: 'db',
      title: 'Create the pool',
      body: [
        'Create `server/src/db.js`. A **pool** keeps a handful of connections open and lends one to each query, which is much faster than connecting from scratch every time.',
        'The first lines fail loudly if `DATABASE_URL` is missing. A clear error at startup beats a confusing one on the first request. The `error` listener stops a dropped idle connection from crashing the whole server.',
      ],
      blocks: [{ lang: 'js', file: 'server/src/db.js', ref: '04-server-db.js' }],
    },
    {
      id: 'route',
      title: 'Add a route that uses it',
      body: [
        'Replace `server/src/index.js`. The new route asks the database for `now()`, a built-in function, which proves the whole path (Express, pg, PostgreSQL) works.',
        'Notice the handler is `async`. Express 5 passes any error from an async handler to its error handling, so a failed query returns a 500 instead of leaving the request hanging. In Express 4 you would have to catch it yourself.',
      ],
      blocks: [{ lang: 'js', file: 'server/src/index.js', ref: '04-server-index.js' }],
    },
    {
      id: 'try',
      title: 'Try it',
      body: ['With the server running, call the route from a third terminal or paste the address into your browser.'],
      blocks: [{ lang: 'bash', code: 'curl http://localhost:3001/api/health/db' }],
      check: 'The response looks like {"ok":true,"time":"2026-10-11T07:30:12.345Z"}.',
    },
  ],
  troubleshooting: [
    {
      problem: 'Error: DATABASE_URL is missing',
      cause: 'The variable is not reaching Node.',
      fix: 'Confirm `server/.env` contains `DATABASE_URL=...` with no spaces around `=`, and that you started the server from the `server` folder with `npm run dev`. Restart it after editing `.env`.',
    },
    {
      problem: 'Error: connect ECONNREFUSED 127.0.0.1:5432',
      cause: 'Nothing is listening at that address: PostgreSQL is stopped or the port is wrong.',
      fix: 'Run the `psql` test from guide 3. If psql fails too, the problem is the database, not your code.',
    },
    {
      problem: 'error: password authentication failed for user “postgres”',
      cause: 'The password in `DATABASE_URL` is wrong.',
      fix: 'Fix the URL, restart the server. Test the same URL with `psql` to confirm.',
    },
    {
      problem: 'The browser or curl hangs and never answers',
      cause: 'An older Express version does not forward errors from async handlers.',
      fix: 'Check `npm ls express` shows version 5 or newer, or wrap the handler body in `try { ... } catch (err) { next(err) }`.',
    },
  ],
  learned: [
    'A pool lends out connections instead of opening one per query.',
    '`pool.query(text, params)` returns an object whose `rows` is an array of results.',
    'A health route for the database is the fastest way to test your connection.',
  ],
};
