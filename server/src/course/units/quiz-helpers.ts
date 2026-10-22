import type { McqItem, ShortItem, Verify } from '../types.js';

type Code = { lang: 'js' | 'ts'; text: string };

export const js = (text: string): Code => ({ lang: 'js', text });
export const ts = (text: string): Code => ({ lang: 'ts', text });

/** Short constructors so exam files stay readable. */
export function mcq(
  id: string,
  review: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  code?: Code,
  verify?: Verify,
): McqItem {
  return { id, kind: 'mcq', review, prompt, options, answer, explanation, ...(code ? { code } : {}), ...(verify ? { verify } : {}) };
}

export function short(
  id: string,
  review: string,
  prompt: string,
  accept: string[],
  explanation: string,
  code?: Code,
  verify?: Verify,
): ShortItem {
  return { id, kind: 'short', review, prompt, accept, explanation, ...(code ? { code } : {}), ...(verify ? { verify } : {}) };
}

export const OUT: Verify = { kind: 'output' };
