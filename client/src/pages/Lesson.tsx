import { ArrowLeft, ArrowRight, Check, Clock, Lightbulb, ListChecks, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExampleBlock } from '../components/ExampleBlock';
import { RichText } from '../components/RichText';
import { Card, Difficulty, ErrorNote, Pill, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { cn } from '../lib/format';
import type { LessonResponse } from '../lib/types';

const NOTE: Record<string, { label: string; icon: typeof Lightbulb; cls: string }> = {
  tip: { label: 'Tip', icon: Lightbulb, cls: 'border-accent/30 bg-accent-soft' },
  'watch-out': { label: 'Watch out', icon: TriangleAlert, cls: 'border-warn/40 bg-warn-soft' },
  'in-js': { label: 'In JavaScript', icon: Lightbulb, cls: 'border-line bg-surface-2' },
  'in-ts': { label: 'In TypeScript', icon: Lightbulb, cls: 'border-line bg-surface-2' },
};

export default function Lesson() {
  const { id = '' } = useParams();
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [err, setErr] = useState('');

  const load = () => {
    setErr('');
    setLesson(null);
    api.lesson(id).then(setLesson).catch((e) => setErr(e.message));
  };
  useEffect(load, [id]);
  useEffect(() => window.scrollTo(0, 0), [id]);

  if (err) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!lesson) return <Spinner label="Loading the lesson" />;

  const lang = lesson.track === 'ts' ? 'TypeScript' : 'JavaScript';

  return (
    <article className="mx-auto max-w-[760px]">
      <Link to={`/app/course?track=${lesson.track}`} className="text-sm text-ink-3 hover:text-ink">
        ← Course
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Pill tone="accent">{lang}</Pill>
        <span className="text-sm text-ink-3">{lesson.unitTitle}</span>
        <span className="inline-flex items-center gap-1 text-sm text-ink-3">
          <Clock className="size-3.5" aria-hidden />
          {lesson.minutes} min
        </span>
      </div>
      <h1 className="mt-2 text-[32px] font-bold leading-tight">{lesson.title}</h1>
      <p className="mt-1 text-lg text-ink-2">{lesson.summary}</p>

      <Card className="mt-6 p-5">
        <h2 className="text-base font-bold">After this lesson you can</h2>
        <ul className="mt-2 space-y-1.5">
          {lesson.objectives.map((o) => (
            <li key={o} className="flex gap-2 text-[15px]">
              <Check className="mt-1 size-4 shrink-0 text-ok" aria-hidden />
              <span>
                <RichText text={o} />
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {lesson.sections.map((s) => (
        <section key={s.heading} className="mt-10" aria-labelledby={`h-${s.heading}`}>
          <h2 id={`h-${s.heading}`} className="text-2xl font-bold">
            {s.heading}
          </h2>
          <div className="mt-2 space-y-3 text-[16px] leading-relaxed">
            {s.body.map((p, i) => (
              <p key={i}>
                <RichText text={p} />
              </p>
            ))}
          </div>
          {s.examples?.map((ex) => <ExampleBlock key={ex.id} ex={ex} />)}
          {s.notes?.map((n, i) => {
            const meta = NOTE[n.kind];
            const Icon = meta.icon;
            return (
              <aside key={i} className={cn('my-4 flex gap-3 rounded-lg border px-4 py-3 text-[15px]', meta.cls)}>
                <Icon className="mt-0.5 size-4 shrink-0 text-ink-2" aria-hidden />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">{meta.label}</div>
                  <RichText text={n.text} />
                </div>
              </aside>
            );
          })}
        </section>
      ))}

      <Card className="mt-10 p-5">
        <h2 className="text-xl font-bold">Recap</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px]">
          {lesson.recap.map((r) => (
            <li key={r}>
              <RichText text={r} />
            </li>
          ))}
        </ul>
      </Card>

      <section className="mt-10" aria-labelledby="practice">
        <h2 id="practice" className="text-2xl font-bold">
          Check yourself
        </h2>
        <Card className="mt-3 flex flex-wrap items-center gap-4 p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <ListChecks className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold">Quick quiz</h3>
            <p className="text-sm text-ink-2">
              {lesson.checkCount} short questions with an explanation for each.
              {lesson.progress.checks ? ` Best: ${lesson.progress.checks.score}/${lesson.progress.checks.total}.` : ''}
            </p>
          </div>
          <Link to={`/app/quiz/lesson/${lesson.id}`} className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink hover:brightness-110">
            {lesson.progress.checks ? 'Try again' : 'Start the quiz'}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>

        <h3 className="mb-2 mt-6 text-lg font-bold">
          Exercises
          <span className="ml-2 text-sm font-normal text-ink-3">
            {lesson.progress.exercises.solved} of {lesson.progress.exercises.total} solved
          </span>
        </h3>
        <p className="mb-3 text-sm text-ink-2">
          {lesson.track === 'ts'
            ? 'Your code is checked by the real TypeScript compiler in strict mode. When something fails, CodeTrace points at the exact line.'
            : 'Your code is run on typical inputs and edge cases, and when it fails CodeTrace shows the exact step where it went wrong.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {lesson.exercises.map((e) => (
            <Link key={e.id} to={`/app/problem/${e.id}`} className="group block">
              <Card className="h-full p-4 transition-colors group-hover:border-accent/60 group-hover:bg-surface-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold">{e.title}</h4>
                  {e.solved ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 text-xs font-medium text-ok">
                      <Check className="size-3" aria-hidden />
                      Solved
                    </span>
                  ) : e.tried ? (
                    <span className="shrink-0 rounded-full bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn">In progress</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-ink-2">{e.concept}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Difficulty level={e.difficulty} />
                  {e.mode === 'types' && <Pill tone="neutral">Types only</Pill>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <nav aria-label="Lesson navigation" className="mt-12 flex flex-wrap justify-between gap-3 border-t border-line pt-5">
        {lesson.prev ? (
          <Link to={`/app/course/${lesson.prev.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden />
            {lesson.prev.title}
          </Link>
        ) : (
          <span />
        )}
        {lesson.next ? (
          <Link to={`/app/course/${lesson.next.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
            {lesson.next.title}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <Link to="/app/course" className="text-sm font-medium text-accent hover:underline">
            Back to the course
          </Link>
        )}
      </nav>
    </article>
  );
}
