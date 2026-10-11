import { describe, expect, it } from 'vitest';
import { analyze } from '../src/engine/analyze.js';
import { instrument } from '../src/engine/instrument.js';
import { getProblem } from '../src/problems/bank.js';

const P = (id: string) => getProblem(id)!;

describe('instrument', () => {
  it('keeps line numbers and wraps single-statement bodies', () => {
    const src = `function f(a) {
  let t = 0;
  for (let i = 0; i < a.length; i++)
    if (a[i] > 1) t += a[i];
  return t;
}`;
    const res = instrument(src, 'f', 'auto');
    expect(res.ok).toBe(true);
    expect(res.code.split('\n').length).toBe(src.split('\n').length);
    expect(res.vars.sort()).toEqual(['a', 'i', 't']);
    // still valid JS
    expect(() => new Function(res.code)).not.toThrow();
  });
});

describe('analyze: step comparison', () => {
  it('names the step where the running total first differs', async () => {
    const res = await analyze(
      P('sum-evens'),
      `function sumEvens(nums) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] % 2 === 0) {
      total += 1;
    }
  }
  return total;
}`,
    );
    expect(res.verdict).toBe('incorrect');
    expect(res.divergence).toBeDefined();
    expect(res.divergence!.variable).toBe('total');
    expect(res.divergence!.line).toBe(5);
    expect(res.divergence!.expected).toBe('2');
    expect(res.divergence!.got).toBe('1');
    expect(res.trace!.rows.some((r) => r.flag)).toBe(true);
  });

  it('aligns by value history when the student uses different names', async () => {
    const res = await analyze(
      P('sum-evens'),
      `function sumEvens(nums) {
  let s = 1;
  for (const n of nums) {
    if (n % 2 === 0) s += n;
  }
  return s;
}`,
    );
    expect(res.divergence?.variable).toBe('s');
    expect(res.divergence?.expectedVariable).toBe('total');
    expect(res.divergence?.got).toBe('1');
    expect(res.divergence?.expected).toBe('0');
    expect(res.mistake?.type).toBe('bad-init');
  });

  it('reports a loop that ends early', async () => {
    const res = await analyze(
      P('factorial-loop'),
      `function factorial(n) {
  let result = 1;
  for (let i = 2; i < n; i++) result = result * i;
  return result;
}`,
    );
    expect(res.mistake?.type).toBe('off-by-one');
    expect(res.divergence?.got).toBeNull();
    expect(res.divergence?.expected).toBe('120');
  });

  it('does not invent a divergence when the approach is different but right', async () => {
    const res = await analyze(
      P('sum-evens'),
      `const sumEvens = (nums) => nums.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0);`,
    );
    expect(res.verdict).toBe('correct');
    expect(res.divergence).toBeUndefined();
  });

  it('accepts an arrow function assigned to a const', async () => {
    const res = await analyze(P('fibonacci'), `const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));`);
    expect(res.verdict).toBe('correct');
  });
});

describe('analyze: failure shapes', () => {
  it('reports syntax errors with a line number', async () => {
    const res = await analyze(P('sum-evens'), `function sumEvens(nums) {\n  let total = 0;\n  return total\n`);
    expect(res.verdict).toBe('error');
    expect(res.error?.kind).toBe('syntax');
    expect(res.mistake?.type).toBe('syntax');
    expect(res.error?.line).toBeGreaterThan(0);
  });

  it('reports a missing function', async () => {
    const res = await analyze(P('sum-evens'), `function somethingElse() { return 1; }`);
    expect(res.error?.kind).toBe('missing-function');
  });

  it('stops infinite loops', async () => {
    const t0 = Date.now();
    const res = await analyze(P('sum-evens'), `function sumEvens(nums) { while (true) {} }`);
    expect(Date.now() - t0).toBeLessThan(8000);
    expect(res.verdict).toBe('incorrect');
    expect(res.mistake?.type).toBe('timeout');
  });

  it('stops an infinite loop at the top level of the file', async () => {
    const res = await analyze(P('sum-evens'), `while (true) {}\nfunction sumEvens() {}`);
    expect(res.verdict).toBe('error');
    expect(res.error?.kind).toBe('timeout');
  });

  it('classifies a function with no return', async () => {
    const res = await analyze(
      P('find-max'),
      `function findMax(nums) {\n  let max = nums[0];\n  for (const n of nums) if (n > max) max = n;\n}`,
    );
    expect(res.mistake?.type).toBe('no-return');
  });

  it('flags a runtime crash and shows the message', async () => {
    const res = await analyze(
      P('find-max'),
      `function findMax(nums) {\n  let max = nums[0].value;\n  return max;\n}`,
    );
    expect(res.verdict).toBe('incorrect');
    expect(res.mistake?.type).toBe('runtime');
    expect(res.tests.some((t) => t.note?.includes('TypeError'))).toBe(true);
  });

  it('uses a source pattern when behaviour matches no known variant', async () => {
    const res = await analyze(
      P('sum-evens'),
      `function sumEvens(nums) {
  let total = 0;
  for (let i = 0; i <= nums.length; i++) {
    if (nums[i] % 2 === 0) total += nums[i];
    else total += 0;
  }
  return total + 3;
}`,
    );
    expect(res.verdict).toBe('incorrect');
    expect(res.mistake?.type).toBe('off-by-one');
    expect(res.mistake?.confidence).toBe('heuristic');
    expect(res.mistake?.line).toBe(3);
  });

  it('cannot read host globals from student code', async () => {
    const res = await analyze(
      P('sum-evens'),
      `function sumEvens() {
  try { return typeof process + '|' + typeof require + '|' + typeof this.constructor.constructor; } catch (e) { return 'blocked'; }
}`,
    );
    expect(res.verdict).toBe('incorrect');
    for (const t of res.tests) expect(t.got).not.toContain('object');
  });
});
