import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Difficulty, ErrorNote, PageHeader, Pill, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { cn } from '../lib/format';
import type { ProblemListItem, Topic } from '../lib/types';

export default function Practice() {
  const [params, setParams] = useSearchParams();
  const topic = params.get('topic') ?? 'all';
  const lang = params.get('lang') ?? 'all';
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setParams(next);
  };
  const [data, setData] = useState<{ topics: Topic[]; problems: ProblemListItem[] } | null>(null);
  const [err, setErr] = useState('');

  const load = () => {
    setErr('');
    api.problems().then(setData).catch((e) => setErr(e.message));
  };
  useEffect(load, []);

  if (err) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!data) return <Spinner label="Loading problems" />;

  const shown = data.topics.filter((t) => (topic === 'all' || t.id === topic) && (lang === 'all' || t.lang === lang));
  const groups: { id: 'course' | 'problem-solving'; title: string; blurb: string }[] = [
    { id: 'course', title: 'Course exercises', blurb: 'One set per course unit. Each exercise belongs to a lesson.' },
    { id: 'problem-solving', title: 'Problem solving', blurb: 'Stand-alone JavaScript problems for building fluency.' },
  ];
  const solved = data.problems.filter((p) => p.solved).length;

  return (
    <>
      <PageHeader title="Practice" sub={`${solved} of ${data.problems.length} problems solved. JavaScript problems are run on typical inputs, edge cases and a large input. TypeScript ones are also checked by the compiler.`} />

      <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by language">
        {[
          { id: 'all', name: 'All' },
          { id: 'js', name: 'JavaScript' },
          { id: 'ts', name: 'TypeScript' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={lang === t.id}
            onClick={() => setParam('lang', t.id === 'all' ? null : t.id)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              lang === t.id ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong bg-surface text-ink-2 hover:bg-surface-2',
            )}
          >
            {t.name}
          </button>
        ))}
        {topic !== 'all' && (
          <button
            type="button"
            onClick={() => setParam('topic', null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent"
          >
            {data.topics.find((t) => t.id === topic)?.name ?? topic}
            <X className="size-3.5" aria-label="Clear topic filter" />
          </button>
        )}
      </div>

      <div className="space-y-10">
        {groups.map((g) => {
          const topics = shown.filter((t) => t.group === g.id);
          if (topics.length === 0) return null;
          return (
            <div key={g.id}>
              <h2 className="text-2xl font-bold">{g.title}</h2>
              <p className="mb-5 text-ink-2">{g.blurb}</p>
              <div className="space-y-8">
                {topics.map((t) => (
                  <section key={t.id} aria-labelledby={`topic-${t.id}`}>
                    <h3 id={`topic-${t.id}`} className="flex items-center gap-2 text-lg font-bold">
                      {t.name}
                      <Pill tone={t.lang === 'ts' ? 'accent' : 'warn'}>{t.lang === 'ts' ? 'TypeScript' : 'JavaScript'}</Pill>
                    </h3>
                    <p className="mb-3 text-ink-2">{t.blurb}</p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {data.problems
                        .filter((p) => p.topic === t.id)
                        .map((p) => (
                          <Link key={p.id} to={`/app/problem/${p.id}`} className="group block">
                            <Card className="h-full p-4 transition-colors group-hover:border-accent/60 group-hover:bg-surface-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-base font-bold">{p.title}</h4>
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
                              <div className="mt-3 flex items-center gap-3">
                                <Difficulty level={p.difficulty} />
                                {p.mode === 'types' && <Pill tone="neutral">Types only</Pill>}
                              </div>
                            </Card>
                          </Link>
                        ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          );
        })}
        {shown.length === 0 && <p className="text-ink-2">No problems match this filter.</p>}
      </div>
    </>
  );
}
