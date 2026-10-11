import { Table2, BarChart3 } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn, shortDate } from '../lib/format';

/** A card with a chart/table switch, so every chart has a non-visual twin. */
export function ChartCard({
  title,
  sub,
  chart,
  table,
  className,
}: {
  title: string;
  sub?: string;
  chart: ReactNode;
  table: { head: string[]; rows: (string | number)[][] };
  className?: string;
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  return (
    <section className={cn('rounded-xl border border-line bg-surface p-5', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold">{title}</h2>
          {sub && <p className="text-sm text-ink-2">{sub}</p>}
        </div>
        <button
          type="button"
          onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-2 hover:bg-surface-2 hover:text-ink"
          aria-label={view === 'chart' ? `Show ${title} as a table` : `Show ${title} as a chart`}
        >
          {view === 'chart' ? <Table2 className="size-3.5" aria-hidden /> : <BarChart3 className="size-3.5" aria-hidden />}
          {view === 'chart' ? 'Table' : 'Chart'}
        </button>
      </div>
      {view === 'chart' ? (
        chart
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-3">
                {table.head.map((h) => (
                  <th key={h} className="py-1.5 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i} className="border-b border-line/60 last:border-0">
                  {r.map((c, j) => (
                    <td key={j} className="py-1.5 pr-4 tabular-nums">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export interface BarRow {
  key: string;
  label: string;
  /** 0..max */
  value: number | null;
  /** Shown at the bar tip. */
  text: string;
  /** Muted text after the label. */
  sub?: string;
  /** Tooltip. */
  tip?: string;
  onClick?: () => void;
}

/** Horizontal bars: one hue, 10px thick, 4px rounded data-end, square at the baseline, value at the tip. */
export function BarList({ rows, max = 100 }: { rows: BarRow[]; max?: number }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = r.value === null ? 0 : Math.max(0, Math.min(100, (r.value / max) * 100));
        const inner = (
          <>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-ink">
                {r.label}
                {r.sub && <span className="ml-2 text-xs text-ink-3">{r.sub}</span>}
              </span>
              <span className="shrink-0 tabular-nums text-ink-2">{r.text}</span>
            </div>
            <div className="relative h-2.5 w-full rounded-r-[4px] bg-line/70" aria-hidden>
              <div
                className="h-full rounded-r-[4px] bg-series transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        );
        return (
          <li
            key={r.key}
            className="relative"
            onMouseEnter={() => setHover(r.key)}
            onMouseLeave={() => setHover(null)}
          >
            {r.onClick ? (
              <button type="button" onClick={r.onClick} className="block w-full rounded-md py-1 text-left hover:bg-surface-2" aria-label={r.tip ?? `${r.label}: ${r.text}`}>
                {inner}
              </button>
            ) : (
              <div className="py-1">{inner}</div>
            )}
            {hover === r.key && r.tip && (
              <div className="pointer-events-none absolute right-0 top-0 z-10 -translate-y-full rounded-md border border-line-strong bg-surface px-2.5 py-1.5 text-xs text-ink shadow-md">
                {r.tip}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export interface TrendPoint {
  date: string;
  accuracy: number | null;
  attempts: number;
}

/** 2px line, 8px end-dot with a surface ring, hairline gridlines, crosshair + tooltip on hover. */
export function TrendChart({ points }: { points: TrendPoint[] }) {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [hi, setHi] = useState<number | null>(null);
  const [W, setW] = useState(560);

  // Draw at the real pixel width so axis text keeps its size on narrow screens.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setW(Math.max(240, Math.round(el.getBoundingClientRect().width)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 210;
  const pad = { l: 44, r: 16, t: 14, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / 100) * ih;

  const withData = points.map((p, i) => ({ ...p, i })).filter((p) => p.accuracy !== null) as (TrendPoint & { i: number; accuracy: number })[];
  if (withData.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-3">Solve a problem and your accuracy over time will show up here.</p>;
  }
  const path = withData.map((p, k) => `${k === 0 ? 'M' : 'L'}${x(p.i).toFixed(1)},${y(p.accuracy).toFixed(1)}`).join(' ');
  const area = `${path} L${x(withData[withData.length - 1].i).toFixed(1)},${y(0)} L${x(withData[0].i).toFixed(1)},${y(0)} Z`;
  const last = withData[withData.length - 1];

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = withData[0];
    for (const p of withData) if (Math.abs(x(p.i) - px) < Math.abs(x(best.i) - px)) best = p;
    setHi(best.i);
  };
  const hp = hi !== null ? withData.find((p) => p.i === hi) : undefined;
  const labelIdx = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <div ref={box} className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="block touch-none"
        role="img"
        aria-label={`Daily accuracy over the last ${points.length} days. Latest: ${last.accuracy} percent.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHi(null)}
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--series)" stopOpacity="0.12" />
            <stop offset="1" stopColor="var(--series)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 50, 100].map((g) => (
          <g key={g}>
            <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.l - 8} y={y(g) + 4} textAnchor="end" fontSize="12" fill="var(--ink-3)">
              {g}%
            </text>
          </g>
        ))}
        {labelIdx.map((i, k) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={k === 0 ? 'start' : k === 2 ? 'end' : 'middle'} fontSize="12" fill="var(--ink-3)">
            {shortDate(points[i].date)}
          </text>
        ))}
        <path d={area} fill={`url(#${id}-fill)`} />
        <path d={path} fill="none" stroke="var(--series)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hp && <line x1={x(hp.i)} x2={x(hp.i)} y1={pad.t} y2={pad.t + ih} stroke="var(--line-strong)" strokeWidth="1" />}
        {withData.map((p) => (
          <circle key={p.i} cx={x(p.i)} cy={y(p.accuracy)} r={hp?.i === p.i || p.i === last.i ? 4.5 : 0} fill="var(--series)" stroke="var(--surface)" strokeWidth="2" />
        ))}
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-line-strong bg-surface px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: Math.min(Math.max(x(hp.i), 80), W - 80), top: y(hp.accuracy) - 10, transform: 'translate(-50%, -100%)' }}
        >
          <div className="font-medium text-ink">{shortDate(hp.date)}</div>
          <div className="text-ink-2">
            {hp.accuracy}% correct · {hp.attempts} {hp.attempts === 1 ? 'attempt' : 'attempts'}
          </div>
        </div>
      )}
    </div>
  );
}
