import type { ErrorTypeId } from '../engine/errors.js';

export type CourseTopicId =
  | 'js-foundations'
  | 'js-flow'
  | 'js-data'
  | 'js-modern'
  | 'ts-basics'
  | 'ts-shapes'
  | 'ts-generics'
  | 'ts-real';

export type TopicId = 'loops' | 'arrays' | 'strings' | 'logic' | 'objects' | 'recursion' | CourseTopicId;

export type Lang = 'js' | 'ts';
/** run: call a function with test inputs. types: the TypeScript compiler is the test. */
export type ProblemMode = 'run' | 'types';

export interface Topic {
  id: TopicId;
  name: string;
  blurb: string;
  /** Where the topic is shown: the course units, or the stand-alone problem-solving sets. */
  group: 'course' | 'problem-solving';
  lang: Lang;
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

/** A hidden snippet appended to the student's types. The program must compile with it included. */
export interface TypeCheck {
  /** What is being checked, in words the student can read. */
  label: string;
  /** Code placed in its own block after the student's code. `// @ts-expect-error` lines assert that TypeScript rejects something. */
  code: string;
  cat: TestCategory;
}

export interface Problem {
  id: string;
  topic: TopicId;
  /** Default 'js'. TypeScript problems are type-checked in strict mode and then run with the types removed. */
  lang?: Lang;
  /** Default 'run'. */
  mode?: ProblemMode;
  /** Lesson this exercise belongs to, if any. */
  lesson?: string;
  /** types mode: the checks that make up the tests. */
  typeChecks?: TypeCheck[];
  /** TypeScript only: permit `any` and ts-ignore comments. Off by default. */
  allowAny?: boolean;
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
  lang: Lang;
  mode: ProblemMode;
  lessonId: string | null;
  lessonTitle: string | null;
  /** types mode: what will be checked. */
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
