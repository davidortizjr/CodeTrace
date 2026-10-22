import { runJobs } from '../engine/sandbox.js';
import { stripTypes, typecheck, type TsDiagnostic } from '../engine/typescript.js';
import type { CodeLang } from './types.js';

export interface RunResult {
  /** Lines the code printed. */
  output: string[];
  outputCut: boolean;
  /** The error the run ended with, if any. */
  error?: { name: string; message: string; line?: number; timedOut?: boolean };
  /** The code could not be parsed. Nothing ran. */
  syntaxError?: { message: string; line?: number };
  /** TypeScript only: errors from the type checker. They do not stop the code from running. */
  diagnostics: TsDiagnostic[];
  /** The checker itself failed. */
  internal?: boolean;
}

/** Runs a snippet the way the lessons do: TypeScript is checked and then run with its types removed. */
export async function runSnippet(lang: CodeLang, code: string): Promise<RunResult> {
  let js = code;
  let diagnostics: TsDiagnostic[] = [];
  if (lang === 'ts') {
    diagnostics = typecheck(code).diagnostics;
    const syn = diagnostics.find((d) => d.syntactic);
    if (syn) return { output: [], outputCut: false, syntaxError: { message: syn.message, line: syn.line }, diagnostics };
    const st = stripTypes(code);
    if (!st.ok) return { output: [], outputCut: false, syntaxError: { message: st.message }, diagnostics };
    js = st.code;
  }
  const [res] = await runJobs([{ code: js, fn: '', argsList: [], script: true }], 5000);
  if (res.phase === 'internal' || res.phase === 'timeout') {
    return {
      output: [],
      outputCut: false,
      diagnostics,
      internal: res.phase === 'internal',
      error: { name: 'Timeout', message: 'The code ran for too long and was stopped.', timedOut: true },
    };
  }
  if (res.phase === 'compile') {
    return { output: [], outputCut: false, diagnostics, syntaxError: { message: res.compileError?.message ?? 'Syntax error', line: res.compileError?.line } };
  }
  return { output: res.output ?? [], outputCut: res.outputCut === true, error: res.uncaught, diagnostics };
}
