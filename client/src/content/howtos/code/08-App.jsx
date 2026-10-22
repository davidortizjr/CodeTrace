import { useEffect, useState } from 'react';
import { getTasks } from './api.js';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false; // stops a stale response from updating state

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

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert" className="error">Could not load tasks: {error}</p>;

  return (
    <main>
      <h1>Task Board</h1>
      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={task.done ? 'done' : ''}>
              <span>{task.title}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
