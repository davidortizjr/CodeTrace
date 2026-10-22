export type TopicId = string;
export type Lang = 'js' | 'ts';
export type ProblemMode = 'run' | 'types';

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
  group: 'course' | 'problem-solving';
  lang: Lang;
}

export interface ProblemListItem {
  id: string;
  topic: TopicId;
  title: string;
  difficulty: 1 | 2 | 3;
  concept: string;
  lang: Lang;
  mode: ProblemMode;
  lessonId: string | null;
  solved: boolean;
  tried: boolean;
}

export interface Problem {
  id: string;
  topic: TopicId;
  lang: Lang;
  mode: ProblemMode;
  lessonId: string | null;
  lessonTitle: string | null;
  checkLabels: string[];
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

export interface TypeError {
  line: number;
  col: number;
  code: number;
  message: string;
}

export interface Analysis {
  kind?: 'run' | 'types';
  typeErrors?: TypeError[];
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

// ── Course ──────────────────────────────────────────────────────────────

export interface Best {
  score: number;
  total: number;
}

export type LessonStatus = 'new' | 'started' | 'done';

export interface CourseLesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  checks: Best | null;
  exercises: { solved: number; total: number };
  status: LessonStatus;
}

export interface CourseUnit {
  id: string;
  title: string;
  blurb: string;
  lessons: CourseLesson[];
  lessonsDone: number;
  exam: { questions: number; best: Best | null; passed: boolean };
}

export interface CourseTrack {
  id: Lang;
  title: string;
  blurb: string;
  units: CourseUnit[];
  lessonsDone: number;
  lessonsTotal: number;
  final: { questions: number; best: Best | null; passed: boolean; ready: boolean };
}

export interface CourseResponse {
  tracks: CourseTrack[];
  next: { lessonId: string; title: string } | null;
  passMark: number;
}

export interface LessonExample {
  id: string;
  lang: 'js' | 'ts' | 'json' | 'bash' | 'text';
  code: string;
  caption?: string;
  file?: string;
  run?: boolean;
  output?: string[];
  runtimeError?: string;
  errors?: { code: number; line: number }[];
  diagnostics?: { line: number; code: number; message: string }[];
}

export interface LessonSection {
  heading: string;
  body: string[];
  examples?: LessonExample[];
  notes?: { kind: 'tip' | 'watch-out' | 'in-js' | 'in-ts'; text: string }[];
}

export interface LessonResponse {
  id: string;
  unitId: string;
  unitTitle: string;
  track: Lang;
  title: string;
  summary: string;
  minutes: number;
  objectives: string[];
  sections: LessonSection[];
  recap: string[];
  checkCount: number;
  exercises: { id: string; title: string; difficulty: 1 | 2 | 3; lang: Lang; mode: ProblemMode; concept: string; solved: boolean; tried: boolean }[];
  progress: { checks: Best | null; exercises: { solved: number; total: number }; status: LessonStatus };
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
  examId: string;
}

export interface RunResponse {
  output: string[];
  outputCut: boolean;
  error: { name: string; message: string; line?: number } | null;
  syntaxError: { message: string; line?: number } | null;
  diagnostics: { line: number; col: number; code: number; message: string }[];
  internal: boolean;
}

export interface QuizQuestion {
  id: string;
  kind: 'mcq' | 'short';
  prompt: string;
  code?: { lang: 'js' | 'ts'; text: string };
  options?: { id: number; text: string }[];
  placeholder?: string;
}

export interface QuizResponse {
  scope: string;
  title: string;
  exam: boolean;
  passMark: number;
  items: QuizQuestion[];
}

export interface QuizResult {
  scope: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean | null;
  passMark: number;
  previousBest: Best | null;
  items: { id: string; correct: boolean; given: string | null; answerText: string; explanation: string; review?: string }[];
  review: { id: string; title: string }[];
}
