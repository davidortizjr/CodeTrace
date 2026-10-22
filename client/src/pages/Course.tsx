import { ArrowRight, Check, Clock, GraduationCap, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, ErrorNote, PageHeader, Pill, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { cn } from '../lib/format';
import type { Best, CourseResponse, CourseTrack, LessonStatus } from '../lib/types';

const pct = (b: Best | null) => (b ? `${Math.round((b.score / b.total) * 100)}%` : null);

export function StatusDot({ status }: { status: LessonStatus }) {
  return (
    <span
      className={cn(
        'grid size-6 shrink-0 place-items-center rounded-full border text-xs',
        status === 'done' && 'border-ok bg-ok text-white',
        status === 'started' && 'border-warn bg-warn-soft text-warn',
        status === 'new' && 'border-line-strong bg-surface text-ink-3',
      )}
    >
      {status === 'done' ? <Check className="size-3.5" aria-label="Done" /> : status === 'started' ? <span aria-label="In progress">…</span> : <span className="sr-only">Not started</span>}
    </span>
  );
}

function TrackView({ track, passMark }: { track: CourseTrack; passMark: number }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-ink-2">{track.blurb}</p>
        <Pill tone="neutral">
          {track.lessonsDone} of {track.lessonsTotal} lessons done
        </Pill>
      </div>

      {track.units.map((u, ui) => (
        <Card key={u.id} className="overflow-hidden">
          <div className="border-b border-line p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-ink-3">
              Unit {ui + 1}
            </div>
            <h2 className="text-xl font-bold">{u.title}</h2>
            <p className="mt-0.5 text-ink-2">{u.blurb}</p>
          </div>
          <ol className="divide-y divide-line">
            {u.lessons.map((l, li) => (
              <li key={l.id}>
                <Link to={`/app/course/${l.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2">
                  <StatusDot status={l.status} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      <span className="mr-1.5 text-ink-3">{li + 1}.</span>
                      {l.title}
                    </div>
                    <div className="text-sm text-ink-2">{l.summary}</div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-3 text-xs text-ink-3 sm:flex">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden />
                      {l.minutes} min
                    </span>
                    <span>
                      {l.exercises.solved}/{l.exercises.total} exercises
                    </span>
                    {l.checks && <span>quiz {pct(l.checks)}</span>}
                  </div>
                </Link>
              </li>
            ))}
            <li>
              <Link to={`/app/quiz/unit/${u.id}`} className="flex items-center gap-3 bg-surface-2/50 px-5 py-3.5 transition-colors hover:bg-surface-2">
                <span className={cn('grid size-6 shrink-0 place-items-center rounded-full', u.exam.passed ? 'bg-ok text-white' : 'bg-accent-soft text-accent')}>
                  {u.exam.passed ? <Check className="size-3.5" aria-label="Passed" /> : <GraduationCap className="size-3.5" aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">Unit exam</div>
                  <div className="text-sm text-ink-2">
                    {u.exam.questions} questions, {Math.round(passMark * 100)}% to pass.
                    {u.exam.best ? ` Best: ${u.exam.best.score}/${u.exam.best.total}.` : ''}
                  </div>
                </div>
                <ArrowRight className="size-4 text-ink-3" aria-hidden />
              </Link>
            </li>
          </ol>
        </Card>
      ))}

      <FinalCard track={track} passMark={passMark} />
    </div>
  );
}

export function FinalCard({ track, passMark }: { track: CourseTrack; passMark: number }) {
  return (
    <Card className="flex flex-wrap items-center gap-4 p-5">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', track.final.passed ? 'bg-ok text-white' : 'bg-accent-soft text-accent')}>
        <Trophy className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold">{track.title} final exam</h2>
        <p className="text-sm text-ink-2">
          {track.final.questions} questions drawn from every unit, {Math.round(passMark * 100)}% to pass.
          {track.final.best ? ` Best: ${track.final.best.score}/${track.final.best.total}.` : ''}
          {!track.final.ready && ' Take at least one attempt at each unit exam first.'}
        </p>
      </div>
      <Link
        to={`/app/quiz/final/${track.id}`}
        aria-disabled={!track.final.ready}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium',
          track.final.ready ? 'bg-accent text-accent-ink hover:brightness-110' : 'pointer-events-none bg-surface-2 text-ink-3',
        )}
      >
        {track.final.best ? 'Take it again' : 'Start the final exam'}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Card>
  );
}

export default function Course() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<CourseResponse | null>(null);
  const [err, setErr] = useState('');
  const load = () => {
    setErr('');
    api.course().then(setData).catch((e) => setErr(e.message));
  };
  useEffect(load, []);

  if (err) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!data) return <Spinner label="Loading the course" />;

  const trackId = params.get('track') ?? (data.next?.lessonId.startsWith('ts-') ? 'ts' : 'js');
  const track = data.tracks.find((t) => t.id === trackId) ?? data.tracks[0];

  return (
    <>
      <PageHeader
        title="Course"
        sub="Learn the syntax of JavaScript, then TypeScript. Each lesson has examples you can run, a short quiz and exercises that CodeTrace checks step by step."
        action={
          data.next && (
            <Link to={`/app/course/${data.next.lessonId}`} className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink hover:brightness-110">
              Continue: {data.next.title}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )
        }
      />
      <div className="mb-6 inline-flex overflow-hidden rounded-lg border border-line-strong" role="tablist" aria-label="Track">
        {data.tracks.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={track.id === t.id}
            onClick={() => setParams({ track: t.id })}
            className={cn('border-r border-line-strong px-4 py-2 text-sm font-medium last:border-r-0', track.id === t.id ? 'bg-accent-soft text-accent' : 'bg-surface text-ink-2 hover:bg-surface-2')}
          >
            {t.title}
            <span className="ml-2 text-xs font-normal text-ink-3">
              {t.lessonsDone}/{t.lessonsTotal}
            </span>
          </button>
        ))}
      </div>
      <TrackView track={track} passMark={data.passMark} />
    </>
  );
}
