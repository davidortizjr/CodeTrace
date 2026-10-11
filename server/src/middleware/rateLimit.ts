import type { NextFunction, Request, Response } from 'express';

/** Small in-memory sliding-window limiter, keyed by user. Good enough for one server process. */
export function rateLimit(opts: { windowMs: number; max: number; message?: string }) {
  const hits = new Map<string, number[]>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.user?.id ?? req.ip ?? 'anon';
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < opts.windowMs);
    if (recent.length >= opts.max) {
      const wait = Math.ceil((opts.windowMs - (now - recent[0])) / 1000);
      res.setHeader('Retry-After', String(wait));
      res.status(429).json({ error: opts.message ?? `Too many requests. Try again in ${wait}s.` });
      return;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.delete(hits.keys().next().value as string);
    next();
  };
}
