import { useEffect, useState } from 'react';
import { createTask, deleteTask, getTasks, setDone } from './api.js';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    getTasks()
      .then((data) => {
        if (!ignore) setTasks(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleAdd(event) {
    event.preventDefault(); // stop the browser reloading the page
    setSaving(true);
    setError('');
    try {
      const task = await createTask(title);
      setTasks((prev) => [task, ...prev]); // new array, never mutate state
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task) {
    setError('');
    try {
      const updated = await setDone(task.id, !task.done);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <h1>Task Board</h1>

      <form onSubmit={handleAdd}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New task"
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet. Add your first one above.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={task.done ? 'done' : ''}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => handleToggle(task)}
                aria-label={`Mark "${task.title}" as done`}
              />
              <span>{task.title}</span>
              <button type="button" onClick={() => handleDelete(task.id)} aria-label={`Delete "${task.title}"`}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
