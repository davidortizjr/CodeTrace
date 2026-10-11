import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarList, ChartCard } from '../components/charts';
import { Card, ErrorNote, PageHeader, Spinner } from '../components/ui';
import { api } from '../lib/api';
import type { Progress } from '../lib/types';

const band = (s: number | null) => (s === null ? 'Not tried' : s >= 80 ? 'Strong' : s >= 60 ? 'Getting there' : 'Needs work');

export default function Skills() {
  const nav = useNavigate();
  const [p, setP] = useState<Progress | null>(null);
  const [err, setErr] = useState('');
  const load = () => {
    setErr('');
    api.progress().then((r) => setP(r.progress)).catch((e) => setErr(e.message));
  };
  useEffect(load, []);

  if (err) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!p) return <Spinner label="Loading your skill map" />;

  const cal = p.calibration;
  const ranked = [...p.topics].sort((a, b) => (a.skill ?? -1) - (b.skill ?? -1));

  return (
    <>
      <PageHeader
        title="Skill map"
        sub="Skill is a weighted score of your last 10 attempts in each topic. A fully solved attempt counts most; a failed one still earns partial credit for the tests it passed."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard
          title="Where you stand"
          sub="Weakest first."
          chart={
            <BarList
              rows={ranked.map((t) => ({
                key: t.id,
                label: t.name,
                sub: band(t.skill),
                value: t.skill,
                text: t.skill === null ? '–' : `${t.skill}%`,
                tip: `${t.name}: ${t.attempts} attempts, ${t.solved} of ${t.problems} problems solved`,
                onClick: () => nav(`/app/practice?topic=${t.id}`),
              }))}
            />
          }
          table={{ head: ['Topic', 'Skill', 'Level', 'Attempts', 'Solved'], rows: ranked.map((t) => [t.name, t.skill === null ? '–' : `${t.skill}%`, band(t.skill), t.attempts, `${t.solved}/${t.problems}`]) }}
        />

        <Card className="self-start p-5">
          <h2 className="text-lg font-bold">Do you know what you know?</h2>
          {cal ? (
            <>
              <p className="mt-1 text-sm text-ink-2">Before each check you can say how sure you are. Over your last {cal.n} rated attempts:</p>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface-2 p-3">
                  <dt className="text-xs text-ink-3">You felt sure</dt>
                  <dd className="font-display text-2xl font-bold tabular-nums">{cal.avgConfidence}%</dd>
                </div>
                <div className="rounded-lg bg-surface-2 p-3">
                  <dt className="text-xs text-ink-3">You were right</dt>
                  <dd className="font-display text-2xl font-bold tabular-nums">{cal.accuracy}%</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-ink">
                {cal.gap > 8
                  ? 'You tend to feel surer than your results justify. Trace one input by hand before you press check.'
                  : cal.gap < -8
                    ? 'You solve more than you expect. Trust your reasoning a little more.'
                    : 'Your confidence matches your results. That is a good sign.'}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-ink-2">Tap “Not sure”, “Fairly sure” or “Certain” before you check a solution. After a few attempts this shows whether your confidence matches your results.</p>
          )}
          <Link to="/app/practice" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
            Browse problems
          </Link>
        </Card>
      </div>
    </>
  );
}
