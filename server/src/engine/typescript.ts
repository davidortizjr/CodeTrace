import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript-classic';
import { transform } from 'sucrase';
import type { ErrorTypeId } from './errors.js';

/**
 * TypeScript support for the checker.
 *
 *  - `typecheck` runs the real TypeScript compiler (in memory, strict mode) and
 *    returns its diagnostics, so "does this type-check?" is the compiler's
 *    answer, never a guess.
 *  - `stripTypes` removes the types so the code can run in the sandbox. It keeps
 *    every line where it was, so line numbers in traces match the student's file.
 *
 * `typescript-classic` is TypeScript 6 installed under another name: the native
 * TypeScript 7 used for building this repo does not ship a JavaScript API yet.
 */

export interface TsDiagnostic {
  line: number;
  col: number;
  code: number;
  message: string;
  /** A parse error (the code is not valid TypeScript), as opposed to a type error. */
  syntactic: boolean;
}

const require = createRequire(import.meta.url);
const libDir = path.dirname(require.resolve('typescript-classic/lib/lib.es2023.d.ts'));
const LIB_FILE = 'lib.es2023.d.ts';

/** What the sandbox provides at runtime. Everything else from the browser or Node is deliberately absent. */
const AMBIENT = `declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  table(data: unknown): void;
};
declare function setTimeout(handler: () => void, ms?: number): number;
declare function clearTimeout(id: number | undefined): void;
`;

const OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  lib: [LIB_FILE],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  moduleDetection: ts.ModuleDetectionKind.Force,
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  types: [],
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
};

const libCache = new Map<string, ts.SourceFile>();

function readLib(fileName: string): string | undefined {
  if (!fileName.startsWith(libDir + path.sep) && !fileName.startsWith(libDir + '/')) return undefined;
  return ts.sys.readFile(fileName);
}

function makeHost(files: Map<string, string>): ts.CompilerHost {
  return {
    getSourceFile(fileName, languageVersion) {
      const text = files.get(fileName);
      if (text !== undefined) return ts.createSourceFile(fileName, text, languageVersion, true);
      const cached = libCache.get(fileName);
      if (cached) return cached;
      const lib = readLib(fileName);
      if (lib === undefined) return undefined;
      const sf = ts.createSourceFile(fileName, lib, languageVersion, true);
      libCache.set(fileName, sf);
      return sf;
    },
    getDefaultLibFileName: () => path.join(libDir, LIB_FILE),
    getDefaultLibLocation: () => libDir,
    writeFile: () => {},
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    fileExists: (f) => files.has(f) || readLib(f) !== undefined,
    readFile: (f) => files.get(f) ?? readLib(f),
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };
}

export interface TypecheckResult {
  diagnostics: TsDiagnostic[];
  /** Number of lines in the checked file; diagnostics beyond the student's own lines belong to appended checks. */
  totalLines: number;
}

const MAIN = '/main.ts';

/** Type-checks a single TypeScript file in strict mode. Takes a few tens of milliseconds once warm. */
export function typecheck(text: string): TypecheckResult {
  const source = text.replace(/\r\n/g, '\n');
  const files = new Map<string, string>([
    [MAIN, source],
    ['/ambient.d.ts', AMBIENT],
  ]);
  const program = ts.createProgram(['/ambient.d.ts', MAIN], OPTIONS, makeHost(files));
  const sf = program.getSourceFile(MAIN)!;
  const syntactic = program.getSyntacticDiagnostics(sf);
  const raw = [...syntactic, ...(syntactic.length ? [] : program.getSemanticDiagnostics(sf))];
  const diagnostics: TsDiagnostic[] = [];
  for (const d of raw) {
    if (d.category !== ts.DiagnosticCategory.Error || d.file?.fileName !== MAIN || d.start === undefined) continue;
    const pos = sf.getLineAndCharacterOfPosition(d.start);
    diagnostics.push({
      line: pos.line + 1,
      col: pos.character + 1,
      code: d.code,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      syntactic: (syntactic as readonly ts.Diagnostic[]).includes(d),
    });
  }
  diagnostics.sort((a, b) => a.line - b.line || a.col - b.col);
  return { diagnostics, totalLines: source.split('\n').length };
}

/** Removes types so the file runs as JavaScript. Line numbers are preserved. */
export function stripTypes(code: string): { ok: true; code: string } | { ok: false; message: string } {
  try {
    return { ok: true, code: transform(code, { transforms: ['typescript'], disableESTransforms: true }).code };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Could not read this TypeScript.' };
  }
}

// ── Rules a typed exercise can enforce on the source ───────────────────────

export interface ForbiddenUse {
  line: number;
  what: string;
}

/** Finds `any`, `@ts-ignore` and friends, which turn the type checker off instead of satisfying it. */
export function findForbidden(code: string): ForbiddenUse[] {
  const sf = ts.createSourceFile('/f.ts', code, ts.ScriptTarget.ES2022, true);
  const out: ForbiddenUse[] = [];
  const lineOf = (pos: number) => sf.getLineAndCharacterOfPosition(pos).line + 1;
  const visit = (node: ts.Node) => {
    if (node.kind === ts.SyntaxKind.AnyKeyword) out.push({ line: lineOf(node.getStart(sf)), what: 'the type `any`' });
    ts.forEachChild(node, visit);
  };
  visit(sf);
  const re = /\/\/\s*@ts-(ignore|nocheck|expect-error)\b|\/\*\s*@ts-(ignore|nocheck|expect-error)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    out.push({ line: lineOf(m.index), what: `a \`@ts-${m[1] ?? m[2]}\` comment` });
  }
  return out.sort((a, b) => a.line - b.line);
}

// ── Mapping compiler error codes to the taxonomy ────────────────────────────

const GROUPS: [ErrorTypeId, number[]][] = [
  ['ts-too-loose', [2578]],
  ['ts-null', [18047, 18048, 18049, 2531, 2532, 2533, 2721, 2722, 2723, 2454, 2564]],
  ['ts-implicit-any', [7005, 7006, 7008, 7010, 7011, 7016, 7019, 7022, 7023, 7031, 7034, 7053]],
  ['ts-unknown-name', [2304, 2552, 2503, 2307, 2693, 2749, 2686, 2580, 2584]],
  ['ts-missing-prop', [2339, 2551, 2741, 2739, 2740, 2353, 2561, 2724, 2554, 2555, 2556, 2557]],
  ['ts-narrowing', [18046, 2365, 2362, 2363, 2367, 2358, 2678, 2349, 2351, 2348]],
  ['ts-mismatch', [2322, 2345, 2769, 2559, 2416, 2420, 2430, 2344, 2314, 2315, 2411, 2375, 2379, 2352, 2820, 2326, 2677]],
];

/** Which kind of mistake a compiler error is. Falls back to a general type error. */
export function classifyTsCode(code: number, syntactic = false): ErrorTypeId {
  if (syntactic) return 'syntax';
  for (const [type, codes] of GROUPS) if (codes.includes(code)) return type;
  return 'ts-other';
}
