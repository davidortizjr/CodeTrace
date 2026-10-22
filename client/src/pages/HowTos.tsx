import { ArrowRight, Check, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { guides, pathName, pathSummary } from '../content/howtos';
import { Card, PageHeader, Pill } from '../components/ui';
import { useHowtoProgress } from '../lib/howto-progress';

export default function HowTos() {
  const { doneIds } = useHowtoProgress();
  const total = guides.reduce((n, g) => n + g.steps.length, 0);
  const done = guides.reduce((n, g) => n + g.steps.filter((s) => doneIds(g.slug).includes(s.id)).length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const minutes = guides.reduce((n, g) => n + g.minutes, 0);
  const next = guides.find((g) => g.steps.some((s) => !doneIds(g.slug).includes(s.id)));

  return (
    <>
      <PageHeader title="Projects" sub="An optional track once you are comfortable with JavaScript: build a full-stack app with React, Express and PostgreSQL, step by step. Every code block in these guides was run and tested together." />

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-prose">
            <h2 className="text-xl font-bold">{pathName}</h2>
            <p className="mt-1 text-ink-2">{pathSummary}</p>
            <p className="mt-2 text-sm text-ink-3">
              {guides.length} guides · about {minutes} minutes in total
            </p>
          </div>
          {next && (
            <Link
              to={`/app/howtos/${next.slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink hover:brightness-110"
            >
              {done === 0 ? 'Start with guide 1' : 'Continue where you left off'}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-ink-2">Your progress</span>
            <span className="tabular-nums text-ink-2">
              {done} of {total} steps
            </span>
          </div>
          <div className="h-2.5 w-full rounded-r-[4px] bg-line/70" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Overall progress">
            <div className="h-full rounded-r-[4px] bg-series transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-ink-3">Saved in this browser only.</p>
        </div>
      </Card>

      <ol className="grid gap-3 md:grid-cols-2">
        {guides.map((g, i) => {
          const n = g.steps.filter((s) => doneIds(g.slug).includes(s.id)).length;
          const complete = n === g.steps.length;
          return (
            <li key={g.slug}>
              <Link
                to={`/app/howtos/${g.slug}`}
                className="group flex h-full flex-col rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={
                      'mono grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold ' +
                      (complete ? 'bg-ok-soft text-ok' : 'bg-accent-soft text-accent')
                    }
                    aria-hidden
                  >
                    {complete ? <Check className="size-4" /> : i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-bold">
                      <span className="sr-only">Guide {i + 1}: </span>
                      {g.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-2">{g.summary}</p>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                  <Pill tone={g.level === 'Beginner' ? 'ok' : 'accent'}>{g.level}</Pill>
                  <span className="inline-flex items-center gap-1 text-xs text-ink-3">
                    <Clock className="size-3.5" aria-hidden />
                    {g.minutes} min
                  </span>
                  <span className="ml-auto text-xs tabular-nums text-ink-3">
                    {complete ? 'Done' : n > 0 ? `${n} of ${g.steps.length} steps` : `${g.steps.length} steps`}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
