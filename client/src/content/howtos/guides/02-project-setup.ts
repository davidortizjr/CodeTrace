import type { Guide } from '../types';

export const projectSetup: Guide = {
  slug: 'set-up-react-and-express',
  title: 'Set up a React and Express project',
  summary: 'Create a client and a server folder, run both, and see React talk to Express through the Vite proxy.',
  level: 'Beginner',
  minutes: 20,
  tags: ['react', 'express', 'vite', 'setup'],
  goal: 'A React page that shows “API status: connected”, fed by a route on your Express server.',
  youNeed: [
    'Node.js 20.6 or newer. Check with `node -v`. The `--env-file` flag used below needs it.',
    'A code editor and two terminal windows.',
  ],
  steps: [
    {
      id: 'folders',
      title: 'Create the project and the React app',
      body: [
        'One folder holds two apps: `client` (React, built with Vite) and `server` (Express). Keeping them separate means each has its own `package.json` and its own dependencies.',
        'If the Vite scaffold asks extra questions, accept the defaults, and say **no** if it offers to install and start the dev server now.',
      ],
      blocks: [
        {
          lang: 'bash',
          run: 'parent',
          code: 'mkdir taskboard\ncd taskboard\nnpm create vite@latest client -- --template react\ncd client\nnpm install',
        },
      ],
      check: 'You now have `taskboard/client` with a `src` folder and a `package.json`.',
    },
    {
      id: 'server-init',
      title: 'Create the Express app',
      body: [
        'Run these from the `taskboard` folder. `npm pkg set` edits `package.json` for you: `type: module` lets you use `import`, and the `dev` script restarts the server whenever a file changes and loads variables from `.env`.',
      ],
      blocks: [
        {
          lang: 'bash',
          run: 'root',
          code: 'mkdir server\ncd server\nnpm init -y\nnpm install express pg\nnpm pkg set type=module "scripts.dev=node --env-file=.env --watch src/index.js"',
        },
      ],
      check: 'Open `server/package.json`. It lists `express` and `pg` under dependencies, `"type": "module"`, and a `dev` script.',
    },
    {
      id: 'server-files',
      title: 'Write the first route',
      body: [
        'Create these three files. `.env` holds settings that change between machines. `.gitignore` keeps `.env` and `node_modules` out of git, which matters once `.env` contains a password.',
        '`/api/health` is a route whose only job is to prove the server is alive. Almost every real API has one.',
      ],
      blocks: [
        { lang: 'env', file: 'server/.env', ref: '02-server-env' },
        { lang: 'text', file: 'server/.gitignore', ref: '02-server-gitignore' },
        { lang: 'js', file: 'server/src/index.js', ref: '02-server-index.js' },
      ],
    },
    {
      id: 'proxy',
      title: 'Point the Vite dev server at Express',
      body: [
        'Replace `client/vite.config.js`. The `proxy` setting is the whole trick from guide 1: requests to `/api` leave Vite and go to Express.',
      ],
      blocks: [{ lang: 'js', file: 'client/vite.config.js', ref: '02-client-vite.config.js' }],
    },
    {
      id: 'react',
      title: 'Call the API from React',
      body: [
        'Replace `client/src/App.jsx`. `useEffect` with an empty list runs once after the first render, which is the right place to fetch data. `useState` holds the answer and re-renders the page when it changes.',
      ],
      blocks: [{ lang: 'jsx', file: 'client/src/App.jsx', ref: '02-client-App.jsx' }],
    },
    {
      id: 'run',
      title: 'Run both apps',
      body: ['Use two terminals, one for each app. Leave both running while you work.'],
      blocks: [
        { lang: 'bash', caption: 'Terminal 1', code: 'cd server\nnpm run dev' },
        { lang: 'bash', caption: 'Terminal 2', code: 'cd client\nnpm run dev' },
      ],
      check: 'Terminal 1 prints “API listening on http://localhost:3001”. Open http://localhost:5173 and the page says “API status: connected”.',
    },
  ],
  troubleshooting: [
    {
      problem: 'The page says “API status: cannot reach the API”',
      cause: 'Express is not running, or it is listening on a different port than the proxy expects.',
      fix: 'Check terminal 1 for the “API listening” line. Visit http://localhost:3001/api/health directly: if that works but the page does not, restart the Vite dev server, because `vite.config.js` is only read at startup.',
    },
    {
      problem: 'Error: listen EADDRINUSE: address already in use :::3001',
      cause: 'Another process, often an old copy of this server, is using port 3001.',
      fix: 'Stop the old process with Ctrl+C in its terminal, or change `PORT` in `server/.env` and the proxy target in `vite.config.js` to the same new number.',
    },
    {
      problem: 'SyntaxError: Cannot use import statement outside a module',
      cause: '`"type": "module"` is missing from `server/package.json`.',
      fix: 'Run `npm pkg set type=module` inside the server folder.',
    },
    {
      problem: 'node: --env-file= is not allowed in NODE_OPTIONS, or bad option: --env-file',
      cause: 'Your Node.js is older than 20.6.',
      fix: 'Run `node -v`, then install a current LTS release from nodejs.org.',
    },
    {
      problem: 'Cannot find package “express”',
      cause: 'The install ran in the wrong folder.',
      fix: 'Run `npm install express pg` inside `taskboard/server`, not in the project root or `client`.',
    },
  ],
  learned: [
    'A full-stack project is two separate Node apps in one folder.',
    'The Vite proxy lets React call `/api/...` without CORS problems in development.',
    '`useEffect` plus `useState` is the basic pattern for loading data in React.',
  ],
};
