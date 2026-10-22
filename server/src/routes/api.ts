import { Router } from 'express';
import { z } from 'zod';
import { checkerReport, COACH_SYSTEM, EXPLAIN_SYSTEM, TRANSCRIBE_SYSTEM, type Level } from '../ai/prompts.js';
import { generate, type Part } from '../ai/gemini.js';
import { offlineCoach, offlineExplain } from '../ai/offline.js';
import { DEMO_TOKEN, DEMO_USER, requireAuth } from '../auth.js';
import { aiEnabled, supabaseEnabled } from '../config.js';
import { getLesson } from '../course/index.js';
import { analyze, getCache } from '../engine/analyze.js';
import { ERROR_TYPES, type ErrorTypeId } from '../engine/errors.js';
import { fmtArgs, fmtEncoded } from '../engine/display.js';
import { drillSet, nextForMistake, nextForWeakTopic } from '../engine/planner.js';
import { computeProgress } from '../engine/scoring.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { PROBLEMS, TOPICS, getProblem } from '../problems/bank.js';
import type { Problem, PublicProblem } from '../problems/types.js';
import { demoStore, storeFor } from '../store/select.js';
import { courseRouter } from './course.js';

async function toPublic(p: Problem): Promise<PublicProblem> {
  const cache = await getCache(p);
  const lesson = p.lesson ? getLesson(p.lesson) : undefined;
  const examples = p.tests
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.cat === 'basic')
    .slice(0, 2)
    .map(({ t, i }) => ({ args: t.args, argsText: fmtArgs(t.args), expected: fmtEncoded(cache.expected[i]) }));
  return {
    id: p.id,
    topic: p.topic,
    lang: p.lang ?? 'js',
    mode: p.mode ?? 'run',
    lessonId: lesson?.id ?? null,
    lessonTitle: lesson?.title ?? null,
    checkLabels: (p.typeChecks ?? []).map((c) => c.label),
    topicName: TOPICS.find((t) => t.id === p.topic)!.name,
    title: p.title,
    difficulty: p.difficulty,
    prompt: p.prompt,
    concept: p.concept,
    fn: p.fn,
    starter: p.starter,
    traceText: fmtArgs(p.traceArgs),
    examples,
  };
}

const analyzeBody = z.object({
  code: z.string().max(8000, 'Keep your solution under 8,000 characters.'),
  confidence: z.number().int().min(0).max(100).optional(),
});

const explainBody = z.object({
  attemptId: z.string().min(1).max(64),
  level: z.enum(['quick', 'standard', 'deep']).default('standard'),
});

const coachBody = z.object({
  problemId: z.string().max(64).optional(),
  attemptId: z.string().max(64).optional(),
  code: z.string().max(8000).optional(),
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(2000) }))
    .min(1)
    .max(20),
});

const transcribeBody = z.object({
  image: z.string().min(100).max(5_500_000),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
});

export const api = Router();

api.use(courseRouter);

api.get('/health', (_req, res) => {
  res.json({ ok: true, ai: aiEnabled(), supabase: supabaseEnabled() });
});

api.get('/status', (_req, res) => {
  res.json({ ai: aiEnabled(), accounts: supabaseEnabled() });
});

api.post('/auth/demo', (_req, res) => {
  res.json({ token: DEMO_TOKEN, user: DEMO_USER });
});

api.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

api.get('/problems', requireAuth, async (req, res) => {
  const attempts = await storeFor(req.user!).list(req.user!.id);
  const solved = new Set(attempts.filter((a) => a.correct).map((a) => a.problemId));
  const tried = new Set(attempts.map((a) => a.problemId));
  res.json({
    topics: TOPICS,
    problems: PROBLEMS.map((p) => ({
      id: p.id,
      topic: p.topic,
      lang: p.lang ?? 'js',
      mode: p.mode ?? 'run',
      lesson: p.lesson ?? null,
      title: p.title,
      difficulty: p.difficulty,
      concept: p.concept,
      solved: solved.has(p.id),
      tried: tried.has(p.id),
    })),
  });
});

api.get('/problems/:id', requireAuth, async (req, res) => {
  const p = getProblem(String(req.params.id));
  if (!p) {
    res.status(404).json({ error: 'That problem does not exist.' });
    return;
  }
  res.json(await toPublic(p));
});

api.post('/problems/:id/analyze', requireAuth, rateLimit({ windowMs: 60_000, max: 20, message: 'Slow down a little: you can check up to 20 times a minute.' }), async (req, res) => {
  const problem = getProblem(String(req.params.id));
  if (!problem) {
    res.status(404).json({ error: 'That problem does not exist.' });
    return;
  }
  const body = analyzeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request.' });
    return;
  }
  const { code, confidence } = body.data;
  if (code.trim().length === 0) {
    res.status(400).json({ error: 'Write some code first.' });
    return;
  }

  const user = req.user!;
  const store = storeFor(user);
  const analysis = await analyze(problem, code);

  let attemptId: string | null = null;
  if (!analysis.internal) {
    const saved = await store.add({
      userId: user.id,
      problemId: problem.id,
      topic: problem.topic,
      correct: analysis.verdict === 'correct',
      passed: analysis.passed,
      total: analysis.total,
      errorType: analysis.mistake?.type ?? null,
      confidence: confidence ?? null,
      code,
      analysis,
    });
    attemptId = saved.id;
  }

  const history = await store.list(user.id);
  const next =
    analysis.verdict === 'correct'
      ? nextForWeakTopic(history, problem.id)
      : nextForMistake(history, analysis.mistake?.type, problem.id);
  const nextProblem = getProblem(next.problemId);

  res.json({
    attemptId,
    analysis,
    next: nextProblem ? { id: nextProblem.id, title: nextProblem.title, reason: next.reason } : null,
  });
});

api.get('/attempts/:id', requireAuth, async (req, res) => {
  const attempt = await storeFor(req.user!).get(req.user!.id, String(req.params.id));
  if (!attempt) {
    res.status(404).json({ error: 'Attempt not found.' });
    return;
  }
  res.json({ attempt });
});

api.get('/progress', requireAuth, async (req, res) => {
  const attempts = await storeFor(req.user!).list(req.user!.id);
  res.json({ user: req.user, progress: computeProgress(attempts) });
});

api.get('/mistakes', requireAuth, async (req, res) => {
  const attempts = await storeFor(req.user!).list(req.user!.id);
  const progress = computeProgress(attempts);
  const catalog = (Object.keys(ERROR_TYPES) as ErrorTypeId[]).map((id) => ({ id, ...ERROR_TYPES[id] }));
  const counts = new Map(progress.mistakes.map((m) => [m.type, m.count]));
  res.json({
    mistakes: progress.mistakes,
    categories: progress.categories,
    catalog: catalog.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 })),
    recentByType: Object.fromEntries(
      progress.mistakes.map((m) => [
        m.type,
        attempts
          .filter((a) => a.errorType === m.type)
          .slice(-3)
          .reverse()
          .map((a) => ({ problemId: a.problemId, title: getProblem(a.problemId)?.title ?? a.problemId, at: a.createdAt })),
      ]),
    ),
  });
});

api.get('/next', requireAuth, async (req, res) => {
  const attempts = await storeFor(req.user!).list(req.user!.id);
  const exclude = typeof req.query.exclude === 'string' ? req.query.exclude : undefined;
  const type = typeof req.query.type === 'string' && req.query.type in ERROR_TYPES ? (req.query.type as ErrorTypeId) : undefined;
  const pick = req.query.mode === 'mistake' ? nextForMistake(attempts, type, exclude) : nextForWeakTopic(attempts, exclude);
  const p = getProblem(pick.problemId)!;
  res.json({ id: p.id, title: p.title, topic: p.topic, reason: pick.reason });
});

api.get('/drill', requireAuth, async (req, res) => {
  const attempts = await storeFor(req.user!).list(req.user!.id);
  const ids = drillSet(attempts);
  res.json({
    problems: ids.map((id) => {
      const p = getProblem(id)!;
      return { id: p.id, title: p.title, topic: p.topic, difficulty: p.difficulty };
    }),
  });
});

api.post('/demo/reset', requireAuth, async (req, res) => {
  if (!req.user!.demo) {
    res.status(403).json({ error: 'Only the demo account can be reset.' });
    return;
  }
  await demoStore.reset(req.user!.id);
  res.json({ ok: true });
});

// ── AI (Gemini). Each route falls back to engine-built wording. ─────────────

const aiLimit = rateLimit({ windowMs: 60_000, max: 12, message: 'The AI helper is limited to 12 requests a minute. Try again shortly.' });

api.post('/ai/explain', requireAuth, aiLimit, async (req, res) => {
  const body = explainBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: 'Invalid request.' });
    return;
  }
  const attempt = await storeFor(req.user!).get(req.user!.id, body.data.attemptId);
  const problem = attempt && getProblem(attempt.problemId);
  if (!attempt || !problem || !attempt.analysis) {
    res.status(404).json({ error: 'Check a solution first, then ask for an explanation.' });
    return;
  }
  const level = body.data.level as Level;
  const text = await generate({
    system: EXPLAIN_SYSTEM[level],
    parts: [{ text: checkerReport(problem, attempt.analysis, attempt.code) }],
    maxOutputTokens: level === 'quick' ? 220 : level === 'standard' ? 520 : 800,
  });
  res.json({ text: text ?? offlineExplain(problem, attempt.analysis, level), source: text ? 'gemini' : 'engine' });
});

api.post('/ai/coach', requireAuth, aiLimit, async (req, res) => {
  const body = coachBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: 'Invalid request.' });
    return;
  }
  const { problemId, attemptId, messages, code } = body.data;
  const problem = problemId ? getProblem(problemId) : undefined;
  const attempt = attemptId ? await storeFor(req.user!).get(req.user!.id, attemptId) : null;
  const analysis = attempt?.analysis ?? undefined;

  const context: string[] = [];
  if (problem && analysis && attempt) context.push(checkerReport(problem, analysis, attempt.code));
  else if (problem) {
    context.push(`Problem: ${problem.title}. ${problem.prompt}`);
    if (code) context.push(`<student_code>\n${code.slice(0, 3500)}\n</student_code>`);
  }

  const transcript = messages.map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`).join('\n');
  const parts: Part[] = [{ text: `${context.join('\n\n')}\n\nConversation so far:\n${transcript}\n\nReply as the Coach.` }];
  const text = await generate({ system: COACH_SYSTEM, parts, maxOutputTokens: 380, temperature: 0.5 });
  res.json({ text: text ?? offlineCoach(problem, analysis), source: text ? 'gemini' : 'engine' });
});

api.post('/ai/transcribe', requireAuth, rateLimit({ windowMs: 60_000, max: 6 }), async (req, res) => {
  if (!aiEnabled()) {
    res.status(503).json({ error: 'Reading photos needs a Gemini key on the server. Type or paste your code instead.' });
    return;
  }
  const body = transcribeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: 'Send a PNG, JPEG or WebP image under 4 MB.' });
    return;
  }
  const text = await generate({
    system: TRANSCRIBE_SYSTEM,
    parts: [
      { inlineData: { mimeType: body.data.mimeType, data: body.data.image } },
      { text: 'Transcribe the code in this image.' },
    ],
    maxOutputTokens: 1500,
    temperature: 0,
  });
  if (!text) {
    res.status(502).json({ error: 'The photo reader is busy or unavailable. Try again in a minute, or type your code.' });
    return;
  }
  if (text.trim() === 'NO_CODE') {
    res.status(422).json({ error: 'No code found in that photo. Try a closer, brighter shot.' });
    return;
  }
  const code = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '');
  res.json({ code });
});
