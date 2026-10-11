import { SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, PageHeader, Prose } from '../components/ui';
import { api } from '../lib/api';
import { cn } from '../lib/format';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  source?: 'gemini' | 'engine';
}

const STARTERS = ['Give me a small hint.', 'What should I check first?', 'Why does my code pass some tests but not all?'];

export default function Coach() {
  const [params] = useSearchParams();
  const problemId = params.get('problem') ?? undefined;
  const attemptId = params.get('attempt') ?? undefined;
  const [title, setTitle] = useState<string>('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [aiOn, setAiOn] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.status().then((s) => setAiOn(s.ai)).catch(() => setAiOn(null));
  }, []);
  useEffect(() => {
    if (!problemId) return setTitle('');
    api.problem(problemId).then((p) => setTitle(p.title)).catch(() => setTitle(''));
  }, [problemId]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, busy]);

  const send = async (content: string) => {
    const clean = content.trim();
    if (!clean || busy) return;
    const next: Msg[] = [...msgs, { role: 'user', content: clean }];
    setMsgs(next);
    setText('');
    setBusy(true);
    setErr('');
    try {
      const r = await api.coach({
        problemId,
        attemptId,
        messages: next.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      });
      setMsgs([...next, { role: 'assistant', content: r.text, source: r.source }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'The coach could not answer.');
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(text);
  };

  return (
    <>
      <PageHeader
        title="Coach"
        sub={
          title
            ? `Talking about “${title}”. The coach has the checker’s findings for your last attempt and guides you with questions instead of giving the answer.`
            : 'Ask about a concept or a stuck problem. Open the coach from a failed attempt to share that attempt with it.'
        }
      />

      {aiOn === false && (
        <p className="mb-4 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink-2">
          The Gemini coach is not connected on this server, so you will get the checker’s built-in guidance. Add <code>GEMINI_API_KEY</code> to the server environment to turn it on.
        </p>
      )}

      <Card className="flex min-h-[420px] flex-col">
        <div className="flex-1 space-y-4 p-5" aria-live="polite">
          {msgs.length === 0 && (
            <div>
              <p className="text-ink-2">Try one of these, or ask your own question.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-ink-2 hover:bg-surface-2">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5', m.role === 'user' ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink')}>
                {m.role === 'user' ? <p className="whitespace-pre-wrap">{m.content}</p> : <Prose text={m.content} />}
                {m.role === 'assistant' && m.source && (
                  <p className="mt-2 text-xs text-ink-3">{m.source === 'gemini' ? 'Gemini' : 'Built-in guidance'}</p>
                )}
              </div>
            </div>
          ))}
          {busy && <p className="text-sm text-ink-3">The coach is thinking…</p>}
          {err && <p role="alert" className="text-sm text-flag">{err}</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-line p-3">
          <label className="sr-only" htmlFor="coach-input">
            Message the coach
          </label>
          <textarea
            id="coach-input"
            value={text}
            maxLength={2000}
            rows={2}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send(text);
              }
            }}
            placeholder="What are you stuck on?"
            className="min-h-[44px] flex-1 resize-none rounded-lg border border-line-strong bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-3"
          />
          <Button type="submit" variant="primary" busy={busy} disabled={!text.trim()} aria-label="Send">
            <SendHorizontal className="size-4" aria-hidden />
            Send
          </Button>
        </form>
      </Card>
    </>
  );
}
