import type { ErrorTypeId } from '../engine/errors.js';

export type TopicId = 'loops' | 'arrays' | 'strings' | 'logic' | 'objects' | 'recursion';

export interface Topic {
  id: TopicId;
  name: string;
  blurb: string;
}

/** A known wrong implementation. The engine runs it to learn its fingerprint. */
export interface Variant {
  id: string;
  type: ErrorTypeId;
  label: string;
  why: string;
  fix: string;
  ask: string[];
  code: string;
}

export type TestCategory = 'basic' | 'edge' | 'large';

export interface TestCase {
  /** JSON-serialisable arguments. */
  args: unknown[];
  cat: TestCategory;
}

export interface Problem {
  id: string;
  topic: TopicId;
  title: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  /** One sentence on the idea the problem practises. */
  concept: string;
  fn: string;
  starter: string;
  reference: string;
  tests: TestCase[];
  /** The single input used for step-by-step tracing. */
  traceArgs: unknown[];
  /** Variables in the reference whose value history the student's is compared with. */
  track: string[];
  variants: Variant[];
}

export interface PublicProblem {
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
