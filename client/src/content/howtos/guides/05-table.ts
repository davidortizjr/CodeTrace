import type { Guide } from '../types';

export const table: Guide = {
  slug: 'create-a-table-and-run-a-migration',
  title: 'Create a table and run a migration',
  summary: 'Describe your data in SQL, keep that SQL in the project, and apply it with one command.',
  level: 'Beginner',
  minutes: 10,
  tags: ['postgresql', 'sql', 'migrations'],
  goal: 'A `tasks` table with three starter rows, created by `npm run migrate`.',
  youNeed: ['Guide 4 done: the server connects to PostgreSQL.'],
  steps: [
    {
      id: 'schema',
      title: 'Write the schema',
      body: [
        'Create `server/db/schema.sql`. Each column choice does a job:',
        '`integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY` gives every row a unique number the database assigns itself. `NOT NULL` and `CHECK` make the database reject bad data even if your code has a bug. `timestamptz` stores a moment in time with its timezone, which avoids a class of date bugs later.',
        '`CREATE TABLE IF NOT EXISTS` and the guarded `INSERT` make the file safe to run more than once.',
      ],
      blocks: [{ lang: 'sql', file: 'server/db/schema.sql', ref: '05-schema.sql' }],
    },
    {
      id: 'script',
      title: 'Write a tiny migration runner',
      body: [
        'Create `server/scripts/migrate.js`. It reads the SQL file and sends it through the same pool your app uses, so it works even if `psql` is not installed. The `finally` block closes the pool so the script can exit.',
      ],
      blocks: [{ lang: 'js', file: 'server/scripts/migrate.js', ref: '05-migrate.js' }],
    },
    {
      id: 'run',
      title: 'Add the script and run it',
      body: ['From the `server` folder:'],
      blocks: [
        {
          lang: 'bash',
          run: 'server',
          code: 'npm pkg set "scripts.migrate=node --env-file=.env scripts/migrate.js"\nnpm run migrate',
        },
      ],
      check: 'The terminal prints “Database is up to date.”',
    },
    {
      id: 'look',
      title: 'Look at the data',
      body: ['Always look at what actually landed in the database, not just what you meant to put there.'],
      blocks: [
        {
          lang: 'bash',
          code: 'psql "postgresql://postgres:postgres@localhost:5432/taskboard" -c "SELECT * FROM tasks;"',
        },
      ],
      check: 'Three rows come back: “Read the pg documentation”, “Build the tasks API” and “Connect React to it”, each with `done` set to `f`.',
    },
  ],
  troubleshooting: [
    {
      problem: 'relation “tasks” does not exist (later, when you query it)',
      cause: 'The migration ran against a different database than the one your app connects to, or never ran.',
      fix: 'Run `npm run migrate` again and check that `DATABASE_URL` in `server/.env` names the database you are looking at.',
    },
    {
      problem: 'syntax error at or near … when running the migration',
      cause: 'A typo in the SQL, often a missing comma between columns.',
      fix: 'The message includes the position. Look at the text just before it: the real mistake is usually the line above.',
    },
    {
      problem: 'Error: ENOENT: no such file or directory … schema.sql',
      cause: 'The file is in the wrong folder or has a different name.',
      fix: 'It must be `server/db/schema.sql`, next to `server/scripts` and `server/src`.',
    },
    {
      problem: 'The three starter rows appear twice',
      cause: 'The guarded insert was changed or the table was dropped and recreated mid-way.',
      fix: 'Run `DELETE FROM tasks;` in psql and migrate again. The `WHERE NOT EXISTS` check inserts only into an empty table.',
    },
  ],
  learned: [
    'A migration is SQL kept in your project so anyone can rebuild the database.',
    'Constraints (`NOT NULL`, `CHECK`) protect your data when code has bugs.',
    'Make migration files safe to run twice.',
  ],
};
