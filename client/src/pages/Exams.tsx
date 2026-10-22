import { ArrowRight, Check, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, ErrorNote, PageHeader, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { cn } from '../lib/format';
import type { CourseResponse } from '../lib/types';
import { FinalCard } from './Course';

export default function Exams() {
  const [data, setData] = useState<CourseResponse | null>(null);
  const [err, setErr] = useState('');
  const load = () => {
    setErr('');
    api.course().then(setData).catch((e) => setErr(e.message));
  };
  useEffect(load, []);

  if (err) return <ErrorNote onRetry={load}>{err}</ErrorNote>;
  if (!data) return <Spinner label="Loading exams" />;

  return (
    <>
      <PageHeader
        title="Exams"
        sub={`Each unit has an exam of 8 questions, and each track has a final exam drawn from every unit. ${Math.round(data.passMark * 100)}% passes. Missed questions point you back to the lesson that teaches them, and you can retake any exam.`}
      />
      <div className="space-y-8">
        {data.tracks.map((t) => (
          <section key={t.id} aria-labelledby={`t-${t.id}`}>
            <h2 id={`t-${t.id}`} className="mb-3 text-xl font-bold">
              {t.title}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {t.units.map((u) => {
                const done = u.lessonsDone;
                return (
                  <Link key={u.id} to={`/app/quiz/unit/${u.id}`} className="group block">
                    <Card className="h-full p-4 transition-colors group-hover:border-accent/60 group-hover:bg-surface-2">
                      <div className="flex items-start gap-3">
                        <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', u.exam.passed ? 'bg-ok text-white' : 'bg-accent-soft text-accent')}>
                          {u.exam.passed ? <Check className="size-4" aria-label="Passed" /> : <GraduationCap className="size-4" aria-hidden />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold">{u.title}</h3>
                          <p className="text-sm text-ink-2">
                            {u.exam.questions} questions · {done} of {u.lessons.length} lessons done
                          </p>
                          <p className="mt-1 text-sm text-ink-3">{u.exam.best ? `Best: ${u.exam.best.score}/${u.exam.best.total}` : 'Not taken yet'}</p>
                        </div>
                        <ArrowRight className="mt-1 size-4 text-ink-3" aria-hidden />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
            <div className="mt-3">
              <FinalCard track={t} passMark={data.passMark} />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
