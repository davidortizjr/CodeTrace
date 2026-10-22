import { randomUUID } from 'node:crypto';
import { seedAttempts, seedResults } from './seed.js';
import type { Attempt, AttemptSummary, NewAttempt, NewQuizResult, QuizResult, Store } from './types.js';

const summarize = ({ userId: _u, code: _c, analysis: _a, ...rest }: Attempt): AttemptSummary => rest;

/** Used for the demo account and whenever Supabase is not configured. Lives and dies with the process. */
export class MemoryStore implements Store {
  private data = new Map<string, Attempt[]>();
  private results = new Map<string, QuizResult[]>();

  constructor(
    private seedFor: (userId: string) => Attempt[] = () => [],
    private seedResultsFor: (userId: string) => QuizResult[] = () => [],
  ) {}

  private resultRows(userId: string): QuizResult[] {
    let rows = this.results.get(userId);
    if (!rows) {
      rows = this.seedResultsFor(userId);
      this.results.set(userId, rows);
    }
    return rows;
  }

  private rows(userId: string): Attempt[] {
    let rows = this.data.get(userId);
    if (!rows) {
      rows = this.seedFor(userId);
      this.data.set(userId, rows);
    }
    return rows;
  }

  async add(a: NewAttempt): Promise<Attempt> {
    const attempt: Attempt = { ...a, id: randomUUID(), createdAt: a.createdAt ?? new Date().toISOString() };
    this.rows(a.userId).push(attempt);
    return attempt;
  }

  async list(userId: string): Promise<AttemptSummary[]> {
    return this.rows(userId).map(summarize);
  }

  async get(userId: string, id: string): Promise<Attempt | null> {
    return this.rows(userId).find((a) => a.id === id) ?? null;
  }

  async addResult(r: NewQuizResult): Promise<QuizResult> {
    const result: QuizResult = { ...r, id: randomUUID(), createdAt: r.createdAt ?? new Date().toISOString() };
    this.resultRows(r.userId).push(result);
    return result;
  }

  async listResults(userId: string): Promise<QuizResult[]> {
    return [...this.resultRows(userId)];
  }

  async reset(userId: string): Promise<void> {
    this.data.set(userId, this.seedFor(userId));
    this.results.set(userId, this.seedResultsFor(userId));
  }
}

export const demoSeed = (userId: string) => seedAttempts(userId);
export const demoResultsSeed = (userId: string) => seedResults(userId);
