import type { Guide } from '../types';

export const deploy: Guide = {
  slug: 'build-and-deploy',
  title: 'Build for production and deploy',
  summary: 'Build the React app, let Express serve it next to the API, and run it the way a host will.',
  level: 'Intermediate',
  minutes: 15,
  tags: ['deploy', 'vite', 'express', 'production'],
  goal: 'One Node process on one port serves the React app and the API, ready to put on a host.',
  youNeed: ['Guides 2 to 9 done: a working Task Board in development.'],
  steps: [
    {
      id: 'why',
      title: 'What changes in production',
      body: [
        'In development you run two servers: Vite on 5173 serves React and proxies `/api` to Express on 3001. In production there is no Vite server. `vite build` turns your React code into plain static files in `client/dist`, and **Express serves those files itself**, next to the API. One process, one port, one origin.',
        'That also means you need no proxy and no CORS setup in production.',
      ],
    },
    {
      id: 'build',
      title: 'Build the React app',
      body: ['From the `client` folder:'],
      blocks: [{ lang: 'bash', code: 'npm run build', run: 'client' }],
      check: 'A `client/dist` folder appears with an `index.html` and an `assets` folder.',
    },
    {
      id: 'serve',
      title: 'Let Express serve the build',
      body: [
        'Replace `server/src/index.js` with this version. The new part is the `if` block: only in production, serve the files in `client/dist`, and send `index.html` for any path that is not under `/api` so a React route such as `/about` still loads the app.',
        'The order matters. The API routes come first, then the static files, then the 404 and error handlers last.',
      ],
      blocks: [{ lang: 'js', file: 'server/src/index.js', ref: '11-server-index.js' }],
    },
    {
      id: 'start',
      title: 'Add a start script',
      body: [
        'Hosts run `npm start`. Add it from the `server` folder. It has no `--env-file` flag on purpose: on a host you set environment variables in the dashboard instead of using a `.env` file.',
      ],
      blocks: [{ lang: 'bash', code: 'npm pkg set "scripts.start=node src/index.js"', run: 'server' }],
    },
    {
      id: 'local',
      title: 'Try production mode on your machine',
      body: [
        'Run the server with `NODE_ENV=production` and keep using your local `.env` for the database URL.',
        'Windows PowerShell: `$env:NODE_ENV="production"; node --env-file=.env src/index.js`',
      ],
      blocks: [{ lang: 'bash', code: 'NODE_ENV=production node --env-file=.env src/index.js' }],
      check: 'Open http://localhost:3001 (not 5173). The Task Board loads and works, and `http://localhost:3001/api/tasks` returns JSON. Stop the Vite dev server first to prove it is not being used.',
    },
    {
      id: 'host',
      title: 'Put it on a host',
      body: [
        'Every host (Render, Railway, Fly.io and similar) asks for the same four things. The screens differ, the ideas do not.',
        '**Build command:** install and build the client, install the server, for example `npm --prefix client install && npm --prefix client run build && npm --prefix server install`.',
        '**Start command:** `npm --prefix server start`.',
        '**Environment variables:** `NODE_ENV=production`, `DATABASE_URL` (the connection string of a hosted PostgreSQL database; most hosts sell one, or you can use a separate provider), and `PORT` if the host does not set it for you.',
        '**Run the migration once** against the hosted database. `npm run migrate` expects a local `.env` file, so on a host call the script directly with the variable already set: `node scripts/migrate.js` from the `server` folder, using the host’s one-off command or shell feature. You can also run it from your own machine with `DATABASE_URL` set to the hosted value for that one command.',
      ],
    },
    {
      id: 'ssl',
      title: 'About the hosted database connection',
      body: [
        'Use the connection string exactly as the provider shows it. Hosted databases often require an encrypted connection and the string usually already says so. If you get an SSL error, read the provider’s docs for the `pg` setting they recommend. Do not copy snippets that turn off certificate checking: they work, and they remove the protection.',
        'Never commit `server/.env` and never put `DATABASE_URL` in the client code. Everything in `client/` is public once deployed.',
      ],
    },
  ],
  troubleshooting: [
    {
      problem: 'In production the page is blank or says "Cannot GET /"',
      cause: '`NODE_ENV` is not `production`, so Express never serves `client/dist`, or the client was not built.',
      fix: 'Run `npm run build` in `client` and start with `NODE_ENV=production`. Check that `client/dist/index.html` exists.',
    },
    {
      problem: 'Refreshing a React route gives a 404',
      cause: 'The server does not know client-side routes and returns its own 404.',
      fix: 'Keep the fallback route that sends `index.html` for every non-`/api` path, after `express.static`.',
    },
    {
      problem: '/api/... returns the React page instead of JSON',
      cause: 'The fallback route is registered before the API routes, or its pattern also matches `/api`.',
      fix: 'Register the API routes first and keep the `(?!\\/api)` exclusion in the fallback pattern.',
    },
    {
      problem: 'It works locally but the host shows "DATABASE_URL is missing"',
      cause: 'The `.env` file is not deployed (it should not be). The host has no value for the variable.',
      fix: 'Set `DATABASE_URL` in the host’s environment variables page and redeploy.',
    },
    {
      problem: 'The host says the port is not reachable',
      cause: 'The server listens on a fixed port, but the host assigns one.',
      fix: 'Use `process.env.PORT || 3001` as in the guide, and do not set `PORT` yourself unless the host asks.',
    },
  ],
  learned: [
    '`vite build` makes static files; in production Express serves them.',
    'One process serving both the app and the API means one origin and no CORS.',
    'Route order in Express is part of the logic: API, static files, SPA fallback, then 404 and errors.',
    'Environment variables belong to the host, secrets never go in git or in the client.',
  ],
};
