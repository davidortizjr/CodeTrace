// Vite-only: bundles the real source files in ./code as strings.
const files = import.meta.glob('./code/*', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function getCode(ref: string): string {
  const text = files[`./code/${ref}`];
  if (text === undefined) throw new Error(`Missing how-to code file: ${ref}`);
  return text.replace(/\n$/, '');
}
