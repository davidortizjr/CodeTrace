import { PROBLEMS, TOPICS } from '../problems/bank.js';
import type { Problem, TopicId } from '../problems/types.js';
import type { AttemptSummary } from '../store/types.js';
import type { ErrorTypeId } from './errors.js';
import { topicSkill } from './scoring.js';

/** Picks what to practise next. Deterministic: no AI involved. */

export interface Pick {
  problemId: string;
  reason: string;
}

const solvedSet = (attempts: AttemptSummary[]) =>
  new Set(attempts.filter((a) => a.correct).map((a) => a.problemId));

const lastAttempted = (attempts: AttemptSummary[], id: string) => {
  const a = [...attempts].reverse().find((x) => x.problemId === id);
  return a ? a.createdAt : '';
};

/** Unsolved first, easiest first; if everything is solved, whichever was practised longest ago. */
function bestIn(candidates: Problem[], attempts: AttemptSummary[]): Problem | undefined {
  const solved = solvedSet(attempts);
  const unsolved = candidates.filter((p) => !solved.has(p.id)).sort((a, b) => a.difficulty - b.difficulty);
  if (unsolved.length) return unsolved[0];
  return [...candidates].sort((a, b) => lastAttempted(attempts, a.id).localeCompare(lastAttempted(attempts, b.id)))[0];
}

export function weakestTopic(attempts: AttemptSummary[]): TopicId {
  const untried = TOPICS.find((t) => !attempts.some((a) => a.topic === t.id));
  if (untried) return untried.id;
  return [...TOPICS].sort((a, b) => (topicSkill(attempts, a.id) ?? 0) - (topicSkill(attempts, b.id) ?? 0))[0].id;
}

export function nextForWeakTopic(attempts: AttemptSummary[], excludeId?: string): Pick {
  const topic = weakestTopic(attempts);
  const pool = PROBLEMS.filter((p) => p.topic === topic && p.id !== excludeId);
  const pick = bestIn(pool, attempts) ?? PROBLEMS[0];
  const name = TOPICS.find((t) => t.id === topic)!.name;
  const tried = attempts.some((a) => a.topic === topic);
  return { problemId: pick.id, reason: tried ? `${name} is your weakest topic right now.` : `You have not tried ${name} yet.` };
}

export function nextForMistake(attempts: AttemptSummary[], type: ErrorTypeId | undefined, excludeId?: string): Pick {
  const target =
    type ??
    (() => {
      const counts = new Map<ErrorTypeId, number>();
      for (const a of attempts) if (a.errorType) counts.set(a.errorType, (counts.get(a.errorType) ?? 0) + 1);
      return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    })();
  if (!target) return nextForWeakTopic(attempts, excludeId);

  const pool = PROBLEMS.filter((p) => p.id !== excludeId && p.variants.some((v) => v.type === target));
  const pick = bestIn(pool, attempts);
  if (!pick) return nextForWeakTopic(attempts, excludeId);
  return { problemId: pick.id, reason: `Another problem where this kind of mistake shows up.` };
}

/** Five problems from the two weakest topics, easiest first. */
export function drillSet(attempts: AttemptSummary[]): string[] {
  const ordered = [...TOPICS].sort(
    (a, b) => (topicSkill(attempts, a.id) ?? -1) - (topicSkill(attempts, b.id) ?? -1),
  );
  const solved = solvedSet(attempts);
  const pool = ordered
    .slice(0, 2)
    .flatMap((t) => PROBLEMS.filter((p) => p.topic === t.id))
    .sort((a, b) => Number(solved.has(a.id)) - Number(solved.has(b.id)) || a.difficulty - b.difficulty);
  const ids = pool.slice(0, 5).map((p) => p.id);
  // top up from anywhere if the two topics did not have five problems
  for (const p of PROBLEMS) {
    if (ids.length >= 5) break;
    if (!ids.includes(p.id)) ids.push(p.id);
  }
  return ids;
}
