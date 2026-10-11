import { Check, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Difficulty, ErrorNote, PageHeader, Pill, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { readDrill, writeDrill, type DrillState } from '../lib/drill';
import type { Topic } from '../lib/types';

type Item = { id: string; title: string; topic: string; difficulty: number };

export default function Drill() {
  const nav = useNavigate();
  const [items, setItems] = useState<Item[] | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [drill, setDrill] = useState<DrillState | null>(readDrill());
  const [err, setErr] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const load = () => {
    setErr('');
    Promise.all([api.drill(), api.problems()])
      .then(([d, p]) => {
        setItems(d.problems);
        setTopics(p.topics);
      })
      .catch((e) => setErr(e.message));
  };
  useEffect(load, []);

  useEffect(() => {
    if (!drill) return;
    const tick = () => setElapsed(Math.floor((Date.now() - drill.startedAt) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [drill]);

  if (err) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!items) return <Spinner label="Building your drill" />;

  const start = () => {
    const d: DrillState = { ids: items.map((i) => i.id), done: [], startedAt: Date.now() };
    writeDrill(d);
    setDrill(d);
    nav(`/app/problem/${d.ids[0]}`);
  };

  const active = drill && drill.ids.length > 0 ? drill : null;
  const list: Item[] = active ? active.ids.map((id) => items.find((i) => i.id === id) ?? { id, title: id, topic: '', difficulty: 1 }) : items;
  const finished = !!active && active.done.length >= active.ids.length;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const nextId = active?.ids.find((id) => !active.done.includes(id));

  return (
    <>
      <PageHeader
        title="5-minute drill"
        sub="Five short problems from your two weakest topics, easiest first. Solve them back to back and see where you land."
        action={
          active && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-sm tabular-nums" role="timer" aria-label="Elapsed time">
              <Timer className="size-4 text-ink-3" aria-hidden />
              {mm}:{ss}
            </div>
          )
        }
      />

      {finished && (
        <Card className="mb-4 border-ok/40 bg-ok-soft p-5">
          <h2 className="text-lg font-bold">Drill complete in {mm}:{ss}</h2>
          <p className="text-sm text-ink-2">All five solved. Start a new one to get a fresh set based on your updated skills.</p>
        </Card>
      )}

      <ol className="space-y-3">
        {list.map((p, i) => {
          const done = active?.done.includes(p.id);
          const topic = topics.find((t) => t.id === p.topic)?.name;
          return (
            <li key={p.id}>
              <Link to={`/app/problem/${p.id}`} className="group block">
                <Card className="flex items-center gap-4 p-4 transition-colors group-hover:border-accent/60 group-hover:bg-surface-2">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${done ? 'bg-ok text-white dark:text-black' : 'bg-surface-2 text-ink-2 ring-1 ring-line'}`}>
                    {done ? <Check className="size-4" aria-label="Done" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{p.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2">
                      {topic && <Pill tone="neutral">{topic}</Pill>}
                      <Difficulty level={p.difficulty as 1 | 2 | 3} />
                    </span>
                  </span>
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap gap-3">
        {active && !finished && nextId ? (
          <>
            <Button variant="primary" onClick={() => nav(`/app/problem/${nextId}`)}>
              Continue the drill
            </Button>
            <Button onClick={start}>Restart with a fresh set</Button>
          </>
        ) : (
          <Button variant="primary" onClick={start}>
            {finished ? 'Start another drill' : 'Start the drill'}
          </Button>
        )}
      </div>
    </>
  );
}
