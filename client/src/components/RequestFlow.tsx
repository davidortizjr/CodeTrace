const NODES = [
  { name: 'React', where: 'In the browser', note: 'fetch("/api/tasks")' },
  { name: 'Vite proxy', where: 'Port 5173, development only', note: 'forwards /api to Express' },
  { name: 'Express', where: 'Port 3001', note: 'route, validation, handler' },
  { name: 'pg pool', where: 'Inside Express', note: 'query(sql, [values])' },
  { name: 'PostgreSQL', where: 'Port 5432', note: 'rows on disk' },
];

/** The five hops of one request as a vertical flow: it fits any width and reads in order for screen readers. */
export function RequestFlow() {
  return (
    <figure className="rounded-xl border border-line bg-surface p-4 sm:p-5" aria-label="The five layers a request passes through, from React to PostgreSQL and back">
      <ol>
        {NODES.map((n, i) => (
          <li key={n.name}>
            <div className="grid grid-cols-[28px_1fr] items-center gap-x-3 gap-y-0.5 rounded-lg border border-line-strong bg-surface-2 px-3 py-2.5 sm:grid-cols-[28px_150px_1fr_1fr]">
              <span className="mono grid size-6 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent" aria-hidden>
                {i + 1}
              </span>
              <span className="font-display text-[15px] font-bold">{n.name}</span>
              <span className="col-start-2 text-xs text-ink-3 sm:col-start-auto sm:text-sm">{n.where}</span>
              <span className="mono col-start-2 text-xs text-ink-2 sm:col-start-auto">{n.note}</span>
            </div>
            {i < NODES.length - 1 && (
              <div className="flex h-6 items-center pl-[22px] text-ink-3" aria-hidden>
                <svg width="12" height="24" viewBox="0 0 12 24">
                  <path d="M6 2v18m-4.5-4.5L6 20l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 text-sm text-ink-2">The response takes the same path back, as JSON, and React draws it.</figcaption>
    </figure>
  );
}
