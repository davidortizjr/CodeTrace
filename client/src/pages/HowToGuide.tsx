import { ArrowLeft, ArrowRight, Check, Clock, RotateCcw } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { RequestFlow } from '../components/RequestFlow';
import { RichText } from '../components/RichText';
import { Card, Pill } from '../components/ui';
import { guides } from '../content/howtos';
import { getCode } from '../content/howtos/code-loader';
import type { Block } from '../content/howtos/types';
import { cn } from '../lib/format';
import { useHowtoProgress } from '../lib/howto-progress';

const textOf = (b: Block) => (b.ref ? getCode(b.ref) : (b.code ?? ''));

export default function HowToGuide() {
  const { slug = '' } = useParams();
  const { doneIds, toggle, reset } = useHowtoProgress();
  const index = guides.findIndex((g) => g.slug === slug);
  if (index < 0) return <Navigate to="/app/howtos" replace />;

  const g = guides[index];
  const prev = guides[index - 1];
  const next = guides[index + 1];
  const done = doneIds(g.slug);
  const count = g.steps.filter((s) => done.includes(s.id)).length;
  const pct = Math.round((count / g.steps.length) * 100);

  return (
    <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-10">
      <article className="min-w-0">
        <Link to="/app/howtos" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> All projects
        </Link>

        <header className="mb-6 mt-3">
          <p className="mono text-xs text-ink-3">
            Guide {index + 1} of {guides.length}
          </p>
          <h1 className="mt-1 text-[28px] font-bold">{g.title}</h1>
          <p className="mt-2 max-w-prose text-ink-2">{g.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill tone={g.level === 'Beginner' ? 'ok' : 'accent'}>{g.level}</Pill>
            <span className="inline-flex items-center gap-1 text-xs text-ink-3">
              <Clock className="size-3.5" aria-hidden />
              {g.minutes} min
            </span>
            {g.tags.map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
          </div>
        </header>

        <Card className="mb-6 grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-3">You will end up with</h2>
            <p className="mt-1.5 text-[15px]">{g.goal}</p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-3">Before you start</h2>
            <ul className="mt-1.5 space-y-1 text-[15px]">
              {g.youNeed.map((n) => (
                <li key={n}>
                  <RichText text={n} />
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {g.diagram === 'request-flow' && (
          <div className="mb-8">
            <RequestFlow />
          </div>
        )}

        <ol className="space-y-9">
          {g.steps.map((s, i) => {
            const isDone = done.includes(s.id);
            return (
              <li key={s.id} id={s.id} className="scroll-mt-24">
                <div className="flex items-start gap-3">
                  <span className="mono mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent" aria-hidden>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold">{s.title}</h2>
                    <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink">
                      {s.body.map((p, k) => (
                        <p key={k} className="max-w-prose">
                          <RichText text={p} />
                        </p>
                      ))}
                    </div>
                    {s.blocks?.map((b, k) => (
                      <CodeBlock key={k} code={textOf(b)} lang={b.lang} file={b.file} caption={b.caption} />
                    ))}
                    {s.check && (
                      <div className="mt-3 flex gap-2.5 rounded-lg border border-ok/30 bg-ok-soft px-3.5 py-2.5 text-sm text-ink">
                        <Check className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />
                        <p>
                          <span className="font-semibold text-ok">Check it works. </span>
                          <RichText text={s.check} />
                        </p>
                      </div>
                    )}
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-ink-2">
                      <input type="checkbox" checked={isDone} onChange={() => toggle(g.slug, s.id)} className="size-4 accent-[var(--accent)]" />
                      Mark step {i + 1} done
                    </label>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {g.troubleshooting.length > 0 && (
          <section className="mt-12" aria-labelledby="ts-h">
            <h2 id="ts-h" className="text-xl font-bold">
              If something goes wrong
            </h2>
            <p className="mt-1 text-sm text-ink-2">Find the message you see. Each one lists what causes it and how to fix it.</p>
            <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {g.troubleshooting.map((t) => (
                <details key={t.problem} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-[15px] font-medium hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">{t.problem}</span>
                    <span className="mt-1 shrink-0 text-ink-3 transition-transform group-open:rotate-90" aria-hidden>
                      <ArrowRight className="size-4" />
                    </span>
                  </summary>
                  <div className="space-y-2 border-t border-line bg-surface-2 px-4 py-3 text-[15px]">
                    <p>
                      <span className="font-semibold">Cause. </span>
                      <RichText text={t.cause} />
                    </p>
                    <p>
                      <span className="font-semibold">Fix. </span>
                      <RichText text={t.fix} />
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12" aria-labelledby="learned-h">
          <h2 id="learned-h" className="text-xl font-bold">
            What you learned
          </h2>
          <ul className="mt-3 space-y-2">
            {g.learned.map((l) => (
              <li key={l} className="flex gap-2.5 text-[15px]">
                <Check className="mt-1 size-4 shrink-0 text-ok" aria-hidden />
                <span>
                  <RichText text={l} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="Guide navigation" className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
          {prev ? (
            <Link to={`/app/howtos/${prev.slug}`} className="rounded-xl border border-line bg-surface p-4 hover:bg-surface-2">
              <span className="flex items-center gap-1.5 text-xs text-ink-3">
                <ArrowLeft className="size-3.5" aria-hidden /> Previous
              </span>
              <span className="mt-1 block font-display font-bold">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/app/howtos/${next.slug}`} className="rounded-xl border border-line bg-surface p-4 text-right hover:bg-surface-2">
              <span className="flex items-center justify-end gap-1.5 text-xs text-ink-3">
                Next <ArrowRight className="size-3.5" aria-hidden />
              </span>
              <span className="mt-1 block font-display font-bold">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>

      <aside className="mt-10 hidden lg:mt-0 lg:block">
        <div className="sticky top-9">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-3">In this guide</h2>
          <ol className="mt-3 space-y-1 border-l border-line">
            {g.steps.map((s, i) => {
              const isDone = done.includes(s.id);
              return (
                <li key={s.id}>
                  <a href={`#${s.id}`} className={cn('-ml-px block border-l-2 py-1 pl-3 text-sm', isDone ? 'border-ok text-ink-2' : 'border-transparent text-ink-2 hover:border-line-strong hover:text-ink')}>
                    <span className="mono mr-1.5 text-xs text-ink-3">{i + 1}</span>
                    {s.title}
                  </a>
                </li>
              );
            })}
          </ol>
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-ink-2">
              <span>Progress</span>
              <span className="tabular-nums">
                {count} of {g.steps.length}
              </span>
            </div>
            <div className="h-2 w-full rounded-r-[4px] bg-line/70" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress in this guide">
              <div className="h-full rounded-r-[4px] bg-series transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
            {count > 0 && (
              <button type="button" onClick={() => reset(g.slug)} className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink">
                <RotateCcw className="size-3.5" aria-hidden /> Reset this guide
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
