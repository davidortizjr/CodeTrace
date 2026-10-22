import { ArrowRight, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { RichText } from '../components/RichText';
import { Button, Card, ErrorNote, Pill, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { cn } from '../lib/format';
import type { QuizQuestion, QuizResponse, QuizResult } from '../lib/types';

type Answers = Record<string, number | string | null>;

export default function Quiz() {
  const { kind = '', id = '' } = useParams();
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setErr('');
    setQuiz(null);
    setResult(null);
    setAnswers({});
    api.quiz(kind, id).then(setQuiz).catch((e) => setErr(e.message));
  };
  useEffect(load, [kind, id]);

  if (err && !quiz) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!quiz) return <Spinner label="Loading the questions" />;

  const answered = quiz.items.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null).length;
  const back = kind === 'lesson' ? `/app/course/${id}` : '/app/course';

  const submit = async () => {
    setBusy(true);
    setErr('');
    try {
      const payload: Answers = {};
      for (const q of quiz.items) payload[q.id] = answers[q.id] ?? null;
      setResult(await api.submitQuiz(kind, id, payload));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not submit your answers.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <Link to={back} className="text-sm text-ink-3 hover:text-ink">
        ← {kind === 'lesson' ? 'Back to the lesson' : 'Course'}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Pill tone={quiz.exam ? 'warn' : 'accent'}>{quiz.exam ? 'Exam' : 'Quiz'}</Pill>
        <span className="text-sm text-ink-3">{quiz.items.length} questions</span>
      </div>
      <h1 className="mt-2 text-[28px] font-bold">{quiz.title}</h1>
      {quiz.exam && !result && (
        <p className="mt-1 text-ink-2">
          Answers and explanations appear after you submit. You need {Math.round(quiz.passMark * 100)}% to pass, and you can retake it as often as you like.
        </p>
      )}

      {result && <Summary result={result} total={quiz.items.length} exam={quiz.exam} kind={kind} id={id} onRetry={load} />}

      <ol className="mt-6 space-y-5">
        {quiz.items.map((q, i) => (
          <Question
            key={q.id}
            q={q}
            n={i + 1}
            value={answers[q.id]}
            onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
            graded={result?.items.find((g) => g.id === q.id)}
            locked={!!result}
          />
        ))}
      </ol>

      {err && <div className="mt-4"><ErrorNote>{err}</ErrorNote></div>}
      {!result && (
        <div className="sticky bottom-20 mt-6 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/95 p-3 backdrop-blur lg:bottom-4">
          <span className="text-sm text-ink-2">
            {answered} of {quiz.items.length} answered
          </span>
          <Button variant="primary" onClick={submit} busy={busy}>
            {quiz.exam ? 'Submit the exam' : 'Check my answers'}
          </Button>
        </div>
      )}
    </div>
  );
}

function Question({
  q,
  n,
  value,
  onChange,
  graded,
  locked,
}: {
  q: QuizQuestion;
  n: number;
  value: number | string | null | undefined;
  onChange: (v: number | string) => void;
  graded?: QuizResult['items'][number];
  locked: boolean;
}) {
  return (
    <li>
      <Card className={cn('p-5', graded && (graded.correct ? 'border-ok/50' : 'border-flag/50'))}>
        <fieldset disabled={locked}>
          <legend className="mb-3 flex w-full items-start gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-ink-2">{n}</span>
            <span className="min-w-0 flex-1 pt-0.5 text-[16px] font-medium">
              <RichText text={q.prompt} />
            </span>
            {graded && (
              <span className={cn('grid size-7 shrink-0 place-items-center rounded-full text-white', graded.correct ? 'bg-ok' : 'bg-flag dark:text-black')}>
                {graded.correct ? <Check className="size-4" aria-label="Correct" /> : <X className="size-4" aria-label="Incorrect" />}
              </span>
            )}
          </legend>
          {q.code && <CodeBlock code={q.code.text} lang={q.code.lang} />}
          {q.kind === 'mcq' ? (
            <div className="space-y-2" role="radiogroup">
              {q.options!.map((o) => {
                const picked = value === o.id;
                return (
                  <label
                    key={o.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-[15px] transition-colors',
                      picked ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2',
                      locked && 'cursor-default',
                    )}
                  >
                    <input type="radio" name={q.id} checked={picked} onChange={() => onChange(o.id)} className="mt-1 accent-[var(--accent)]" />
                    <span className="min-w-0 break-words">
                      <RichText text={o.text} />
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={q.placeholder ?? 'Type your answer'}
              aria-label={`Answer to question ${n}`}
              autoComplete="off"
              spellCheck={false}
              className="mono w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-[14px] outline-none focus:border-accent"
            />
          )}
        </fieldset>
        {graded && (
          <div className="mt-4 rounded-lg bg-surface-2 p-4 text-[15px]">
            <p className="font-medium">
              {graded.correct ? 'Correct.' : 'Not quite.'} {!graded.correct && <span className="font-normal text-ink-2">The answer is <code className="rounded border border-line bg-surface px-1">{graded.answerText}</code>.</span>}
            </p>
            {!graded.correct && graded.given !== null && (
              <p className="mt-1 text-sm text-ink-2">
                You answered <code className="rounded border border-line bg-surface px-1">{graded.given}</code>.
              </p>
            )}
            <p className="mt-2 text-ink-2">
              <RichText text={graded.explanation} />
            </p>
          </div>
        )}
      </Card>
    </li>
  );
}

function Summary({ result, total, exam, kind, id, onRetry }: { result: QuizResult; total: number; exam: boolean; kind: string; id: string; onRetry: () => void }) {
  const ok = exam ? result.passed : result.score === total;
  return (
    <Card className={cn('mt-6 p-5', ok ? 'border-ok/50 bg-ok-soft' : '')} aria-live="polite">
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-5xl font-bold tabular-nums">
          {result.score}
          <span className="text-2xl text-ink-3">/{result.total}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">
            {exam ? (result.passed ? 'You passed' : 'Not yet') : result.score === total ? 'Perfect' : result.percent >= 70 ? 'Good work' : 'Worth another look'}
            <span className="ml-2 text-base font-normal text-ink-2">{result.percent}%</span>
          </h2>
          <p className="text-sm text-ink-2">
            {exam
              ? result.passed
                ? 'Nice work. Your result is saved.'
                : `You need ${Math.round(result.passMark * 100)}% to pass. Review the lessons below, then try again.`
              : 'Read the explanations below, especially for any you missed.'}
            {result.previousBest && ` Previous best: ${result.previousBest.score}/${result.previousBest.total}.`}
          </p>
        </div>
      </div>
      {result.review.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <h3 className="text-sm font-medium text-ink-3">Review these lessons</h3>
          <ul className="mt-1 flex flex-wrap gap-2">
            {result.review.map((l) => (
              <li key={l.id}>
                <Link to={`/app/course/${l.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1 text-sm font-medium text-accent hover:bg-surface-2">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onRetry}>
          {kind === 'final' ? 'New set of questions' : 'Try again'}
        </Button>
        <Link to={kind === 'lesson' ? `/app/course/${id}` : '/app/course'} className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink hover:brightness-110">
          {kind === 'lesson' ? 'Back to the lesson' : 'Back to the course'}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
