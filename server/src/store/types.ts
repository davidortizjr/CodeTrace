import type { AnalysisResult } from '../engine/analyze.js';
import type { ErrorTypeId } from '../engine/errors.js';
import type { TopicId } from '../problems/types.js';

/** What the progress screens need. Light enough to list by the hundred. */
export interface AttemptSummary {
  id: string;
  problemId: string;
  topic: TopicId;
  correct: boolean;
  passed: number;
  total: number;
  errorType: ErrorTypeId | null;
  /** The student's own confidence (0–100) before checking, if they gave one. */
  confidence: number | null;
  createdAt: string;
}

export interface Attempt extends AttemptSummary {
  userId: string;
  code: string;
  analysis: AnalysisResult | null;
}

export type NewAttempt = Omit<Attempt, 'id' | 'createdAt'> & { createdAt?: string };

export interface Store {
  add(attempt: NewAttempt): Promise<Attempt>;
  /** Oldest first. */
  list(userId: string): Promise<AttemptSummary[]>;
  get(userId: string, id: string): Promise<Attempt | null>;
  reset?(userId: string): Promise<void>;
}
