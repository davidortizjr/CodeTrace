import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { runSnippet } from '../course/run.js';
import { allLessons, getLesson, getUnit, TRACKS, unitsOf } from '../course/index.js';
import {
  drawFinal,
  finalPool,
  finalSize,
  grade,
  PASS_MARK,
  PER_UNIT_IN_FINAL,
  publicItem,
  type GradedItem,
} from '../course/quiz.js';
import type { Example, QuizItem, Track } from '../course/types.js';
import { typecheck } from '../engine/typescript.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { getProblem } from '../problems/bank.js';
import { storeFor } from '../store/select.js';
import type { AttemptSummary, QuizResult } from '../store/types.js';

export const courseRouter = Router();

const TRACK_IDS = new Set<string>(TRACKS.map((t) => t.id));

// ── Run a snippet (the "Try it" button and the playground) ─────────────────

const runBody = z.object({
  lang: z.enum(['js', 'ts']),
  code: z.string().max(6000, 'Keep the example under 6,000 characters.'),
});

courseRouter.post(
  '/run',
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 40, message: 'You can run up to 40 snippets a minute. Take a breath and try again shortly.' }),
  async (req, res) => {
    const body = runBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request.' });
      return;
    }
    if (body.data.code.trim() === '') {
      res.status(400).json({ error: 'Write some code first.' });
      return;
    }
    const r = await runSnippet(body.data.lang, body.data.code);
    res.json({
      output: r.output,
      outputCut: r.outputCut,
      error: r.error ?? null,
      syntaxError: r.syntaxError ?? null,
      diagnostics: r.diagnostics.map(({ line, col, code, message }) => ({ line, col, code, message })),
      internal: r.internal === true,
    });
  },
);

// ── Progress ─────────────────────────────────────────────────────────────

const best = (results: QuizResult[], scope: string) => {
  let top: QuizResult | null = null;
  for (const r of results) {
    if (r.scope !== scope) continue;
    if (!top || r.score / r.total > top.score / top.total) top = r;
  }
  return top ? { score: top.score, total: top.total } : null;
};

const passed = (b: { score: number; total: number } | null) => !!b && b.score / b.total >= PASS_MARK;

function solvedIds(attempts: AttemptSummary[]) {
  return new Set(attempts.filter((a) => a.correct).map((a) => a.problemId));
}

type LessonStatus = 'new' | 'started' | 'done';

function lessonProgress(lessonId: string, exercises: string[], solved: Set<string>, tried: Set<string>, results: QuizResult[]) {
  const checks = best(results, `lesson:${lessonId}`);
  const ex = { solved: exercises.filter((id) => solved.has(id)).length, total: exercises.length };
  const status: LessonStatus =
    checks && ex.solved === ex.total ? 'done' : checks || ex.solved > 0 || exercises.some((id) => tried.has(id)) ? 'started' : 'new';
  return { checks, exercises: ex, status };
}

courseRouter.get('/course', requireAuth, async (req, res) => {
  const store = storeFor(req.user!);
  const [attempts, results] = await Promise.all([store.list(req.user!.id), store.listResults(req.user!.id)]);
  const solved = solvedIds(attempts);
  const tried = new Set(attempts.map((a) => a.problemId));

  let next: { lessonId: string; title: string } | null = null;
  const tracks = TRACKS.map((t) => {
    const units = unitsOf(t.id).map((u) => {
      const lessons = u.lessons.map((l) => {
        const p = lessonProgress(l.id, l.exercises, solved, tried, results);
        if (!next && p.status !== 'done') next = { lessonId: l.id, title: l.title };
        return { id: l.id, title: l.title, summary: l.summary, minutes: l.minutes, ...p };
      });
      const examBest = best(results, `unit:${u.id}`);
      return {
        id: u.id,
        title: u.title,
        blurb: u.blurb,
        lessons,
        lessonsDone: lessons.filter((l) => l.status === 'done').length,
        exam: { questions: u.exam.length, best: examBest, passed: passed(examBest) },
      };
    });
    const finalBest = best(results, `final:${t.id}`);
    return {
      id: t.id,
      title: t.title,
      blurb: t.blurb,
      units,
      lessonsDone: units.reduce((n, u) => n + u.lessonsDone, 0),
      lessonsTotal: units.reduce((n, u) => n + u.lessons.length, 0),
      final: { questions: finalSize(unitsOf(t.id)), best: finalBest, passed: passed(finalBest), ready: units.every((u) => u.exam.best !== null) },
    };
  });
  res.json({ tracks, next, passMark: PASS_MARK });
});

// ── A lesson ─────────────────────────────────────────────────────────────

const exampleCache = new Map<string, { line: number; code: number; message: string }[]>();

function exampleDiagnostics(lessonId: string, ex: Example) {
  if (ex.lang !== 'ts' || !ex.errors || ex.errors.length === 0) return undefined;
  const key = `${lessonId}:${ex.id}`;
  let d = exampleCache.get(key);
  if (!d) {
    d = typecheck(ex.code).diagnostics.map(({ line, code, message }) => ({ line, code, message }));
    exampleCache.set(key, d);
  }
  return d;
}

courseRouter.get('/course/lessons/:id', requireAuth, async (req, res) => {
  const lesson = getLesson(String(req.params.id));
  if (!lesson) {
    res.status(404).json({ error: 'That lesson does not exist.' });
    return;
  }
  const unit = getUnit(lesson.unitId)!;
  const store = storeFor(req.user!);
  const [attempts, results] = await Promise.all([store.list(req.user!.id), store.listResults(req.user!.id)]);
  const solved = solvedIds(attempts);
  const tried = new Set(attempts.map((a) => a.problemId));

  const all = allLessons();
  const i = all.findIndex((l) => l.id === lesson.id);
  const nav = (l?: { id: string; title: string }) => (l ? { id: l.id, title: l.title } : null);

  res.json({
    id: lesson.id,
    unitId: unit.id,
    unitTitle: unit.title,
    track: unit.track,
    title: lesson.title,
    summary: lesson.summary,
    minutes: lesson.minutes,
    objectives: lesson.objectives,
    sections: lesson.sections.map((s) => ({
      ...s,
      examples: s.examples?.map((ex) => ({ ...ex, diagnostics: exampleDiagnostics(lesson.id, ex) })),
    })),
    recap: lesson.recap,
    checkCount: lesson.checks.length,
    exercises: lesson.exercises
      .map((id) => getProblem(id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({ id: p.id, title: p.title, difficulty: p.difficulty, lang: p.lang ?? 'js', mode: p.mode ?? 'run', concept: p.concept, solved: solved.has(p.id), tried: tried.has(p.id) })),
    progress: lessonProgress(lesson.id, lesson.exercises, solved, tried, results),
    prev: nav(all[i - 1]),
    next: nav(all[i + 1]),
    examId: unit.id,
  });
});

// ── Quizzes and exams ───────────────────────────────────────────────────────

type Kind = 'lesson' | 'unit' | 'final';

interface QuizDef {
  scope: string;
  title: string;
  /** Items the learner answers. */
  items: QuizItem[];
  /** Everything an answer may be checked against (the final draws from a larger pool). */
  pool: Map<string, QuizItem>;
  exam: boolean;
  instant: boolean;
}

function lookup(kind: string, id: string): QuizDef | null {
  if (kind === 'lesson') {
    const l = getLesson(id);
    if (!l) return null;
    return { scope: `lesson:${l.id}`, title: `Check yourself: ${l.title}`, items: l.checks, pool: new Map(l.checks.map((i) => [i.id, i])), exam: false, instant: true };
  }
  if (kind === 'unit') {
    const u = getUnit(id);
    if (!u) return null;
    return { scope: `unit:${u.id}`, title: `${u.title}: unit exam`, items: u.exam, pool: new Map(u.exam.map((i) => [i.id, i])), exam: true, instant: false };
  }
  if (kind === 'final' && TRACK_IDS.has(id)) {
    const units = unitsOf(id as Track);
    const name = TRACKS.find((t) => t.id === id)!.title;
    return { scope: `final:${id}`, title: `${name}: final exam`, items: [], pool: finalPool(units), exam: true, instant: false };
  }
  return null;
}

const seedOf = () => Math.floor(Math.random() * 2 ** 31);

courseRouter.get('/quiz/:kind/:id', requireAuth, (req, res) => {
  const kind = String(req.params.kind);
  const id = String(req.params.id);
  const def = lookup(kind, id);
  if (!def) {
    res.status(404).json({ error: 'That quiz does not exist.' });
    return;
  }
  const seed = seedOf();
  const items = kind === 'final' ? drawFinal(unitsOf(id as Track), seed) : def.items;
  res.json({
    scope: def.scope,
    title: def.title,
    exam: def.exam,
    passMark: PASS_MARK,
    items: items.map((i) => publicItem(i, def.exam ? seed : undefined)),
  });
});

const submitBody = z.object({
  answers: z.record(z.string().max(64), z.union([z.number(), z.string().max(300), z.null()])).refine((a) => Object.keys(a).length <= 60, 'Too many answers.'),
});

courseRouter.post(
  '/quiz/:kind/:id',
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 60, message: 'Too many submissions. Wait a moment and try again.' }),
  async (req, res) => {
    const kind = String(req.params.kind);
    const id = String(req.params.id);
    const def = lookup(kind, id);
    if (!def) {
      res.status(404).json({ error: 'That quiz does not exist.' });
      return;
    }
    const body = submitBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: 'Invalid answers.' });
      return;
    }
    const { answers } = body.data;

    let items: QuizItem[];
    if (kind === 'final') {
      const ids = Object.keys(answers);
      const units = unitsOf(id as Track);
      const chosen = ids.map((i) => def.pool.get(i));
      if (chosen.some((c) => !c) || ids.length !== finalSize(units)) {
        res.status(400).json({ error: 'That is not a valid set of final exam questions. Reload the exam and try again.' });
        return;
      }
      for (const u of units) {
        const inUnit = ids.filter((qid) => qid.startsWith(`${u.id}.`)).length;
        if (inUnit !== PER_UNIT_IN_FINAL) {
          res.status(400).json({ error: 'That is not a valid set of final exam questions. Reload the exam and try again.' });
          return;
        }
      }
      items = chosen as QuizItem[];
    } else {
      items = def.items;
    }

    const graded: GradedItem[] = items.map((item) => grade(item, answers[item.id] ?? null));
    const score = graded.filter((g) => g.correct).length;
    const total = graded.length;

    const store = storeFor(req.user!);
    const before = best(await store.listResults(req.user!.id), def.scope);
    await store.addResult({ userId: req.user!.id, scope: def.scope, score, total });

    const review = [...new Set(graded.filter((g) => !g.correct && g.review).map((g) => g.review as string))]
      .map((lid) => getLesson(lid))
      .filter((l): l is NonNullable<typeof l> => !!l)
      .map((l) => ({ id: l.id, title: l.title }));

    res.json({
      scope: def.scope,
      score,
      total,
      percent: Math.round((score / total) * 100),
      passed: def.exam ? score / total >= PASS_MARK : null,
      passMark: PASS_MARK,
      previousBest: before,
      items: graded,
      review,
    });
  },
);

