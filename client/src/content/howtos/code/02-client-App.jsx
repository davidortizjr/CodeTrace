import { useEffect, useState } from 'react';

export default function App() {
  const [status, setStatus] = useState('checking…');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.ok ? 'connected' : 'problem'))
      .catch(() => setStatus('cannot reach the API'));
  }, []);

  return (
    <main>
      <h1>Task Board</h1>
      <p>API status: {status}</p>
    </main>
  );
}
