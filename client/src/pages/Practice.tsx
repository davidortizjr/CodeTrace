import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Difficulty, ErrorNote, PageHeader, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { cn } from '../lib/format';
import type { ProblemListItem, Topic } from '../lib/types';

export default function Practice() {
  const [params, setParams] = useSearchParams();
  const topic = params.get('topic') ?? 'all';
  const [data, setData] = useState<{ topics: Topic[]; problems: ProblemListItem[] } | null>(null);
  const [err, setErr] = useState('');

  const load = () => {
    setErr('');
    api.problems().then(setData).catch((e) => setErr(e.message));
  };
  useEffect(load, []);

  if (err) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!data) return <Spinner label="Loading problems" />;

  const shown = data.topics.filter((t) => topic === 'all' || t.id === topic);
  const solved = data.problems.filter((p) => p.solved).length;

  return (
    <>
      <PageHeader title="Practice" sub={`${solved} of ${data.problems.length} problems solved. Every problem is checked on typical inputs, edge cases and a large input.`} />

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
        {[{ id: 'all', name: 'All topics' }, ...data.topics].map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={topic === t.id}
            onClick={() => setParams(t.id === 'all' ? {} : { topic: t.id })}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              topic === t.id ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong bg-surface text-ink-2 hover:bg-surface-2',
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {shown.map((t) => (
          <section key={t.id} aria-labelledby={`topic-${t.id}`}>
            <h2 id={`topic-${t.id}`} className="text-xl font-bold">
              {t.name}
            </h2>
            <p className="mb-3 text-ink-2">{t.blurb}</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.problems
                .filter((p) => p.topic === t.id)
                .map((p) => (
                  <Link key={p.id} to={`/app/problem/${p.id}`} className="group block">
                    <Card className="h-full p-4 transition-colors group-hover:border-accent/60 group-hover:bg-surface-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold">{p.title}</h3>
                        {p.solved ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 text-xs font-medium text-ok">
                            <Check className="size-3" aria-hidden />
                            Solved
                          </span>
                        ) : p.tried ? (
                          <span className="shrink-0 rounded-full bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn">In progress</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-ink-2">{p.concept}</p>
                      <div className="mt-3">
                        <Difficulty level={p.difficulty} />
                      </div>
                    </Card>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
