import util from 'node:util';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { allLessons, allQuizItems, UNITS } from '../src/course/index.js';
import { runSnippet } from '../src/course/run.js';
import { normalizeShort } from '../src/course/quiz.js';
import type { Example, QuizItem } from '../src/course/types.js';
import { stripTypes, typecheck } from '../src/engine/typescript.js';
import { PROBLEMS, getProblem } from '../src/problems/bank.js';

/**
 * The course is checked by running it. Every example is executed (or type-checked) and must do
 * exactly what the lesson says it does, and every quiz answer that can be proven by running
 * code is proven that way.
 */

const EXPECTED_UNITS = ['js-foundations', 'js-flow', 'js-data', 'js-modern', 'ts-basics', 'ts-shapes', 'ts-generics', 'ts-real'];

/** What real Node prints for the same code. Skipped for code that waits on timers. */
async function nodeLines(lang: 'js' | 'ts', code: string): Promise<string[] | null> {
  if (/setTimeout/.test(code)) return null;
  let js = code;
  if (lang === 'ts') {
    const r = stripTypes(code);
    if (!r.ok) return null;
    js = r.code;
  }
  const lines: string[] = [];
  const ctx = vm.createContext({ console: { log: (...a: unknown[]) => lines.push(util.format(...a)) } });
  try {
    vm.runInContext(js, ctx, { filename: 'student.js' });
  } catch {
    /* the example is meant to throw; compare what printed before */
  }
  await new Promise((r) => setImmediate(r));
  return lines;
}

const isRunnable = (e: Example): e is Example & { lang: 'js' | 'ts' } => (e.lang === 'js' || e.lang === 'ts') && e.run !== false;

describe('course structure', () => {
  it('has the eight units in order', () => {
    expect(UNITS.map((u) => u.id)).toEqual(EXPECTED_UNITS);
    expect(UNITS.map((u) => u.track)).toEqual(['js', 'js', 'js', 'js', 'ts', 'ts', 'ts', 'ts']);
  });

  it('has unique lesson ids and quiz ids', () => {
    const lessons = allLessons().map((l) => l.id);
    expect(new Set(lessons).size).toBe(lessons.length);
    const items = allQuizItems().map((q) => q.item.id);
    expect(new Set(items).size).toBe(items.length);
  });

  for (const unit of UNITS) {
    describe(`unit ${unit.id}`, () => {
      it('has a complete exam and bonus set', () => {
        expect(unit.lessons.length).toBeGreaterThanOrEqual(3);
        expect(unit.exam.length).toBe(8);
        expect(unit.bonus.length).toBe(4);
        unit.exam.forEach((q, i) => expect(q.id).toBe(`${unit.id}.e${i + 1}`));
        unit.bonus.forEach((q, i) => expect(q.id).toBe(`${unit.id}.b${i + 1}`));
      });

      for (const lesson of unit.lessons) {
        it(`lesson ${lesson.id} is complete`, () => {
          expect(lesson.sections.length).toBeGreaterThanOrEqual(3);
          expect(lesson.objectives.length).toBeGreaterThanOrEqual(2);
          expect(lesson.recap.length).toBeGreaterThanOrEqual(3);
          expect(lesson.minutes).toBeGreaterThanOrEqual(5);
          expect(lesson.minutes).toBeLessThanOrEqual(30);
          expect(lesson.checks.length).toBe(3);
          lesson.checks.forEach((q, i) => expect(q.id).toBe(`${lesson.id}.c${i + 1}`));
          const ids = lesson.sections.flatMap((s) => s.examples ?? []).map((e) => e.id);
          expect(new Set(ids).size, 'example ids are unique in the lesson').toBe(ids.length);
          for (const s of lesson.sections) {
            expect(s.body.length, `section "${s.heading}" has text`).toBeGreaterThan(0);
            for (const p of s.body) expect(p.includes('—'), `no em dashes: ${p.slice(0, 40)}`).toBe(false);
          }
        });

        it(`lesson ${lesson.id} exercises exist and point back`, () => {
          for (const id of lesson.exercises) {
            const p = getProblem(id);
            expect(p, `exercise ${id}`).toBeTruthy();
            expect(p!.lesson).toBe(lesson.id);
            expect(p!.topic).toBe(unit.id);
            expect(p!.lang ?? 'js').toBe(unit.track);
          }
        });
      }
    });
  }

  it('every exercise belongs to a lesson that lists it', () => {
    for (const p of PROBLEMS.filter((p) => p.lesson)) {
      const lesson = allLessons().find((l) => l.id === p.lesson);
      expect(lesson, `${p.id} → lesson ${p.lesson}`).toBeTruthy();
      expect(lesson!.exercises).toContain(p.id);
    }
  });
});

describe('lesson examples do what the lesson says', () => {
  for (const lesson of allLessons()) {
    for (const section of lesson.sections) {
      for (const ex of section.examples ?? []) {
        if (!isRunnable(ex)) continue;
        it(`${lesson.id}/${ex.id}`, async () => {
          const r = await runSnippet(ex.lang, ex.code);
          expect(r.syntaxError, 'syntax error').toBeUndefined();
          if (ex.runtimeError) {
            expect(`${r.error?.name}: ${r.error?.message}`).toContain(ex.runtimeError);
          } else {
            expect(r.error, 'unexpected error').toBeUndefined();
          }
          expect(r.output).toEqual(ex.output ?? []);
          if (ex.lang === 'ts') {
            const want = (ex.errors ?? []).map((e) => `${e.line}:${e.code}`).sort();
            const got = r.diagnostics.map((d) => `${d.line}:${d.code}`).sort();
            expect(got, 'TypeScript errors (line:code)').toEqual(want);
          }
          // What a learner sees must also be what Node prints.
          if (!ex.runtimeError) {
            const real = await nodeLines(ex.lang, ex.code);
            if (real) expect(r.output, 'differs from real Node').toEqual(real);
          }
        });
      }
    }
  }
});

describe('quiz items are sound and provably correct', () => {
  const checkShape = (q: QuizItem) => {
    expect(q.prompt.trim().length).toBeGreaterThan(5);
    expect(q.explanation.trim().length).toBeGreaterThan(10);
    expect(q.prompt.includes('—') || q.explanation.includes('—'), 'no em dashes').toBe(false);
    if (q.kind === 'mcq') {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.options.length).toBeLessThanOrEqual(5);
      expect(new Set(q.options).size, 'options are distinct').toBe(q.options.length);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    } else {
      expect(q.accept.length).toBeGreaterThan(0);
      expect(q.accept.every((a) => a.trim() !== '')).toBe(true);
    }
  };

  const items = allQuizItems();
  for (const { item, scope } of items) {
    it(`${item.id} (${scope})`, async () => {
      checkShape(item);
      if (item.review) expect(allLessons().some((l) => l.id === item.review), `review → ${item.review}`).toBe(true);
      const v = item.verify;
      if (!v) return;
      expect(item.code, 'verify needs code').toBeTruthy();
      const { lang, text } = item.code!;
      const correctText = item.kind === 'mcq' ? item.options[item.answer] : item.accept[0];
      const r = await runSnippet(lang, text);
      switch (v.kind) {
        case 'output': {
          expect(r.error, 'unexpected error').toBeUndefined();
          const printed = r.output.join(' ');
          expect(normalizeShort(correctText)).toBe(normalizeShort(printed));
          if (item.kind === 'mcq') {
            item.options.forEach((o, i) => {
              if (i !== item.answer) expect(normalizeShort(o), `wrong option "${o}" equals the real output`).not.toBe(normalizeShort(printed));
            });
          } else {
            for (const a of item.accept) expect(normalizeShort(a)).toBe(normalizeShort(printed));
          }
          break;
        }
        case 'compiles':
          expect(lang).toBe('ts');
          expect(typecheck(text).diagnostics).toEqual([]);
          break;
        case 'ts-error': {
          expect(lang).toBe('ts');
          const d = typecheck(text).diagnostics;
          const hit = d.find((x) => x.line === v.line && (v.code === undefined || x.code === v.code));
          expect(hit, `expected an error on line ${v.line}; got ${JSON.stringify(d.map((x) => [x.line, x.code]))}`).toBeTruthy();
          expect(d.map((x) => x.line), 'only the declared line has an error').toEqual(d.map(() => v.line));
          break;
        }
        case 'throws':
          expect(`${r.error?.name}: ${r.error?.message}`).toContain(v.message);
          break;
      }
    });
  }

  it('answers are spread across the options in each unit exam', () => {
    for (const u of UNITS) {
      const positions = new Set(u.exam.filter((q) => q.kind === 'mcq').map((q) => (q.kind === 'mcq' ? q.answer : -1)));
      expect(positions.size, `${u.id} exam answers all in the same position`).toBeGreaterThanOrEqual(3);
    }
  });
});
