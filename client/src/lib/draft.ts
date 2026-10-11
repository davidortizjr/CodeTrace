const key = (id: string) => `ct-draft:${id}`;

export function loadDraft(id: string): string | null {
  try {
    return localStorage.getItem(key(id));
  } catch {
    return null;
  }
}

export function saveDraft(id: string, code: string) {
  try {
    localStorage.setItem(key(id), code);
  } catch {
    /* ignore */
  }
}

export function clearDraft(id: string) {
  try {
    localStorage.removeItem(key(id));
  } catch {
    /* ignore */
  }
}
