import type { AnalysisResult } from '../engine/analyze.js';
import type { Problem } from '../problems/types.js';
import type { Level } from './prompts.js';

/**
 * Wording built straight from the engine's report. Used when there is no
 * Gemini key or the request fails, so every screen still works.
 */

export function offlineExplain(problem: Problem, analysis: AnalysisResult, level: Level): string {
  if (analysis.verdict === 'correct') {
    return `All ${analysis.total} tests pass. Your solution to "${problem.title}" does what the problem asks.`;
  }
  const m = analysis.mistake;
  if (!m) return 'The checker did not find a specific cause. Start with the smallest failing test and trace it by hand.';

  const where = m.line ? ` (line ${m.line})` : '';
  const quick = `${m.label}${where}. ${m.why}`;
  if (level === 'quick') return quick;

  const parts = [quick];
  if (analysis.divergence) parts.push(analysis.divergence.summary);
  else if (m.detail && m.confidence !== 'exact') parts.push(m.detail);
  parts.push(`To fix it: ${m.fix}`);
  if (level === 'standard') return parts.join('\n\n');

  if (analysis.divergence && analysis.divergence.expectedSeq.length) {
    parts.push(
      `A correct run goes ${analysis.divergence.expectedSeq.join(' → ')}. Yours goes ${analysis.divergence.gotSeq.join(' → ')}.`,
    );
  }
  parts.push(`Try this: ${m.ask[0]}`);
  return parts.join('\n\n');
}

export function offlineCoach(problem: Problem | undefined, analysis: AnalysisResult | undefined): string {
  const asks = analysis?.mistake?.ask;
  if (asks?.length) {
    return `The AI coach is not connected on this server, but here is where I would start:\n\n${asks.join('\n')}`;
  }
  return [
    'The AI coach is not connected on this server, so here are three questions that usually unlock a stuck problem:',
    '1. What should your function return for the smallest input you can think of?',
    '2. Pick one input and write down every variable after each line runs. Where does a value surprise you?',
    problem ? `3. Which part of "${problem.title}" are you least sure about: the loop, the starting value, or the edge cases?` : '3. Which part are you least sure about: the loop, the starting value, or the edge cases?',
  ].join('\n');
}
