export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export const shortDate = (iso: string) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

export const DIFFICULTY = ['', 'Warm-up', 'Core', 'Stretch'] as const;

/** How the engine reached its verdict, in words a student can weigh. */
export const CONFIDENCE_NOTE: Record<string, string> = {
  exact: 'Your code behaves exactly like a known wrong approach to this problem.',
  likely: 'Your code behaves almost exactly like a known wrong approach to this problem.',
  heuristic: 'Spotted from a pattern in your code. Treat it as a strong hint, not a certainty.',
  generic: 'Judged from how the tests failed. Treat it as a hint.',
};
