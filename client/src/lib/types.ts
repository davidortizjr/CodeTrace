export type TopicId = 'loops' | 'arrays' | 'strings' | 'logic' | 'objects' | 'recursion';

export interface User {
  id: string;
  name: string;
  email?: string;
  demo: boolean;
}

export interface Topic {
  id: TopicId;
  name: string;
  blurb: string;
}

export interface ProblemListItem {
  id: string;
  topic: TopicId;
  title: string;
  difficulty: 1 | 2 | 3;
  concept: string;
  solved: boolean;
  tried: boolean;
}

export interface Problem {
  id: string;
  topic: TopicId;
  topicName: string;
  title: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  concept: string;
  fn: string;
  starter: string;
  traceText: string;
  examples: { args: unknown[]; argsText: string; expected: string }[];
}

export interface TestOutcome {
  id: number;
  cat: 'basic' | 'edge' | 'large';
  args: string;
  expected: string;
  got: string;
  pass: boolean;
  note?: string;
}

export interface Mistake {
  type: string;
  label: string;
  category: string;
  confidence: 'exact' | 'likely' | 'heuristic' | 'generic';
  why: string;
  fix: string;
  ask: string[];
  line?: number;
  detail?: string;
}

export interface Divergence {
  variable: string;
  expectedVariable: string;
  step: number;
  line: number;
  expected: string | null;
  got: string | null;
  expectedSeq: string[];
  gotSeq: string[];
  summary: string;
}

export interface TraceRow {
  step: number;
  line: number;
  kind: string;
  vars: Record<string, string>;
  flag?: boolean;
}

export interface Analysis {
  verdict: 'correct' | 'incorrect' | 'error';
  passed: number;
  total: number;
  tests: TestOutcome[];
  error?: { kind: string; message: string; line?: number };
  mistake?: Mistake;
  divergence?: Divergence;
  trace?: { columns: string[]; rows: TraceRow[]; omittedBefore: number; truncated: boolean };
}

export interface AnalyzeResponse {
  attemptId: string | null;
  analysis: Analysis;
  next: { id: string; title: string; reason: string } | null;
}

export interface TopicSkill {
  id: TopicId;
  name: string;
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
  mistakes: { type: string; label: string; category: string; count: number }[];
  categories: { category: string; count: number }[];
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
    errorType: string | null;
    createdAt: string;
  }[];
  solvedProblemIds: string[];
}

export interface MistakesResponse {
  mistakes: Progress['mistakes'];
  categories: Progress['categories'];
  catalog: { id: string; label: string; category: string; why: string; fix: string; ask: string[]; count: number }[];
  recentByType: Record<string, { problemId: string; title: string; at: string }[]>;
}

export interface Attempt {
  id: string;
  problemId: string;
  topic: TopicId;
  correct: boolean;
  passed: number;
  total: number;
  errorType: string | null;
  code: string;
  analysis: Analysis | null;
  createdAt: string;
}

export type Level = 'quick' | 'standard' | 'deep';
