import type { Guide } from '../types';

export const reactForms: Guide = {
  slug: 'add-edit-and-delete-from-react',
  title: 'Add, tick off and delete tasks from React',
  summary: 'Build a form that POSTs to Express, update the list without reloading, and show server errors in the page.',
  level: 'Intermediate',
  minutes: 20,
  tags: ['react', 'forms', 'state', 'express'],
  goal: 'A working Task Board: add, complete and delete tasks, and every change persists in PostgreSQL.',
  youNeed: ['Guide 8 done: the list loads from the API.'],
  steps: [
    {
      id: 'app',
      title: 'Replace App.jsx with the full version',
      body: [
        'This is the complete component. Read it in the order the user meets it.',
        'The form is **controlled**: the input’s value comes from the `title` state and every keystroke updates it, so React always knows what is typed. `event.preventDefault()` stops the browser from reloading the page when the form submits.',
        'Each handler does the same four things: clear the old error, call the API, update state with the **server’s** answer, show an error if it failed. The new list is always a new array (`[task, ...prev]`, `map`, `filter`). Changing the existing array in place would not trigger a re-render.',
        '`saving` disables the Add button during the request so a double click cannot create two tasks.',
      ],
      blocks: [{ lang: 'jsx', file: 'client/src/App.jsx', ref: '09-App.jsx' }],
      check: 'Add a task, tick it, delete another. Reload the page: the changes are still there, because they were saved in PostgreSQL, not in React.',
    },
    {
      id: 'validate',
      title: 'Trigger a server error',
      body: [
        'Submit the form with the field empty. You should see “Title cannot be empty” in red. That message was written in your Express validation in guide 7 and travelled back through `api.js` to the page, with no extra code in React.',
      ],
    },
    {
      id: 'psql',
      title: 'Check the database agrees',
      body: ['The page is only a view. The database is the truth. Confirm it:'],
      blocks: [
        {
          lang: 'bash',
          code: 'psql "postgresql://postgres:postgres@localhost:5432/taskboard" -c "SELECT id, title, done FROM tasks ORDER BY id;"',
        },
      ],
      check: 'The rows match what the page shows, including the `done` column for ticked tasks.',
    },
    {
      id: 'next',
      title: 'Ideas to extend it',
      body: [
        'Add an “edit title” input using the same `PATCH` route. Add a filter for done and not done, first in React, then as a `WHERE done = $1` in SQL. Split the list item into its own `TaskItem` component. Each one practises a different layer of the stack.',
      ],
    },
  ],
  troubleshooting: [
    {
      problem: 'The page reloads when I click Add and the task disappears',
      cause: 'The browser’s default form submit ran.',
      fix: 'Call `event.preventDefault()` first thing in the submit handler, and use `onSubmit` on the `<form>`, not `onClick` on the button.',
    },
    {
      problem: 'I can not type in the input',
      cause: 'The input has a `value` but no `onChange`, so React resets it on every keystroke.',
      fix: 'Pass both: `value={title}` and `onChange={(e) => setTitle(e.target.value)}`.',
    },
    {
      problem: 'The new task does not appear until I refresh',
      cause: 'State was changed in place, or the response was not used to update it.',
      fix: 'Use `setTasks((prev) => [task, ...prev])`. Never call `tasks.push(...)`.',
    },
    {
      problem: 'Tick box works but reverts after refresh',
      cause: 'The PATCH request failed, but the UI changed anyway.',
      fix: 'Only update state with the response, as shown. Check the Network tab for the PATCH status and the Express terminal for errors.',
    },
    {
      problem: 'The red error message stays on screen after I fix the problem',
      cause: 'The error state is never cleared.',
      fix: 'Call `setError(\'\')` at the start of each handler.',
    },
  ],
  learned: [
    'A controlled input keeps its value in state.',
    'Update React state with the server’s response, using new arrays, never mutation.',
    'The database is the source of truth; the page only shows it.',
  ],
};
