import type { NextFunction, Request, Response } from 'express';
import { supabaseEnabled } from './config.js';
import { supabaseAdmin } from './store/supabase.js';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  demo: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const DEMO_TOKEN = 'demo';
export const DEMO_USER: AuthUser = { id: 'demo', name: 'Sam Reyes', demo: true };

const cache = new Map<string, { user: AuthUser; until: number }>();
const TTL_MS = 60_000;

export async function authenticate(header: string | undefined): Promise<AuthUser | null> {
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  if (token === DEMO_TOKEN) return DEMO_USER;
  if (!supabaseEnabled()) return null;

  const hit = cache.get(token);
  if (hit && hit.until > Date.now()) return hit.user;

  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email ?? undefined,
    name: (typeof meta.name === 'string' && meta.name) || data.user.email?.split('@')[0] || 'Student',
    demo: false,
  };
  cache.set(token, { user, until: Date.now() + TTL_MS });
  if (cache.size > 500) cache.delete(cache.keys().next().value as string);
  return user;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await authenticate(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Sign in to continue.' });
    return;
  }
  req.user = user;
  next();
}
