import { ERROR_CATEGORIES, ERROR_TYPES, type ErrorCategory, type ErrorTypeId } from './errors.js';
import { PROBLEMS, TOPICS, getProblem } from '../problems/bank.js';
import type { TopicId } from '../problems/types.js';
import type { AttemptSummary } from '../store/types.js';

/** All progress numbers are derived from the attempt log. Nothing here involves the AI. */

export interface TopicSkill {
  id: TopicId;
  name: string;
  /** 0–100, or null if the topic has not been tried. */
  skill: number | null;
  attempts: number;
  solved: number;
  problems: number;
}

export interface Progress {
  attemptsTotal: number;
  overall: number | null;
  last20: { correct: number; total: number };
  topics: TopicSkill[];
  weakestTopic: TopicId | null;
  mistakes: { type: ErrorTypeId; label: string; category: ErrorCategory; count: number }[];
  categories: { category: ErrorCategory; count: number }[];
  trend: { date: string; accuracy: number | null; attempts: number }[];
  streakDays: number;
  calibration: { avgConfidence: number; accuracy: number; gap: number; n: number } | null;
  recent: {
    id: string;
    problemId: string;
    title: string;
    topic: TopicId;
    correct: boolean;
    passed: number;
    total: number;
    errorType: ErrorTypeId | null;
    createdAt: string;
  }[];
  solvedProblemIds: string[];
}

const WINDOW = 10;
const DECAY = 0.85;

/** Partial credit: a fully correct attempt counts 1, a failed one counts up to 0.4 by tests passed. */
const attemptScore = (a: AttemptSummary) => (a.correct ? 1 : 0.4 * (a.passed / Math.max(1, a.total)));

export function topicSkill(attempts: AttemptSummary[], topic: TopicId): number | null {
  const mine = attempts.filter((a) => a.topic === topic).slice(-WINDOW);
  if (mine.length === 0) return null;
  let num = 0;
  let den = 0;
  mine.forEach((a, i) => {
    const w = Math.pow(DECAY, mine.length - 1 - i);
    num += w * attemptScore(a);
    den += w;
  });
  return Math.round((num / den) * 100);
}

const day = (iso: string) => iso.slice(0, 10);

export function computeProgress(attempts: AttemptSummary[], now = new Date()): Progress {
  const topics: TopicSkill[] = TOPICS.map((t) => {
    const mine = attempts.filter((a) => a.topic === t.id);
    const solved = new Set(mine.filter((a) => a.correct).map((a) => a.problemId));
    return {
      id: t.id,
      name: t.name,
      skill: topicSkill(attempts, t.id),
      attempts: mine.length,
      solved: solved.size,
      problems: PROBLEMS.filter((p) => p.topic === t.id).length,
    };
  });

  const tried = topics.filter((t) => t.skill !== null);
  const totalWeight = tried.reduce((s, t) => s + t.attempts, 0);
  const overall =
    totalWeight === 0 ? null : Math.round(tried.reduce((s, t) => s + (t.skill as number) * t.attempts, 0) / totalWeight);

  const weakest = [...tried].sort((a, b) => (a.skill as number) - (b.skill as number))[0];

  const recent20 = attempts.slice(-20);

  const counts = new Map<ErrorTypeId, number>();
  for (const a of attempts) if (a.errorType) counts.set(a.errorType, (counts.get(a.errorType) ?? 0) + 1);
  const mistakes = [...counts.entries()]
    .map(([type, count]) => ({ type, label: ERROR_TYPES[type].label, category: ERROR_TYPES[type].category, count }))
    .sort((a, b) => b.count - a.count);
  const categories = ERROR_CATEGORIES.map((category) => ({
    category,
    count: mistakes.filter((m) => m.category === category).reduce((s, m) => s + m.count, 0),
  })).filter((c) => c.count > 0);

  // last 14 days, oldest first
  const trend: Progress['trend'] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const todays = attempts.filter((a) => day(a.createdAt) === key);
    trend.push({
      date: key,
      attempts: todays.length,
      accuracy: todays.length ? Math.round((todays.filter((a) => a.correct).length / todays.length) * 100) : null,
    });
  }

  // consecutive days with an attempt, ending today (or yesterday)
  const activeDays = new Set(attempts.map((a) => day(a.createdAt)));
  let streakDays = 0;
  const cursor = new Date(now);
  if (!activeDays.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streakDays++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const rated = attempts.filter((a) => a.confidence !== null);
  const calibration = rated.length
    ? (() => {
        const avgConfidence = Math.round(rated.reduce((s, a) => s + (a.confidence as number), 0) / rated.length);
        const accuracy = Math.round((rated.filter((a) => a.correct).length / rated.length) * 100);
        return { avgConfidence, accuracy, gap: avgConfidence - accuracy, n: rated.length };
      })()
    : null;

  const recent = attempts
    .slice(-8)
    .reverse()
    .map((a) => ({
      id: a.id,
      problemId: a.problemId,
      title: getProblem(a.problemId)?.title ?? a.problemId,
      topic: a.topic,
      correct: a.correct,
      passed: a.passed,
      total: a.total,
      errorType: a.errorType,
      createdAt: a.createdAt,
    }));

  return {
    attemptsTotal: attempts.length,
    overall,
    last20: { correct: recent20.filter((a) => a.correct).length, total: recent20.length },
    topics,
    weakestTopic: weakest ? weakest.id : null,
    mistakes,
    categories,
    trend,
    streakDays,
    calibration,
    recent,
    solvedProblemIds: [...new Set(attempts.filter((a) => a.correct).map((a) => a.problemId))],
  };
}
