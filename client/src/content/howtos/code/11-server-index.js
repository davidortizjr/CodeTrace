import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { query } from './db.js';
import { notFound, errorHandler } from './errors.js';
import { tasksRouter } from './routes/tasks.js';

const app = express();
const port = process.env.PORT || 3001;
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'taskboard-api' });
});

app.get('/api/health/db', async (req, res) => {
  const { rows } = await query('SELECT now() AS time');
  res.json({ ok: true, time: rows[0].time });
});

app.use('/api/tasks', tasksRouter);

// In production Express also serves the React build.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  // Any other non-API path gets index.html, so React can handle the route.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Taskboard listening on http://localhost:${port}`);
});
