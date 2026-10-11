import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarList, ChartCard } from '../components/charts';
import { Button, Card, ErrorNote, PageHeader, Pill, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import type { MistakesResponse } from '../lib/types';

export default function Mistakes() {
  const nav = useNavigate();
  const [data, setData] = useState<MistakesResponse | null>(null);
  const [err, setErr] = useState('');
  const load = () => {
    setErr('');
    api.mistakes().then(setData).catch((e) => setErr(e.message));
  };
  useEffect(load, []);

  const practise = async (type: string) => {
    try {
      const n = await api.next('mistake', { type });
      nav(`/app/problem/${n.id}`);
    } catch {
      nav('/app/practice');
    }
  };

  if (err) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!data) return <Spinner label="Loading your mistake profile" />;

  const seen = data.catalog.filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
  const unseen = data.catalog.filter((c) => c.count === 0);

  return (
    <>
      <PageHeader title="Mistake profile" sub="The same few mistakes cause most wrong answers. These are yours, named by the checker, not guessed by an AI." />

      {seen.length === 0 ? (
        <Card className="p-6 text-ink-2">No mistakes recorded yet. Check a solution that does not pass and they will appear here.</Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="By kind of mistake"
              sub="Number of attempts where each was the main cause."
              chart={
                <BarList
                  max={Math.max(...data.categories.map((c) => c.count))}
                  rows={data.categories
                    .slice()
                    .sort((a, b) => b.count - a.count)
                    .map((c) => ({ key: c.category, label: c.category, value: c.count, text: String(c.count), tip: `${c.category}: ${c.count} attempts` }))}
                />
              }
              table={{ head: ['Category', 'Attempts'], rows: data.categories.map((c) => [c.category, c.count]) }}
            />
            <ChartCard
              title="Most frequent"
              sub="Your top mistakes, specifically."
              chart={
                <BarList
                  max={seen[0].count}
                  rows={seen.slice(0, 6).map((m) => ({ key: m.id, label: m.label, value: m.count, text: `${m.count}×`, tip: `${m.label}: ${m.count} attempts`, onClick: () => document.getElementById(`m-${m.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }))}
                />
              }
              table={{ head: ['Mistake', 'Category', 'Attempts'], rows: seen.map((m) => [m.label, m.category, m.count]) }}
            />
          </div>

          <h2 className="mb-3 mt-8 text-xl font-bold">What each one means</h2>
          <div className="space-y-3">
            {seen.map((m) => (
              <Card key={m.id} className="p-5">
                <div id={`m-${m.id}`} className="scroll-mt-24">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">{m.label}</h3>
                      <Pill tone="neutral">{m.category}</Pill>
                      <Pill tone="flag">{m.count}×</Pill>
                    </div>
                    <Button onClick={() => practise(m.id)}>Practise this</Button>
                  </div>
                  <p className="mt-2 text-[15px]">{m.why}</p>
                  <p className="mt-1 text-[15px] text-ink-2">
                    <span className="font-medium text-ink">Fix: </span>
                    {m.fix}
                  </p>
                  {data.recentByType[m.id]?.length > 0 && (
                    <p className="mt-3 text-sm text-ink-3">
                      Recently on{' '}
                      {data.recentByType[m.id].map((r, i) => (
                        <span key={r.problemId + r.at}>
                          {i > 0 && ', '}
                          <Link to={`/app/problem/${r.problemId}`} className="text-accent hover:underline">
                            {r.title}
                          </Link>{' '}
                          ({shortDate(r.at.slice(0, 10))})
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <details className="group mt-8 rounded-xl border border-line bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between p-4">
          <span className="font-display text-base font-bold">
            Mistakes you have not made yet <span className="ml-1 text-sm font-normal text-ink-3">({unseen.length})</span>
          </span>
          <ChevronDown className="size-4 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <ul className="divide-y divide-line border-t border-line">
          {unseen.map((m) => (
            <li key={m.id} className="px-4 py-3">
              <div className="font-medium">{m.label}</div>
              <div className="text-sm text-ink-2">{m.why}</div>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
