import type { Guide } from '../types';

export const postgres: Guide = {
  slug: 'set-up-postgresql',
  title: 'Set up a PostgreSQL database',
  summary: 'Get a PostgreSQL server running, create a database, and put its connection string in your .env file.',
  level: 'Beginner',
  minutes: 15,
  tags: ['postgresql', 'database', 'setup'],
  goal: 'A database called `taskboard` that you can reach with `psql`, and a `DATABASE_URL` in `server/.env`.',
  youNeed: ['The project from guide 2.', 'One of: Docker, a PostgreSQL installer, or a free hosted PostgreSQL account.'],
  steps: [
    {
      id: 'install',
      title: 'Get a PostgreSQL server',
      body: [
        'Pick **one** of these. They all end the same way: a server you can connect to with a URL.',
        '**Docker** is the quickest if you have it. This starts PostgreSQL 16 with a password of `postgres` (fine for your own machine, never for a public server) and creates the `taskboard` database for you.',
        '**An installer** from postgresql.org works on every system. Remember the password you choose for the `postgres` user during setup, then create the database with `CREATE DATABASE taskboard;` inside `psql`.',
        '**A hosted database** (Neon, Supabase and others offer free plans) gives you a connection string in their dashboard. Use it as it is, in place of the local one in step 3.',
      ],
      blocks: [
        {
          lang: 'bash',
          caption: 'Docker',
          code: 'docker run --name taskboard-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=taskboard -p 5432:5432 -d postgres:16',
        },
        {
          lang: 'bash',
          caption: 'Installer: run inside psql, connected as the postgres user',
          code: 'CREATE DATABASE taskboard;',
        },
      ],
      check: 'With Docker, `docker ps` lists `taskboard-db` as running. With the installer, `psql -U postgres -l` lists `taskboard`.',
    },
    {
      id: 'read-url',
      title: 'Read a connection string',
      body: [
        'Every client, including `pg`, can connect with one URL. Take it apart once and it stops being mysterious:',
        '`postgresql://postgres:postgres@localhost:5432/taskboard` means: the **user** is `postgres`, the **password** is `postgres`, the server is on **host** `localhost` at **port** 5432, and the **database** is `taskboard`.',
        'If your password contains characters like `@`, `/` or `#`, they must be percent-encoded in the URL (`@` becomes `%40`), or the URL will be split in the wrong place.',
      ],
    },
    {
      id: 'psql',
      title: 'Test the connection with psql',
      body: ['`psql` is PostgreSQL’s command-line client. Testing with it first separates “is the database fine?” from “is my code fine?”.'],
      blocks: [
        {
          lang: 'bash',
          code: 'psql "postgresql://postgres:postgres@localhost:5432/taskboard" -c "SELECT version();"',
        },
      ],
      check: 'You see a row that starts with “PostgreSQL 16” (or your version).',
    },
    {
      id: 'env',
      title: 'Save the URL in server/.env',
      body: [
        'Replace `server/.env`. Your code will read the URL from `process.env.DATABASE_URL`, so the password never appears in a file you commit.',
      ],
      blocks: [{ lang: 'env', file: 'server/.env', ref: '03-server-env' }],
      check: 'Restart `npm run dev` in the server folder so it picks up the new variable. Node reads `.env` only at startup.',
    },
  ],
  troubleshooting: [
    {
      problem: 'psql: error: connection to server at “localhost” (::1), port 5432 failed: Connection refused',
      cause: 'PostgreSQL is not running, or is listening on a different port.',
      fix: 'Docker: run `docker start taskboard-db`, then `docker ps`. Installer: start the PostgreSQL service from your system’s service manager. If you changed the port, change it in the URL too.',
    },
    {
      problem: 'FATAL: password authentication failed for user “postgres”',
      cause: 'The password in the URL is not the one the server was created with.',
      fix: 'With Docker the password is whatever you passed in `POSTGRES_PASSWORD` the first time the container was created. Changing it later does nothing; remove the container with `docker rm -f taskboard-db` and run the command again.',
    },
    {
      problem: 'FATAL: database “taskboard” does not exist',
      cause: 'You connected to the server but never created the database.',
      fix: 'Run `psql -U postgres -c "CREATE DATABASE taskboard;"`.',
    },
    {
      problem: 'psql: command not found',
      cause: 'The PostgreSQL client tools are not on your PATH.',
      fix: 'Reinstall with the “command line tools” option selected, or run `docker exec -it taskboard-db psql -U postgres -d taskboard` to use the copy inside the container.',
    },
  ],
  learned: [
    'A connection string packs user, password, host, port and database into one URL.',
    'Test the database with `psql` before blaming your code.',
    'Secrets live in `.env`, which is listed in `.gitignore`.',
  ],
};
