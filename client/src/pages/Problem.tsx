import { Camera, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { ResultPanel } from '../components/ResultPanel';
import { Button, Card, Difficulty, ErrorNote, Pill, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { clearDraft, loadDraft, saveDraft } from '../lib/draft';
import { markDrillDone, readDrill } from '../lib/drill';
import { cn } from '../lib/format';
import type { AnalyzeResponse, Problem as ProblemT } from '../lib/types';

const CONFIDENCE = [
  { value: 25, label: 'Not sure' },
  { value: 60, label: 'Fairly sure' },
  { value: 90, label: 'Certain' },
];

export default function ProblemPage() {
  const { id = '' } = useParams();
  const [problem, setProblem] = useState<ProblemT | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [code, setCode] = useState('');
  const [confidence, setConfidence] = useState<number | undefined>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [flagLine, setFlagLine] = useState<number | null>(null);
  const [aiOn, setAiOn] = useState(false);
  const [reading, setReading] = useState(false);
  const [note, setNote] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [drill, setDrill] = useState(readDrill());

  useEffect(() => {
    let live = true;
    setProblem(null);
    setResult(null);
    setFlagLine(null);
    setErr('');
    setNote('');
    setLoadErr('');
    setConfidence(undefined);
    api
      .problem(id)
      .then((p) => {
        if (!live) return;
        setProblem(p);
        setCode(loadDraft(p.id) ?? p.starter);
      })
      .catch((e) => live && setLoadErr(e instanceof Error ? e.message : 'Could not load this problem.'));
    api.status().then((s) => live && setAiOn(s.ai)).catch(() => {});
    setDrill(readDrill());
    return () => {
      live = false;
    };
  }, [id]);

  useEffect(() => {
    if (problem) saveDraft(problem.id, code);
  }, [code, problem]);

  const check = useCallback(async () => {
    if (!problem || busy) return;
    setBusy(true);
    setErr('');
    try {
      const r = await api.analyze(problem.id, code, confidence);
      setResult(r);
      const a = r.analysis;
      setFlagLine(a.divergence?.line ?? a.mistake?.line ?? a.error?.line ?? null);
      if (a.verdict === 'correct') setDrill(markDrillDone(problem.id));
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not check your code.');
    } finally {
      setBusy(false);
    }
  }, [problem, busy, code, confidence]);

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    setNote('');
    setErr('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErr('Use a PNG, JPEG or WebP photo.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErr('That photo is over 4 MB. Take it at a lower resolution.');
      return;
    }
    setReading(true);
    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result).split(',')[1] ?? '');
        fr.onerror = () => reject(new Error('Could not read the file.'));
        fr.readAsDataURL(file);
      });
      const r = await api.transcribe(b64, file.type);
      setCode(r.code);
      setNote('Transcribed from your photo. Fix any misread characters before you check.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not read the photo.');
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loadErr) return <ErrorNote>{loadErr}</ErrorNote>;
  if (!problem) return <Spinner label="Loading problem" />;

  const drillIdx = drill?.ids.indexOf(problem.id) ?? -1;
  const drillNext =
    drill && drillIdx >= 0
      ? (() => {
          const nextId = drill.ids.find((x, i) => i !== drillIdx && !drill.done.includes(x) && i > drillIdx) ?? drill.ids.find((x) => x !== problem.id && !drill.done.includes(x));
          return nextId ? { id: nextId, position: `${drill.done.length} of ${drill.ids.length} done` } : null;
        })()
      : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Statement */}
      <div className="min-w-0 space-y-4 xl:sticky xl:top-8 xl:self-start">
        <div>
          {problem.lessonId ? (
            <Link to={`/app/course/${problem.lessonId}`} className="text-sm text-ink-3 hover:text-ink">
              ← Lesson: {problem.lessonTitle}
            </Link>
          ) : (
            <Link to="/app/practice" className="text-sm text-ink-3 hover:text-ink">
              ← All problems
            </Link>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill tone="accent">{problem.topicName}</Pill>
            <Pill tone="neutral">{problem.lang === 'ts' ? 'TypeScript' : 'JavaScript'}</Pill>
            <Difficulty level={problem.difficulty} />
            {drillIdx >= 0 && drill && <Pill tone="warn">Drill · {drill.done.length} of {drill.ids.length} done</Pill>}
          </div>
          <h1 className="mt-2 text-[28px] font-bold">{problem.title}</h1>
        </div>
        <Card className="p-5">
          <ProblemText text={problem.prompt} />
          <p className="mt-3 text-sm text-ink-2">
            <span className="font-medium text-ink">The idea:</span> {problem.concept}
          </p>
        </Card>
        {problem.mode === 'types' ? (
          <Card className="p-5">
            <h2 className="mb-2 text-base font-bold">What will be checked</h2>
            <ul className="space-y-1.5 text-sm">
              {problem.checkLabels.map((c) => (
                <li key={c} className="flex gap-2 rounded-lg bg-surface-2 px-3 py-2">
                  <span className="text-ink-3" aria-hidden>•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-3">
              The real TypeScript compiler (strict mode) checks your types against each of these. There is nothing to run: if the compiler accepts what it should and rejects what it should, you pass.
            </p>
          </Card>
        ) : (
          <Card className="p-5">
            <h2 className="mb-2 text-base font-bold">Examples</h2>
            <ul className="space-y-2 text-[13px]">
              {problem.examples.map((e, i) => (
                <li key={i} className="rounded-lg bg-surface-2 px-3 py-2 font-mono">
                  <div className="break-words text-ink">
                    {problem.fn}({e.argsText})
                  </div>
                  <div className="break-words text-ink-2">→ {e.expected}</div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-3">
              Your code is checked on typical inputs, edge cases and a large input. The checker runs it in a sandbox and compares its steps with a correct run.
              {problem.lang === 'ts' ? ' TypeScript is checked in strict mode first.' : ''}
            </p>
          </Card>
        )}
      </div>

      {/* Work area */}
      <div className="min-w-0 space-y-4">
        <div className="space-y-3">
          <Editor lang={problem.lang} value={code} onChange={setCode} flagLine={flagLine} onSubmit={check} />
          {note && <p className="text-sm text-ink-2">{note}</p>}
          {err && <ErrorNote>{err}</ErrorNote>}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <fieldset className="min-w-0">
              <legend className="mb-1 text-xs text-ink-3">How sure are you it works? (optional)</legend>
              <div className="inline-flex overflow-hidden rounded-lg border border-line-strong" role="radiogroup">
                {CONFIDENCE.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={confidence === c.value}
                    onClick={() => setConfidence(confidence === c.value ? undefined : c.value)}
                    className={cn(
                      'border-r border-line-strong px-3 py-1.5 text-sm last:border-r-0',
                      confidence === c.value ? 'bg-accent-soft font-medium text-accent' : 'bg-surface text-ink-2 hover:bg-surface-2',
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center gap-2">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" capture="environment" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} tabIndex={-1} aria-hidden />
              <Button
                variant="ghost"
                onClick={() => fileRef.current?.click()}
                busy={reading}
                disabled={!aiOn}
                title={aiOn ? 'Read handwritten or printed code from a photo' : 'Needs a Gemini key on the server'}
              >
                <Camera className="size-4" aria-hidden />
                From a photo
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  clearDraft(problem.id);
                  setCode(problem.starter);
                  setResult(null);
                  setFlagLine(null);
                }}
              >
                <RotateCcw className="size-4" aria-hidden />
                Start over
              </Button>
              <Button variant="primary" onClick={check} busy={busy}>
                <Play className="size-4" aria-hidden />
                Check my code
              </Button>
            </div>
          </div>
          <p className="text-xs text-ink-3">Tip: press Ctrl+Enter (⌘+Enter on Mac) to check.</p>
        </div>

        <div ref={resultRef} className="scroll-mt-20">
          {busy && !result && <Spinner label="Running your code on every test and tracing it" />}
          {result && <ResultPanel problem={problem} result={result} drillNext={drillNext} />}
        </div>
      </div>
    </div>
  );
}

/** Problem statements use `backticks` for code. */
function ProblemText({ text }: { text: string }) {
  return (
    <p className="text-[15px] leading-relaxed">
      {text.split(/(`[^`]+`)/g).map((c, i) =>
        c.startsWith('`') ? (
          <code key={i} className="rounded border border-line bg-surface-2 px-1">
            {c.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{c}</span>
        ),
      )}
    </p>
  );
}
