import { Bug, Gauge, LayoutDashboard, ListChecks, LogOut, MessageCircle, Moon, RotateCcw, Sun, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/format';
import { Logo } from './ui';

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/practice', label: 'Practice', icon: ListChecks },
  { to: '/app/skills', label: 'Skill map', icon: Gauge },
  { to: '/app/mistakes', label: 'Mistakes', icon: Bug },
  { to: '/app/drill', label: '5-minute drill', icon: Timer },
  { to: '/app/coach', label: 'Coach', icon: MessageCircle },
];

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('ct-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignore */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('ct-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))] as const;
}

export function Shell() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [theme, toggle] = useTheme();
  const [resetting, setResetting] = useState(false);

  const reset = async () => {
    setResetting(true);
    try {
      await api.resetDemo();
      window.location.assign('/app');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <Logo />
          <div className="font-display text-lg font-bold leading-none">CodeTrace</div>
        </div>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                )
              }
            >
              <Icon className="size-[18px]" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-line pt-3">
          {user?.demo && (
            <button
              type="button"
              onClick={reset}
              disabled={resetting}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              <RotateCcw className="size-[18px]" aria-hidden />
              Reset demo data
            </button>
          )}
          <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            {theme === 'dark' ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="flex items-center gap-2.5 px-2.5 pb-1 pt-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent" aria-hidden>
              {user?.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.name}</div>
              <div className="truncate text-xs text-ink-3">{user?.demo ? 'Demo account' : user?.email}</div>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              title="Sign out"
              onClick={async () => {
                await signOut();
                nav('/login');
              }}
              className="rounded-md p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-display text-base font-bold">CodeTrace</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={toggle} aria-label="Toggle dark mode" className="rounded-md p-2 text-ink-2 hover:bg-surface-2">
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            aria-label="Sign out"
            onClick={async () => {
              await signOut();
              nav('/login');
            }}
            className="rounded-md p-2 text-ink-2 hover:bg-surface-2"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="min-w-0 px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-9">
        <div className="mx-auto w-full max-w-[1080px]">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 px-1 py-2 text-[10.5px] font-medium', isActive ? 'text-accent' : 'text-ink-3')
            }
          >
            <Icon className="size-5" aria-hidden />
            <span className="max-w-full truncate">{label.replace('5-minute drill', 'Drill').replace('Dashboard', 'Home').replace('Skill map', 'Skills')}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
