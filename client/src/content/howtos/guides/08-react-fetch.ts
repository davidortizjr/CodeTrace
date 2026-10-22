import type { Guide } from '../types';

export const reactFetch: Guide = {
  slug: 'show-database-data-in-react',
  title: 'Show database data in React',
  summary: 'Fetch tasks from your API, handle the loading and error states, and render the list.',
  level: 'Beginner',
  minutes: 15,
  tags: ['react', 'fetch', 'hooks'],
  goal: 'The page lists the tasks stored in PostgreSQL.',
  youNeed: ['Guide 7 done, and both dev servers running (see guide 2).'],
  steps: [
    {
      id: 'api',
      title: 'Put every API call in one file',
      body: [
        'Create `client/src/api.js`. Components should not know URLs or headers. One helper that sends the request, reads the JSON and turns failures into thrown errors means every component handles problems the same way.',
        'The `204` branch matters: a successful delete returns no body, and calling `res.json()` on an empty body would throw. On failure it throws the first line of `details` when the server sent one (for example “Title cannot be empty”), otherwise the general `error`. Both come from the Express error handler you wrote in guide 7.',
      ],
      blocks: [{ lang: 'js', file: 'client/src/api.js', ref: '08-api.js' }],
    },
    {
      id: 'css',
      title: 'Add a little styling',
      body: ['Replace `client/src/App.css` with this. The borders use semi-transparent grey so it looks fine in both light and dark mode.'],
      blocks: [{ lang: 'text', file: 'client/src/App.css', ref: '08-App.css' }],
    },
    {
      id: 'app',
      title: 'Load and render the tasks',
      body: [
        'Replace `client/src/App.jsx`. Three pieces of state describe the screen: the data, whether it is loading, and whether it failed. Every fetch has exactly these three outcomes, and a page that ignores two of them looks broken half the time.',
        'The `ignore` flag deals with a real quirk: in development React runs effects twice, and a slow first response could otherwise arrive after the second. The cleanup function flips the flag so a stale response is dropped.',
        'The `key` on each list item lets React match items between renders. Use the database `id`, never the array index.',
      ],
      blocks: [{ lang: 'jsx', file: 'client/src/App.jsx', ref: '08-App.jsx' }],
      check: 'The page lists your tasks. In the browser’s Network tab you see one request to `/api/tasks` with status 200.',
    },
    {
      id: 'fail',
      title: 'See the error state work',
      body: [
        'Stop the Express server (Ctrl+C in its terminal) and reload the page. You should see “Could not load tasks”, not a blank screen. Start the server again and reload to recover.',
      ],
    },
  ],
  troubleshooting: [
    {
      problem: 'Unexpected token “<”, “<!doctype “… is not valid JSON',
      cause: 'The request never reached Express. Vite answered with its own HTML page, usually because the proxy is not active.',
      fix: 'Check the URL starts with `/api`, `vite.config.js` has the proxy, and the Vite dev server was restarted after you edited it.',
    },
    {
      problem: 'The list flashes “Loading…” forever',
      cause: 'The promise never settles, or `setLoading(false)` is not reached.',
      fix: 'Keep it in `.finally(...)` as shown. Open the Network tab: if the request is pending, Express is not answering.',
    },
    {
      problem: 'Warning: Each child in a list should have a unique “key” prop',
      cause: 'The `key` is missing or not unique.',
      fix: 'Use `key={task.id}` on the outermost element returned inside `map`.',
    },
    {
      problem: 'The request fires twice in development',
      cause: 'React StrictMode intentionally runs effects twice to catch bugs.',
      fix: 'This is normal and only happens in development. The `ignore` flag keeps it harmless.',
    },
    {
      problem: 'Failed to resolve import “./api.js”',
      cause: 'The file is in the wrong folder or has a different name.',
      fix: 'It must be `client/src/api.js`, next to `App.jsx`.',
    },
  ],
  learned: [
    'Every fetch has three outcomes to show: loading, failed, loaded.',
    'Keep URLs and headers in one API file, not scattered across components.',
    'Clean up effects so an old response cannot overwrite a newer one.',
  ],
};
