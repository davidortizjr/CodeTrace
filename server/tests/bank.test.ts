import { describe, expect, it } from 'vitest';
import { analyze, getCache } from '../src/engine/analyze.js';
import { PROBLEMS } from '../src/problems/bank.js';

/**
 * Every problem must be self-consistent:
 *  - the reference solution runs cleanly,
 *  - the starter code does NOT already pass,
 *  - the reference passes every test through the real analyser,
 *  - every known wrong variant fails at least one test and is recognised as itself.
 */
describe('problem bank', () => {
  it('has unique ids and 18 problems', () => {
    const ids = PROBLEMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(18);
  });

  for (const problem of PROBLEMS) {
    describe(problem.id, () => {
      it('reference passes and starter does not', async () => {
        const ok = await analyze(problem, problem.reference);
        expect(ok.verdict).toBe('correct');
        expect(ok.passed).toBe(problem.tests.length);

        const starter = await analyze(problem, problem.starter);
        expect(starter.verdict).not.toBe('correct');
      });

      it('has a reference trace when it tracks variables', async () => {
        const cache = await getCache(problem);
        for (const name of problem.track) {
          expect(cache.refChanges[name]?.length, `${problem.id} tracks ${name}`).toBeGreaterThan(1);
        }
      });

      for (const variant of problem.variants) {
        it(`variant "${variant.id}" is caught as ${variant.type}`, async () => {
          const res = await analyze(problem, variant.code);
          expect(res.verdict).toBe('incorrect');
          expect(res.mistake?.type).toBe(variant.type);
          expect(res.mistake?.confidence).toBe('exact');
          expect(res.mistake?.detail).toBe(variant.label);
        });
      }

      it('variants are distinguishable from each other', async () => {
        const cache = await getCache(problem);
        const seen = new Set(cache.variantSigs.map((v) => v.sigs.join('\n')));
        expect(seen.size).toBe(cache.variantSigs.length);
        const ref = cache.expected.join('\n');
        for (const v of cache.variantSigs) expect(v.sigs.join('\n')).not.toBe(ref);
      });
    });
  }
});
