/**
 * The shape of the JavaScript and TypeScript course.
 *
 *   Unit
 *    ├─ Lesson   reading, runnable examples, a short "check yourself" quiz, and exercises
 *    ├─ exam     the unit exam: fixed questions, taken after the lessons
 *    └─ bonus    extra questions that only appear in the track's final exam
 *
 * Quiz answers stay on the server. The client receives questions without answers
 * and the server grades every submission.
 */

export type Track = 'js' | 'ts';
export type CodeLang = 'js' | 'ts';

export type UnitId =
  | 'js-foundations'
  | 'js-flow'
  | 'js-data'
  | 'js-modern'
  | 'ts-basics'
  | 'ts-shapes'
  | 'ts-generics'
  | 'ts-real';

export interface Example {
  /** Unique within its lesson. */
  id: string;
  /** js and ts are executed or type-checked. The others are shown only. */
  lang: CodeLang | 'json' | 'bash' | 'text';
  code: string;
  caption?: string;
  /** Shown above the code, for example `tsconfig.json`. */
  file?: string;
  /**
   * false: an illustrative fragment that is never run (imports, config, shell commands).
   * Everything else is run by the course test and must behave exactly as declared here.
   */
  run?: boolean;
  /** Lines the code prints. Required whenever the code prints anything. Checked against a real run. */
  output?: string[];
  /** The example is meant to end with this error, as "Name: message" (a substring is enough). */
  runtimeError?: string;
  /** TypeScript examples: the compiler errors the example is meant to show. Absent means it must compile cleanly. */
  errors?: { code: number; line: number }[];
}

export interface Note {
  kind: 'tip' | 'watch-out' | 'in-js' | 'in-ts';
  text: string;
}

export interface Section {
  heading: string;
  /** Paragraphs. `inline code` and **bold** are rendered. */
  body: string[];
  examples?: Example[];
  notes?: Note[];
}

// ── Quiz ────────────────────────────────────────────────────────────────

/** How the course test proves a question's answer is right, by running the code in the item. */
export type Verify =
  /** Run `code`. What it prints (lines joined by a space) must equal the correct answer. */
  | { kind: 'output' }
  /** The TypeScript `code` must compile cleanly. */
  | { kind: 'compiles' }
  /** The TypeScript `code` must report an error on this line (and optionally this error code). */
  | { kind: 'ts-error'; line: number; code?: number }
  /** Running `code` must throw an error whose "Name: message" contains this text. */
  | { kind: 'throws'; message: string };

interface QuizBase {
  /** `<lesson-id>.c1`, `<unit-id>.e1`, `<unit-id>.b1`. Unique across the course. */
  id: string;
  prompt: string;
  code?: { lang: CodeLang; text: string };
  /** Shown after answering: why the right answer is right. */
  explanation: string;
  /** Lesson to revisit when this one is missed. */
  review?: string;
  verify?: Verify;
}

export interface McqItem extends QuizBase {
  kind: 'mcq';
  options: string[];
  /** Index into `options`. */
  answer: number;
}

export interface ShortItem extends QuizBase {
  kind: 'short';
  /** Accepted answers. Compared after trimming, collapsing spaces and dropping a trailing semicolon. */
  accept: string[];
  placeholder?: string;
}

export type QuizItem = McqItem | ShortItem;

// ── Lessons and units ───────────────────────────────────────────────────

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  /** "After this lesson you can ..." */
  objectives: string[];
  sections: Section[];
  recap: string[];
  /** 3 short questions shown at the end of the lesson. */
  checks: QuizItem[];
  /** Ids of exercises in the problem bank. */
  exercises: string[];
}

export interface Unit {
  id: UnitId;
  track: Track;
  title: string;
  blurb: string;
  lessons: Lesson[];
  /** The unit exam: 8 questions. */
  exam: QuizItem[];
  /** 4 more questions, used only in the final exam. */
  bonus: QuizItem[];
}
