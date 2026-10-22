import type { CodeLang, McqItem, QuizItem, Track, Unit } from './types.js';

/** What the learner is allowed to see before answering. No answers, no explanations. */
export interface PublicQuizItem {
  id: string;
  kind: 'mcq' | 'short';
  prompt: string;
  code?: { lang: CodeLang; text: string };
  /** `id` is the option's index in the authored list, so shuffling the display never changes what is graded. */
  options?: { id: number; text: string }[];
  placeholder?: string;
}

export interface GradedItem {
  id: string;
  correct: boolean;
  /** What the learner gave, as text. Null when left blank. */
  given: string | null;
  answerText: string;
  explanation: string;
  review?: string;
}

export const PASS_MARK = 0.7;
export const PER_UNIT_IN_FINAL = 5;

/** Small deterministic generator so a shuffle can be reproduced from a seed. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(list: T[], seed: number): T[] {
  const out = [...list];
  const next = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function publicItem(item: QuizItem, shuffleSeed?: number): PublicQuizItem {
  const base: PublicQuizItem = { id: item.id, kind: item.kind, prompt: item.prompt, code: item.code };
  if (item.kind === 'short') return { ...base, placeholder: item.placeholder };
  let options = item.options.map((text, id) => ({ id, text }));
  if (shuffleSeed !== undefined) options = shuffled(options, shuffleSeed + hash(item.id));
  return { ...base, options };
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const normalizeShort = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/;$/, '').trim();

export function answerTextOf(item: QuizItem): string {
  return item.kind === 'mcq' ? item.options[item.answer] : item.accept[0];
}

export function grade(item: QuizItem, given: unknown): GradedItem {
  const base = { id: item.id, answerText: answerTextOf(item), explanation: item.explanation, review: item.review };
  if (item.kind === 'mcq') {
    const idx = typeof given === 'number' && Number.isInteger(given) && given >= 0 && given < item.options.length ? given : null;
    return { ...base, correct: idx === item.answer, given: idx === null ? null : item.options[idx] };
  }
  const text = typeof given === 'string' ? given.slice(0, 300) : '';
  const norm = normalizeShort(text);
  return { ...base, correct: norm !== '' && item.accept.some((a) => normalizeShort(a) === norm), given: norm === '' ? null : text.trim() };
}

/**
 * The final exam for a track: 5 questions from each unit, drawn from the unit exam and its bonus
 * questions. The draw depends on the seed, so each attempt differs.
 */
export function drawFinal(units: Unit[], seed: number): QuizItem[] {
  const out: QuizItem[] = [];
  for (const u of units) {
    const pool = [...u.exam, ...u.bonus];
    out.push(...shuffled(pool, seed + hash(u.id)).slice(0, PER_UNIT_IN_FINAL));
  }
  return out;
}

export const finalPool = (units: Unit[]): Map<string, QuizItem> =>
  new Map(units.flatMap((u) => [...u.exam, ...u.bonus]).map((i) => [i.id, i]));

export const finalSize = (units: Unit[]) => units.length * PER_UNIT_IN_FINAL;

export const isMcq = (i: QuizItem): i is McqItem => i.kind === 'mcq';
export type { Track };
