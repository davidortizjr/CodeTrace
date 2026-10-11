import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setTokenProvider } from './api';
import { supabase } from './supabase';
import type { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  accounts: boolean;
  signInDemo: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  /** Resolves to 'confirm' when the project requires email confirmation first. */
  signUp: (name: string, email: string, password: string) => Promise<'ok' | 'confirm'>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

const DEMO_KEY = 'ct-demo';
const readDemo = () => {
  try {
    return localStorage.getItem(DEMO_KEY) === '1';
  } catch {
    return false;
  }
};
const writeDemo = (on: boolean) => {
  try {
    if (on) localStorage.setItem(DEMO_KEY, '1');
    else localStorage.removeItem(DEMO_KEY);
  } catch {
    /* storage unavailable: demo mode just won't persist across reloads */
  }
};

const fromSession = (s: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } }): User => {
  const meta = s.user.user_metadata ?? {};
  return {
    id: s.user.id,
    email: s.user.email ?? undefined,
    name: (typeof meta.name === 'string' && meta.name) || s.user.email?.split('@')[0] || 'Student',
    demo: false,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(readDemo());

  useEffect(() => {
    setTokenProvider(async () => {
      if (readDemo()) return 'demo';
      if (!supabase) return null;
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (demo) {
        try {
          const r = await api.demoLogin();
          if (!cancelled) setUser(r.user);
        } catch {
          writeDemo(false);
          if (!cancelled) setDemo(false);
        }
        if (!cancelled) setLoading(false);
        return;
      }
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setUser(data.session ? fromSession(data.session) : null);
        setLoading(false);
      }
    })();
    const sub = supabase?.auth.onAuthStateChange((_evt, session) => {
      if (readDemo()) return;
      setUser(session ? fromSession(session) : null);
    });
    return () => {
      cancelled = true;
      sub?.data.subscription.unsubscribe();
    };
  }, [demo]);

  const signInDemo = useCallback(async () => {
    const r = await api.demoLogin();
    writeDemo(true);
    setUser(r.user);
    setDemo(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Accounts are not set up on this deployment. Use the demo.');
    writeDemo(false);
    setDemo(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!supabase) throw new Error('Accounts are not set up on this deployment. Use the demo.');
    writeDemo(false);
    setDemo(false);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw new Error(error.message);
    return data.session ? 'ok' : 'confirm';
  }, []);

  const signOut = useCallback(async () => {
    writeDemo(false);
    setDemo(false);
    setUser(null);
    await supabase?.auth.signOut();
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, accounts: !!supabase, signInDemo, signIn, signUp, signOut }),
    [user, loading, signInDemo, signIn, signUp, signOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
