import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { HttpError } from '../errors.js';

export const tasksRouter = Router();

const COLUMNS = 'id, title, done, created_at';

const idSchema = z.coerce
  .number({ error: 'Task id must be a whole number' })
  .int('Task id must be a whole number')
  .positive('Task id must be positive')
  .max(2147483647, 'Task id is too large');

const createSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be 200 characters or fewer'),
});

const updateSchema = z.object({
  done: z.boolean({ error: 'done must be true or false' }),
});

tasksRouter.get('/', async (req, res) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM tasks ORDER BY created_at DESC, id DESC`);
  res.json(rows);
});

tasksRouter.post('/', async (req, res) => {
  const { title } = createSchema.parse(req.body);
  const { rows } = await query(`INSERT INTO tasks (title) VALUES ($1) RETURNING ${COLUMNS}`, [title]);
  res.status(201).json(rows[0]);
});

tasksRouter.patch('/:id', async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const { done } = updateSchema.parse(req.body);
  const { rows } = await query(`UPDATE tasks SET done = $1 WHERE id = $2 RETURNING ${COLUMNS}`, [done, id]);
  if (rows.length === 0) throw new HttpError(404, 'Task not found');
  res.json(rows[0]);
});

tasksRouter.delete('/:id', async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const { rowCount } = await query('DELETE FROM tasks WHERE id = $1', [id]);
  if (rowCount === 0) throw new HttpError(404, 'Task not found');
  res.status(204).end();
});
