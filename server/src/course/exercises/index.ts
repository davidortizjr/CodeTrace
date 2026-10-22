import type { Problem } from '../../problems/types.js';
import { U1_EXERCISES } from './u1-js-foundations.js';
import { U2_EXERCISES } from './u2-js-flow.js';
import { U3_EXERCISES } from './u3-js-data.js';
import { U4_MORE } from './u4-more.js';
import { U4_EXERCISES } from './u4-js-modern.js';
import { U5_MORE } from './u5-more.js';
import { U5_EXERCISES } from './u5-ts-basics.js';
import { U6_EXERCISES } from './u6-ts-shapes.js';
import { U7_EXERCISES } from './u7-ts-generics.js';
import { U8_EXERCISES } from './u8-ts-real.js';

/** Exercises that belong to course lessons, in course order. */
export const COURSE_PROBLEMS: Problem[] = [
  ...U1_EXERCISES, ...U2_EXERCISES, ...U3_EXERCISES, ...U4_EXERCISES, ...U4_MORE,
  ...U5_EXERCISES, ...U5_MORE, ...U6_EXERCISES, ...U7_EXERCISES, ...U8_EXERCISES,
];
