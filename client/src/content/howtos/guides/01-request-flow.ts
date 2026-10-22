import type { Guide } from '../types';

export const requestFlow: Guide = {
  slug: 'how-a-request-travels',
  title: 'How a request travels from React to PostgreSQL',
  summary: 'Follow one button click through every layer, so you know where to look when something breaks.',
  level: 'Beginner',
  minutes: 5,
  tags: ['concepts', 'react', 'express', 'postgresql'],
  goal: 'You can name each layer a request passes through and say which one is to blame for a given error.',
  youNeed: ['Nothing yet. This is the map for the guides that follow.'],
  diagram: 'request-flow',
  steps: [
    {
      id: 'react',
      title: 'React sends a request',
      body: [
        "You click “Add”. An event handler runs and calls `fetch`, the browser’s built-in way to talk to a server. The address starts with `/api`, with no host name, so the browser sends it to the same place the page came from.",
        'The request carries a method (`POST` means “create something”), headers, and a body. Your data travels as JSON text.',
      ],
      blocks: [
        {
          lang: 'js',
          caption: 'Illustrative: the shape of the call you will write in guide 8.',
          code: "const res = await fetch('/api/tasks', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ title: 'Write the report' }),\n});",
        },
      ],
    },
    {
      id: 'proxy',
      title: 'Vite forwards it, in development',
      body: [
        'During development the page is served by Vite on port 5173, but your API runs on Express on port 3001. Browsers treat different ports as different origins and block most cross-origin requests (that is CORS).',
        'The fix is the Vite dev proxy. Vite sees a path starting with `/api` and passes the request to port 3001 itself. To the browser it is all one origin, so there is nothing to block. In production, Express serves the React files too, so the same trick is not needed.',
      ],
    },
    {
      id: 'express',
      title: 'Express matches a route',
      body: [
        'Express checks the method and path against the routes you registered, in order. `app.use(express.json())` turns the JSON body into `req.body`. Then the handler for `POST /api/tasks` runs.',
        'The handler is where your rules live: check the input, decide what to ask the database, decide what to send back.',
      ],
    },
    {
      id: 'pg',
      title: 'The pg pool talks to PostgreSQL',
      body: [
        'Your handler calls `pool.query` with SQL text and a list of values. The `pg` library borrows a connection from its pool, sends the query to PostgreSQL, waits for the rows, and returns the connection to the pool.',
        'Values travel separately from the SQL text (`$1`, `$2`). That keeps user input from ever being treated as SQL, which is how SQL injection is prevented.',
      ],
    },
    {
      id: 'back',
      title: 'The answer travels back',
      body: [
        'The rows become a JavaScript object, `res.json` turns it into JSON with a status code (`201` for created), and the response retraces the path. `fetch` resolves, your code calls `setTasks`, and React re-renders the list.',
      ],
    },
    {
      id: 'errors',
      title: 'Where each kind of error shows up',
      body: [
        "Knowing the layers tells you where to look. A **red line in the browser console or Network tab** is a problem on the React side or the request itself: wrong URL, CORS, a response that is not JSON.",
        'An **error in the terminal running Express** is a problem in your route or in the database call. PostgreSQL’s own message (for example `relation "tasks" does not exist`) is passed up through `pg`, so read it word for word.',
        "An error from **psql or the database logs** means the database itself is not reachable or not set up. Guide 10 turns this into a checklist you can run in two minutes.",
      ],
    },
  ],
  troubleshooting: [],
  learned: [
    'A request crosses five layers: React, the Vite proxy, Express, the pg pool, PostgreSQL.',
    'The proxy exists only in development, to avoid CORS between two ports.',
    'Each layer reports its own errors in a different place, which tells you where to start looking.',
  ],
};
