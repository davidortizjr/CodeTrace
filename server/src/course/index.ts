import type { Lesson, QuizItem, Track, Unit } from './types.js';
import { JS_FOUNDATIONS } from './units/u1-js-foundations.js';
import { JS_FLOW } from './units/u2-js-flow.js';
import { JS_DATA } from './units/u3-js-data.js';
import { JS_MODERN } from './units/u4-js-modern.js';
import { TS_BASICS } from './units/u5-ts-basics.js';
import { TS_SHAPES } from './units/u6-ts-shapes.js';
import { TS_GENERICS } from './units/u7-ts-generics.js';
import { TS_REAL } from './units/u8-ts-real.js';

/** The course, in order: JavaScript units first, then TypeScript. */
export const UNITS: Unit[] = [JS_FOUNDATIONS, JS_FLOW, JS_DATA, JS_MODERN, TS_BASICS, TS_SHAPES, TS_GENERICS, TS_REAL];
export const TRACKS: { id: Track; title: string; blurb: string }[] = [
  { id: 'js', title: 'JavaScript', blurb: 'The syntax of the language, from values and variables to classes and async code.' },
  { id: 'ts', title: 'TypeScript', blurb: 'Add types to JavaScript and let the compiler catch mistakes before the code runs.' },
];

export const unitsOf = (track: Track) => UNITS.filter((u) => u.track === track);
export const getUnit = (id: string) => UNITS.find((u) => u.id === id);
export const allLessons = (): (Lesson & { unitId: Unit['id'] })[] =>
  UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unitId: u.id })));
export const getLesson = (id: string) => allLessons().find((l) => l.id === id);

/** Every quiz item in the course with where it lives. Used by tests and by grading. */
export function allQuizItems(): { item: QuizItem; scope: string }[] {
  const out: { item: QuizItem; scope: string }[] = [];
  for (const u of UNITS) {
    for (const l of u.lessons) for (const item of l.checks) out.push({ item, scope: `lesson:${l.id}` });
    for (const item of u.exam) out.push({ item, scope: `unit:${u.id}` });
    for (const item of u.bonus) out.push({ item, scope: `bonus:${u.id}` });
  }
  return out;
}
