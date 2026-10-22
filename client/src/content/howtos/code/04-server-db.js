import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Add it to server/.env and restart the server.');
}

// A pool keeps a few connections open and hands them out per query.
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err) => {
  console.error('Unexpected error on an idle database connection', err);
});

export function query(text, params) {
  return pool.query(text, params);
}
