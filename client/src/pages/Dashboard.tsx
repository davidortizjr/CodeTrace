import { ArrowRight, Check, Flame, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarList, ChartCard, TrendChart } from '../components/charts';
import { Card, ErrorNote, PageHeader, Pill, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { shortDate, timeAgo } from '../lib/format';
import type { CourseResponse, Progress, User } from '../lib/types';

export default function Dashboard() {
  const nav = useNavigate();
  const [data, setData] = useState<{ user: User; progress: Progress } | null>(null);
  const [err, setErr] = useState('');
  const [next, setNext] = useState<{ id: string; title: string; reason: string } | null>(null);
  const [course, setCourse] = useState<CourseResponse | null>(null);

  const load = () => {
    setErr('');
    api.progress().then(setData).catch((e) => setErr(e.message));
    api.next('weak').then(setNext).catch(() => {});
    api.course().then(setCourse).catch(() => {});
  };
  useEffect(load, []);

  if (err) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!data) return <Spinner label="Loading your progress" />;
  const { user, progress: p } = data;

  if (p.attemptsTotal === 0) {
    return (
      <>
        <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} sub="Learn JavaScript and TypeScript here, and practise what you learn. This page fills in with your skills, mistakes and progress." />
        <ContinueCard course={course} />
        <Card className="mt-4 p-6">
          <h2 className="text-lg font-bold">Start with a warm-up</h2>
          <p className="mt-1 text-ink-2">Sum of evens takes about five minutes and shows you how the step trace works.</p>
          <Link to="/app/problem/sum-evens" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink hover:brightness-110">
            Open the first problem <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
      </>
    );
  }

  const topMistakes = p.mistakes.slice(0, 3);
  const cal = p.calibration;

  return (
    <>
      <PageHeader
        title={`Hi ${user.name.split(' ')[0]}`}
        sub={
          p.weakestTopic
            ? `Your weakest topic right now is ${p.topics.find((t) => t.id === p.weakestTopic)?.name.toLowerCase()}.`
            : 'Here is where you stand.'
        }
      />

      <div className="mb-4">
        <ContinueCard course={course} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Overall skill" value={p.overall === null ? '–' : `${p.overall}%`} note={`${p.attemptsTotal} attempts`} />
        <Stat label="Last 20 attempts" value={`${p.last20.correct} / ${p.last20.total}`} note="solved first try or after fixing" />
        <Stat
          label="Practice streak"
          value={
            <span className="inline-flex items-center gap-1.5">
              {p.streakDays} {p.streakDays === 1 ? 'day' : 'days'}
              {p.streakDays > 1 && <Flame className="size-5 text-warn" aria-hidden />}
            </span>
          }
          note={p.streakDays > 0 ? 'in a row' : 'practise today to start one'}
        />
        <Stat
          label="Confidence vs results"
          value={cal ? (cal.gap > 8 ? 'Overconfident' : cal.gap < -8 ? 'Underconfident' : 'Well calibrated') : '–'}
          small
          note={cal ? `You said ${cal.avgConfidence}% sure and were right ${cal.accuracy}% of the time` : 'rate your confidence before you check'}
        />
      </div>

      {next && (
        <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 border-accent/40 bg-accent-soft p-5">
          <div className="min-w-0">
            <div className="text-sm font-medium text-accent">Recommended next</div>
            <div className="text-lg font-bold font-display">{next.title}</div>
            <div className="text-sm text-ink-2">{next.reason}</div>
          </div>
          <button
            type="button"
            onClick={() => nav(`/app/problem/${next.id}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink hover:brightness-110"
          >
            Start <ArrowRight className="size-4" aria-hidden />
          </button>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Skill by topic"
          sub="Recent attempts count most. Pick a topic to practise it."
          chart={
            <BarList
              rows={p.topics.map((t) => ({
                key: t.id,
                label: t.name,
                sub: `${t.solved}/${t.problems} solved`,
                value: t.skill,
                text: t.skill === null ? 'not tried' : `${t.skill}%`,
                tip: `${t.name}: ${t.skill === null ? 'not tried yet' : `${t.skill}% skill`}, ${t.attempts} attempts`,
                onClick: () => nav(`/app/practice?topic=${t.id}`),
              }))}
            />
          }
          table={{ head: ['Topic', 'Skill', 'Attempts', 'Solved'], rows: p.topics.map((t) => [t.name, t.skill === null ? '–' : `${t.skill}%`, t.attempts, `${t.solved}/${t.problems}`]) }}
        />
        <ChartCard
          title="Accuracy, last 14 days"
          sub="Share of attempts that passed every test."
          chart={<TrendChart points={p.trend} />}
          table={{
            head: ['Day', 'Accuracy', 'Attempts'],
            rows: p.trend.filter((t) => t.attempts > 0).map((t) => [shortDate(t.date), `${t.accuracy}%`, t.attempts]),
          }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent attempts</h2>
          </div>
          <ul className="divide-y divide-line">
            {p.recent.map((r) => (
              <li key={r.id}>
                <Link to={`/app/problem/${r.problemId}`} className="flex items-center gap-3 py-2.5 hover:bg-surface-2">
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full ${r.correct ? 'bg-ok-soft text-ok' : 'bg-flag-soft text-flag'}`}>
                    {r.correct ? <Check className="size-3.5" aria-label="Passed" /> : <X className="size-3.5" aria-label="Failed" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{r.title}</span>
                    <span className="block text-xs text-ink-3">
                      {r.passed}/{r.total} tests · {timeAgo(r.createdAt)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Mistakes you repeat</h2>
            <Link to="/app/mistakes" className="text-sm font-medium text-accent hover:underline">
              See all
            </Link>
          </div>
          {topMistakes.length === 0 ? (
            <p className="text-ink-2">No mistakes recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {topMistakes.map((m) => (
                <li key={m.type} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{m.label}</div>
                    <div className="text-sm text-ink-3">{m.category}</div>
                  </div>
                  <Pill tone="flag">{m.count}×</Pill>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={async () => {
              try {
                const n = await api.next('mistake', { type: topMistakes[0]?.type });
                nav(`/app/problem/${n.id}`);
              } catch {
                nav('/app/practice');
              }
            }}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            Practise my most common mistake <ArrowRight className="size-4" aria-hidden />
          </button>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, note, small }: { label: string; value: React.ReactNode; note: string; small?: boolean }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-ink-3">{label}</div>
      <div className={small ? 'mt-1 font-display text-xl font-bold' : 'mt-1 font-display text-3xl font-bold tabular-nums'}>{value}</div>
      <div className="mt-1 text-xs text-ink-3">{note}</div>
    </Card>
  );
}

function ContinueCard({ course }: { course: CourseResponse | null }) {
  if (!course) return null;
  const done = course.tracks.reduce((n, t) => n + t.lessonsDone, 0);
  const total = course.tracks.reduce((n, t) => n + t.lessonsTotal, 0);
  return (
    <Card className="flex flex-wrap items-center gap-4 p-5">
      <div className="min-w-0 flex-1">
        <div className="text-sm text-ink-3">
          {course.next ? (done === 0 ? 'The course' : `Course progress: ${done} of ${total} lessons`) : 'Course complete'}
        </div>
        <h2 className="text-lg font-bold">{course.next ? (done === 0 ? 'Start with the first lesson' : `Continue: ${course.next.title}`) : 'You finished every lesson'}</h2>
        <div className="mt-2 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label="Course progress">
          <div className="h-full rounded-full bg-accent" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
      </div>
      <Link
        to={course.next ? `/app/course/${course.next.lessonId}` : '/app/exams'}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink hover:brightness-110"
      >
        {course.next ? (done === 0 ? 'Start lesson 1' : 'Continue') : 'Go to the exams'}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Card>
  );
}
