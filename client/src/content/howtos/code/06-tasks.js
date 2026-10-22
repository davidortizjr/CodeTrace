import { Router } from 'express';
import { query } from '../db.js';

export const tasksRouter = Router();

const COLUMNS = 'id, title, done, created_at';

// GET /api/tasks: newest first
tasksRouter.get('/', async (req, res) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM tasks ORDER BY created_at DESC, id DESC`);
  res.json(rows);
});

// POST /api/tasks: body { "title": "..." }
tasksRouter.post('/', async (req, res) => {
  const { title } = req.body;
  const { rows } = await query(`INSERT INTO tasks (title) VALUES ($1) RETURNING ${COLUMNS}`, [title]);
  res.status(201).json(rows[0]);
});

// PATCH /api/tasks/:id: body { "done": true }
tasksRouter.patch('/:id', async (req, res) => {
  const { done } = req.body;
  const { rows } = await query(`UPDATE tasks SET done = $1 WHERE id = $2 RETURNING ${COLUMNS}`, [
    done,
    req.params.id,
  ]);
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(rows[0]);
});

// DELETE /api/tasks/:id
tasksRouter.delete('/:id', async (req, res) => {
  const { rowCount } = await query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  if (rowCount === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).end();
});
