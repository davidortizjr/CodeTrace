import { ArrowRight, Check, ChevronDown, Flag, Lightbulb, MessageCircle, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { CONFIDENCE_NOTE, cn } from '../lib/format';
import type { AnalyzeResponse, Level, Problem } from '../lib/types';
import { Button, Card, Pill, Prose } from './ui';

const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: 'quick', label: 'Quick', hint: 'Two or three sentences' },
  { id: 'standard', label: 'Standard', hint: 'What, why, and what to change' },
  { id: 'deep', label: 'Deep', hint: 'Walk through your own trace' },
];

const ERROR_TITLES: Record<string, string> = {
  syntax: 'Your code has a syntax error',
  runtime: 'Your code crashed',
  timeout: 'Your code ran forever',
  'missing-function': 'The function was not found',
  internal: 'The checker had a problem',
};

export function ResultPanel({
  problem,
  result,
  drillNext,
}: {
  problem: Problem;
  result: AnalyzeResponse;
  drillNext?: { id: string; position: string } | null;
}) {
  const { analysis: a, attemptId, next } = result;
  const m = a.mistake;
  const d = a.divergence;
  const correct = a.verdict === 'correct';
  const types = a.kind === 'types';
  const noun = types ? 'checks' : 'tests';
  const typeTrouble = !correct && a.passed === a.total && !!m && a.verdict === 'incorrect';

  return (
    <div className="space-y-4" aria-live="polite">
      {/* Verdict */}
      <Card className={cn('flex flex-wrap items-center gap-3 p-4', correct ? 'border-ok/40 bg-ok-soft' : a.verdict === 'error' ? 'border-flag/40 bg-flag-soft' : '')}>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', correct ? 'bg-ok text-white' : 'bg-flag text-white dark:text-black')} aria-hidden>
          {correct ? <Check className="size-5" /> : <X className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">
            {correct
              ? `All ${noun} pass`
              : a.error
                ? (ERROR_TITLES[a.error.kind] ?? 'Something went wrong')
                : typeTrouble
                  ? `The ${noun} pass, but TypeScript is not satisfied`
                  : `${a.passed} of ${a.total} ${noun} pass`}
          </h2>
          <p className="text-sm text-ink-2">
            {correct
              ? types
                ? `Your types for "${problem.title}" were accepted and rejected exactly where they should be.`
                : `Your solution to "${problem.title}" does what the problem asks, on ${a.total} inputs including the edge cases.`
              : a.error
                ? a.error.message + (a.error.line ? ` (line ${a.error.line})` : '')
                : typeTrouble
                  ? 'Your code behaves correctly, but it does not type-check in strict mode, or it uses any.'
                  : "You're close. Here's the part that needs fixing."}
          </p>
        </div>
        <Pill tone={correct ? 'ok' : 'neutral'}>
          {a.passed}/{a.total}
        </Pill>
      </Card>

      {/* Mistake */}
      {m && !correct && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="flag">{m.category}</Pill>
            <h3 className="text-lg font-bold">{m.label}</h3>
          </div>
          <dl className="mt-3 space-y-3 text-[15px]">
            <div>
              <dt className="text-sm font-medium text-ink-3">Why it happens</dt>
              <dd className="text-ink">{m.why}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-ink-3">How to fix it</dt>
              <dd className="text-ink">{m.fix}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-ink-3">
            {CONFIDENCE_NOTE[m.confidence]}
            {m.line ? ` Line ${m.line} is marked in your code.` : ''}
          </p>
        </Card>
      )}

      {a.typeErrors && a.typeErrors.length > 0 && (
        <Card className="p-5">
          <h3 className="text-lg font-bold">What the TypeScript compiler says</h3>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {a.typeErrors.slice(0, 6).map((e, i) => (
              <li key={i} className="rounded-lg bg-surface-2 px-3 py-2 font-mono">
                <span className="text-flag">
                  line {e.line}:{e.col}
                </span>{' '}
                · TS{e.code}: {e.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* First wrong step */}
      {d && (
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Flag className="size-4 text-flag" aria-hidden />
            <h3 className="text-lg font-bold">The first step that went wrong</h3>
          </div>
          <div className="prose-ct mt-2">
            <Prose text={d.summary} />
          </div>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <SeqRow label="A correct run" values={d.expectedSeq} />
            <SeqRow label="Your run" values={d.gotSeq} bad />
          </div>
          {problem.traceText && <p className="mt-2 text-xs text-ink-3">Traced with the input {problem.traceText}.</p>}
        </Card>
      )}

      {/* Trace table */}
      {a.trace && a.trace.rows.length > 0 && (
        <details className="group rounded-xl border border-line bg-surface" open={!!d}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span className="text-base font-bold font-display">Step-by-step trace of your code</span>
            <ChevronDown className="size-4 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="trace-table w-full min-w-[420px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-ink-3">
                  <th className="py-1.5 pl-3 pr-3 font-medium">Step</th>
                  <th className="py-1.5 pr-3 font-medium">Line</th>
                  {a.trace.columns.map((c) => (
                    <th key={c} className="py-1.5 pr-3 font-mono font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {a.trace.rows.map((r) => (
                  <tr key={r.step} className={cn('border-b border-line/60 last:border-0', r.flag && 'flagged')}>
                    <td className="py-1.5 pl-3 pr-3 tabular-nums text-ink-2">
                      {r.flag ? (
                        <span className="inline-flex items-center gap-1 font-medium text-flag">
                          <Flag className="size-3" aria-hidden />
                          {r.step}
                          <span className="sr-only"> first wrong step</span>
                        </span>
                      ) : (
                        r.step
                      )}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums text-ink-2">
                      {r.line}
                      {r.kind === 'enter' && <span className="ml-1 text-ink-3">start</span>}
                      {r.kind === 'return' && <span className="ml-1 text-ink-3">return</span>}
                    </td>
                    {a.trace!.columns.map((c) => (
                      <td key={c} className={cn('py-1.5 pr-3 font-mono', r.flag && c === d?.variable ? 'font-medium text-flag' : 'text-ink')}>
                        {r.vars[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {(a.trace.omittedBefore > 0 || a.trace.truncated) && (
              <p className="mt-2 text-xs text-ink-3">
                {a.trace.omittedBefore > 0 && `${a.trace.omittedBefore} earlier steps are hidden. `}
                {a.trace.truncated && 'Later steps are hidden too.'}
              </p>
            )}
          </div>
        </details>
      )}

      {!correct && attemptId && <Explain attemptId={attemptId} problemId={problem.id} questions={m?.ask ?? []} />}

      <Tests tests={a.tests} defaultOpen={!correct && a.tests.length > 0} types={types} />

      {/* Next */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="text-sm text-ink-3">{drillNext ? `Drill ${drillNext.position}` : 'Up next'}</div>
          <div className="font-medium">
            {drillNext ? 'Continue with the next drill problem' : next ? next.title : 'Pick any problem to keep going'}
          </div>
          {!drillNext && next && <div className="text-sm text-ink-2">{next.reason}</div>}
        </div>
        <Link
          to={drillNext ? `/app/problem/${drillNext.id}` : next ? `/app/problem/${next.id}` : '/app/practice'}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink hover:brightness-110"
        >
          {correct ? 'Next problem' : next ? 'Practice this next' : 'Browse problems'}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Card>
    </div>
  );
}

function SeqRow({ label, values, bad }: { label: string; values: string[]; bad?: boolean }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2', bad ? 'border-flag/40 bg-flag-soft' : 'border-line bg-surface-2')}>
      <div className={cn('text-xs font-medium', bad ? 'text-flag' : 'text-ink-3')}>{label}</div>
      <div className="mt-0.5 break-words font-mono text-[13px] text-ink">{values.length ? values.join('  →  ') : '(no changes)'}</div>
    </div>
  );
}

function Explain({ attemptId, problemId, questions }: { attemptId: string; problemId: string; questions: string[] }) {
  const [level, setLevel] = useState<Level | null>(null);
  const [cache, setCache] = useState<Partial<Record<Level, { text: string; source: 'gemini' | 'engine' }>>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [shown, setShown] = useState(0);

  const load = async (l: Level) => {
    setLevel(l);
    setErr('');
    if (cache[l]) return;
    setBusy(true);
    try {
      const r = await api.explain(attemptId, l);
      setCache((c) => ({ ...c, [l]: r }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load the explanation.');
    } finally {
      setBusy(false);
    }
  };
  const current = level ? cache[level] : undefined;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-accent" aria-hidden />
        <h3 className="text-lg font-bold">Explain it to me</h3>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Explanation depth">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            title={l.hint}
            onClick={() => load(l.id)}
            aria-pressed={level === l.id}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              level === l.id ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong text-ink-2 hover:bg-surface-2',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
      {busy && <p className="mt-3 text-sm text-ink-2">Writing the explanation…</p>}
      {err && <p className="mt-3 text-sm text-flag">{err}</p>}
      {current && !busy && (
        <div className="mt-4 rounded-lg bg-surface-2 p-4">
          <Prose text={current.text} />
          <p className="mt-3 text-xs text-ink-3">
            {current.source === 'gemini'
              ? 'Written by Gemini from the checker’s findings. The checker, not the AI, decided what is wrong.'
              : 'Built-in explanation from the checker’s findings.'}
          </p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-warn" aria-hidden />
            <h4 className="font-medium">Guide me with questions</h4>
          </div>
          {shown === 0 ? (
            <Button className="mt-2" onClick={() => setShown(1)}>
              Give me a first question
            </Button>
          ) : (
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[15px]">
              {questions.slice(0, shown).map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          )}
          {shown > 0 && shown < questions.length && (
            <Button className="mt-2" onClick={() => setShown(shown + 1)}>
              Another question
            </Button>
          )}
        </div>
      )}

      <div className="mt-4">
        <Link to={`/app/coach?problem=${problemId}&attempt=${attemptId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
          <MessageCircle className="size-4" aria-hidden />
          Talk it through with the coach
        </Link>
      </div>
    </Card>
  );
}

function Tests({ tests, defaultOpen, types }: { tests: AnalyzeResponse['analysis']['tests']; defaultOpen: boolean; types: boolean }) {
  if (tests.length === 0) return null;
  const failed = tests.filter((t) => !t.pass).length;
  return (
    <details className="group rounded-xl border border-line bg-surface" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
        <span className="font-display text-base font-bold">
          {types ? 'Check results' : 'Test results'}
          <span className="ml-2 text-sm font-normal text-ink-3">{failed === 0 ? 'all passed' : `${failed} failed`}</span>
        </span>
        <ChevronDown className="size-4 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ul className="divide-y divide-line border-t border-line">
        {tests.map((t) => (
          <li key={t.id} className={cn('grid gap-x-4 gap-y-1 px-4 py-2.5 text-[13px] sm:grid-cols-[28px_1fr]', !t.pass && 'bg-flag-soft/50')}>
            <span className={cn('mt-0.5 grid size-5 place-items-center rounded-full', t.pass ? 'bg-ok-soft text-ok' : 'bg-flag-soft text-flag')}>
              {t.pass ? <Check className="size-3" aria-label="passed" /> : <X className="size-3" aria-label="failed" />}
            </span>
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-x-2">
                {types ? <span className="text-ink">{t.args}</span> : <span className="font-mono text-ink">input: {t.args}</span>}
                {!types && <span className="text-xs text-ink-3">{t.cat === 'edge' ? 'edge case' : t.cat === 'large' ? 'large input' : 'typical'}</span>}
              </div>
              {!t.pass && (
                <>
                  {!types && <div className="break-words font-mono text-ink-2">expected: {t.expected}</div>}
                  <div className="break-words font-mono text-flag">{types ? t.got : `got: ${t.got}`}</div>
                  {t.note && <div className="text-flag">{t.note}</div>}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
