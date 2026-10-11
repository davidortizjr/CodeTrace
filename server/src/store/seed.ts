import { randomUUID } from 'node:crypto';
import { ERROR_TYPES, type ErrorTypeId } from '../engine/errors.js';
import { getProblem } from '../problems/bank.js';
import type { Attempt } from './types.js';

/**
 * Starting data for the demo account, "Sam Reyes".
 * Strong on loops and strings, weak on arrays and recursion; off-by-one,
 * edge cases and base cases are the recurring mistakes.
 * [days ago, problem, correct, error type, confidence]
 */
type Row = [number, string, 0 | 1, ErrorTypeId | null, number];

const ROWS: Row[] = [
  [15, 'sum-evens', 0, 'bad-init', 80],
  [15, 'sum-evens', 1, null, 70],
  [14, 'factorial-loop', 0, 'off-by-one', 85],
  [14, 'factorial-loop', 1, null, 90],
  [13, 'find-max', 0, 'bad-init', 85],
  [13, 'find-max', 0, 'sort-lexicographic', 60],
  [12, 'count-vowels', 0, 'case-handling', 75],
  [12, 'count-vowels', 1, null, 80],
  [11, 'fizzbuzz', 0, 'control-flow', 90],
  [11, 'fizzbuzz', 1, null, 70],
  [10, 'average', 1, null, 85],
  [10, 'remove-duplicates', 0, 'logic', 65],
  [9, 'sum-digits', 0, 'base-case', 50],
  [9, 'sum-digits', 0, 'base-case', 60],
  [8, 'is-palindrome', 0, 'edge-case', 80],
  [8, 'is-palindrome', 1, null, 60],
  [7, 'grade-letter', 0, 'boundary', 90],
  [7, 'grade-letter', 1, null, 75],
  [6, 'rotate-left', 0, 'mutation', 70],
  [6, 'rotate-left', 0, 'edge-case', 70],
  [5, 'count-words', 0, 'bad-init', 65],
  [5, 'count-words', 1, null, 70],
  [4, 'leap-year', 0, 'logic', 85],
  [4, 'leap-year', 1, null, 60],
  [3, 'fizzbuzz', 1, null, 90],
  [3, 'fibonacci', 0, 'base-case', 55],
  [3, 'remove-duplicates', 1, null, 75],
  [2, 'find-max', 0, 'off-by-one', 80],
  [2, 'find-max', 1, null, 90],
  [2, 'capitalize-words', 1, null, 80],
  [1, 'group-by-length', 0, 'runtime', 60],
  [1, 'group-by-length', 1, null, 65],
  [1, 'sum-evens', 1, null, 95],
  [0, 'count-vowels', 0, 'off-by-one', 80],
  [0, 'count-vowels', 1, null, 85],
  [0, 'factorial-loop', 1, null, 85],
];

export function seedAttempts(userId: string, now = new Date()): Attempt[] {
  const out: Attempt[] = [];
  ROWS.forEach(([daysAgo, problemId, correct, errorType, confidence], i) => {
    const problem = getProblem(problemId);
    if (!problem) return;
    const total = problem.tests.length;
    const when = new Date(now);
    when.setUTCDate(when.getUTCDate() - daysAgo);
    when.setUTCHours(6 + (i % 10), (i * 7) % 60, 0, 0);
    if (when > now) when.setTime(now.getTime() - (ROWS.length - i) * 60_000);
    out.push({
      id: randomUUID(),
      userId,
      problemId,
      topic: problem.topic,
      correct: correct === 1,
      passed: correct === 1 ? total : Math.max(1, Math.round(total * 0.55)),
      total,
      errorType: correct === 1 ? null : errorType,
      confidence,
      code: '',
      analysis: null,
      createdAt: when.toISOString(),
    });
  });
  // sanity: every seeded error type exists in the taxonomy
  for (const a of out) if (a.errorType && !ERROR_TYPES[a.errorType]) throw new Error('bad seed');
  return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
