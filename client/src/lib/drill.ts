/** The current 5-minute drill: which problems, and which are done. Per-browser, nothing sensitive. */
export interface DrillState {
  ids: string[];
  done: string[];
  startedAt: number;
}

const KEY = 'ct-drill';

export function readDrill(): DrillState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as DrillState;
    return Array.isArray(d.ids) && Array.isArray(d.done) ? d : null;
  } catch {
    return null;
  }
}

export function writeDrill(d: DrillState | null) {
  try {
    if (d) localStorage.setItem(KEY, JSON.stringify(d));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the drill still works, it just won't survive a reload */
  }
}

export function markDrillDone(id: string): DrillState | null {
  const d = readDrill();
  if (!d || !d.ids.includes(id) || d.done.includes(id)) return d;
  const next = { ...d, done: [...d.done, id] };
  writeDrill(next);
  return next;
}
