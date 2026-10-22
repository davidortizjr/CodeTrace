// Every call to the backend goes through this one function.
async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null; // success with no body

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Prefer the specific reason (a validation detail) over the general error.
    throw new Error(data?.details?.[0]?.message ?? data?.error ?? `Request failed (${res.status})`);
  }
  return data;
}

export const getTasks = () => request('/tasks');

export const createTask = (title) =>
  request('/tasks', { method: 'POST', body: JSON.stringify({ title }) });

export const setDone = (id, done) =>
  request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) });

export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
