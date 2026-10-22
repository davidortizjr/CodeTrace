import express from 'express';
import { query } from './db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'taskboard-api' });
});

app.get('/api/health/db', async (req, res) => {
  const { rows } = await query('SELECT now() AS time');
  res.json({ ok: true, time: rows[0].time });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
