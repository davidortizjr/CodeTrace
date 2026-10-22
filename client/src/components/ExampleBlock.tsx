import { Pencil, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { cn } from '../lib/format';
import type { LessonExample, RunResponse } from '../lib/types';
import { CodeBlock } from './CodeBlock';
import { Editor } from './Editor';
import { Button } from './ui';

type Diag = { line: number; code: number; message: string };

function Diagnostics({ list }: { list: Diag[] }) {
  if (list.length === 0) return null;
  return (
    <div className="rounded-lg border border-flag/40 bg-flag-soft px-3 py-2 text-[13px]" role="note">
      <div className="mb-1 text-xs font-medium text-flag">TypeScript reports</div>
      <ul className="space-y-1">
        {list.map((d, i) => (
          <li key={i} className="font-mono text-ink">
            <span className="text-flag">line {d.line}</span> · TS{d.code}: {d.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A code sample in a lesson. Runnable ones have a Run button and can be edited. */
export function ExampleBlock({ ex }: { ex: LessonExample }) {
  const lang = ex.lang;
  const runnable = (lang === 'js' || lang === 'ts') && ex.run !== false;
  const [code, setCode] = useState(ex.code);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RunResponse | null>(null);
  const [err, setErr] = useState('');

  if (!runnable) return <CodeBlock code={ex.code} lang={lang === 'js' || lang === 'ts' ? lang : lang} file={ex.file} caption={ex.caption} />;

  const edited = code !== ex.code;
  const staticDiags = ex.diagnostics ?? [];
  const flagLines = (result ? result.diagnostics : staticDiags).map((d) => d.line);

  const run = async () => {
    setBusy(true);
    setErr('');
    try {
      setResult(await api.run(lang as 'js' | 'ts', code));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not run this.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="my-4 space-y-2">
      {editing ? (
        <div>
          {ex.file && <div className="mono mb-1 text-xs text-ink-2">{ex.file}</div>}
          <Editor lang={lang as 'js' | 'ts'} value={code} onChange={setCode} onSubmit={run} minHeight="120px" />
        </div>
      ) : (
        <CodeBlock code={code} lang={lang as 'js' | 'ts'} file={ex.file} caption={ex.caption} flagLines={flagLines} />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={run} busy={busy} className="!py-1.5">
          <Play className="size-4" aria-hidden />
          Run
        </Button>
        {!editing ? (
          <Button variant="ghost" onClick={() => setEditing(true)} className="!py-1.5">
            <Pencil className="size-4" aria-hidden />
            Edit
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)} className="!py-1.5">
            Done editing
          </Button>
        )}
        {edited && (
          <Button
            variant="ghost"
            onClick={() => {
              setCode(ex.code);
              setResult(null);
            }}
            className="!py-1.5"
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset
          </Button>
        )}
        {editing && <span className="text-xs text-ink-3">Ctrl+Enter runs it</span>}
      </div>
      {err && <p className="text-sm text-flag">{err}</p>}
      {!result && !edited && <Diagnostics list={staticDiags} />}
      {result && <Output result={result} lang={lang as 'js' | 'ts'} />}
    </div>
  );
}

function Output({ result, lang }: { result: RunResponse; lang: 'js' | 'ts' }) {
  const failed = result.syntaxError || result.error;
  return (
    <div className="space-y-2" aria-live="polite">
      <div className={cn('rounded-lg border px-3 py-2', failed ? 'border-flag/40' : 'border-line', 'bg-surface-2')}>
        <div className="mb-1 text-xs font-medium text-ink-3">Output</div>
        {result.output.length > 0 ? (
          <pre className="mono overflow-x-auto whitespace-pre-wrap break-words text-[13px] leading-relaxed text-ink">{result.output.join('\n')}</pre>
        ) : (
          <p className="text-[13px] text-ink-3">{failed ? 'Nothing was printed.' : 'Nothing was printed. Use console.log to see a value.'}</p>
        )}
        {result.outputCut && <p className="mt-1 text-xs text-ink-3">The output was cut short.</p>}
      </div>
      {result.syntaxError && (
        <p className="text-sm text-flag">
          Syntax error{result.syntaxError.line ? ` on line ${result.syntaxError.line}` : ''}: {result.syntaxError.message}
        </p>
      )}
      {result.error && (
        <p className="text-sm text-flag">
          {result.error.name}: {result.error.message}
          {result.error.line ? ` (line ${result.error.line})` : ''}
        </p>
      )}
      {result.internal && <p className="text-sm text-flag">The runner had a problem. Try again in a moment.</p>}
      {lang === 'ts' && <Diagnostics list={result.diagnostics} />}
    </div>
  );
}
