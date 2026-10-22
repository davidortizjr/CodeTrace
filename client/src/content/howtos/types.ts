export type Lang = 'js' | 'ts' | 'jsx' | 'sql' | 'bash' | 'json' | 'env' | 'text';

/** Where the verifier runs a command block: the folder that holds `taskboard`, the project root, or one of its two halves. */
export type RunDir = 'parent' | 'root' | 'server' | 'client';

export interface Block {
  lang: Lang;
  /** Path inside the Task Board project, for example `server/src/index.js`. Shown as the file name. */
  file?: string;
  /** Name of a real source file in `./code`. These files are assembled and tested by tools/howto-check. */
  ref?: string;
  /** Inline text, for short commands. */
  code?: string;
  caption?: string;
  run?: RunDir;
}

export interface Step {
  id: string;
  title: string;
  /** Paragraphs. Use `backticks` for inline code. */
  body: string[];
  blocks?: Block[];
  /** What the learner should see if the step worked. */
  check?: string;
}

export interface Symptom {
  problem: string;
  cause: string;
  fix: string;
}

export type Level = 'Beginner' | 'Intermediate';

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  level: Level;
  minutes: number;
  tags: string[];
  /** One sentence: what exists when you finish. */
  goal: string;
  youNeed: string[];
  steps: Step[];
  troubleshooting: Symptom[];
  learned: string[];
  diagram?: 'request-flow';
}
