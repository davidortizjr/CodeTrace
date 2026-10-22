import { useCallback, useEffect, useState } from 'react';

const KEY = 'ct-howto-progress';
type Store = Record<string, string[]>;

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private window or blocked storage: progress just lasts for this visit */
  }
}

/** Which steps of which guide the learner ticked. Stored in this browser only. */
export function useHowtoProgress() {
  const [store, setStore] = useState<Store>(read);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setStore(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((slug: string, stepId: string) => {
    setStore((prev) => {
      const cur = new Set(prev[slug] ?? []);
      if (cur.has(stepId)) cur.delete(stepId);
      else cur.add(stepId);
      const next = { ...prev, [slug]: [...cur] };
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback((slug: string) => {
    setStore((prev) => {
      const next = { ...prev };
      delete next[slug];
      write(next);
      return next;
    });
  }, []);

  const doneIds = useCallback((slug: string) => store[slug] ?? [], [store]);
  return { doneIds, toggle, reset };
}
