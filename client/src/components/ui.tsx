import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn, DIFFICULTY } from '../lib/format';

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path d="M6 21 L13 21 L13 11 L20 11" fill="none" stroke="var(--accent-ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
      <circle cx="24.5" cy="11" r="3.2" fill="#ff6b5e" />
    </svg>
  );
}

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  variant = 'secondary',
  busy,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; busy?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || busy}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60',
        variant === 'primary' && 'bg-accent text-accent-ink hover:brightness-110',
        variant === 'secondary' && 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
        variant === 'ghost' && 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        className,
      )}
    >
      {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-xl border border-line bg-surface', className)}>{children}</section>;
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[28px] font-bold">{title}</h1>
        {sub && <p className="mt-1 max-w-prose text-ink-2">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-10 text-ink-2" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {label}…
    </div>
  );
}

export function ErrorNote({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-flag/40 bg-flag-soft px-4 py-3 text-sm text-flag">
      <span className="min-w-0 flex-1">{children}</span>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="!py-1">
          Try again
        </Button>
      )}
    </div>
  );
}

export function Difficulty({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-3" title={DIFFICULTY[level]}>
      <span className="inline-flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn('size-1.5 rounded-full', i <= level ? 'bg-ink-2' : 'bg-line-strong')} />
        ))}
      </span>
      {DIFFICULTY[level]}
    </span>
  );
}

export function Pill({ tone = 'neutral', children }: { tone?: 'neutral' | 'ok' | 'flag' | 'warn' | 'accent'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        tone === 'neutral' && 'bg-surface-2 text-ink-2 ring-1 ring-line',
        tone === 'ok' && 'bg-ok-soft text-ok',
        tone === 'flag' && 'bg-flag-soft text-flag',
        tone === 'warn' && 'bg-warn-soft text-warn',
        tone === 'accent' && 'bg-accent-soft text-accent',
      )}
    >
      {children}
    </span>
  );
}

/** Renders `inline code` and paragraphs from plain model/engine text. Never injects HTML. */
export function Prose({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());
  return (
    <div className="prose-ct text-[15px] leading-relaxed text-ink">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p.split(/(`[^`\n]+`)/g).map((chunk, j) =>
            chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2 ? (
              <code key={j}>{chunk.slice(1, -1)}</code>
            ) : (
              <span key={j}>{chunk.replace(/\*\*(.+?)\*\*/g, '$1')}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}
