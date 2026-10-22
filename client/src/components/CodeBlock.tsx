import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { Lang } from '../content/howtos/types';

type Kind = 'kw' | 'str' | 'com' | 'num' | 'fn' | 'tag' | 'plain';
const KINDS: Record<Kind, string> = {
  kw: 'text-accent font-medium',
  str: 'text-ok',
  com: 'text-ink-3 italic',
  num: 'text-warn',
  fn: 'text-ink',
  tag: 'text-accent',
  plain: '',
};

const JS_KW =
  'import|from|export|default|const|let|var|function|return|if|else|async|await|try|catch|finally|throw|new|class|extends|for|of|in|while|true|false|null|undefined|typeof|switch|case|break|continue';
const TS_KW =
  JS_KW +
  '|interface|type|enum|implements|readonly|keyof|infer|as|is|asserts|declare|namespace|abstract|public|private|protected|satisfies|unknown|never|void|string|number|boolean|bigint|symbol|object|any|static|get|set|super|this|instanceof|do|delete|yield|extends|module';
const SQL_KW =
  'SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|IF|NOT|EXISTS|PRIMARY|KEY|GENERATED|ALWAYS|AS|IDENTITY|DEFAULT|NULL|CHECK|ORDER|BY|LIMIT|RETURNING|DROP|AND|OR|COUNT|NOW|BOOLEAN|TEXT|INTEGER|TIMESTAMPTZ|DATABASE|ASC|DESC|LENGTH|TRIM';

// One pass, first match wins, so a `//` inside a string is never read as a comment.
const RULES: Record<Lang, [Kind, RegExp][]> = {
  js: [
    ['com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['str', /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/y],
    ['num', /\b\d+(?:\.\d+)?\b/y],
    ['kw', new RegExp(`\\b(?:${JS_KW})\\b`, 'y')],
  ],
  ts: [],
  jsx: [],
  sql: [
    ['com', /--[^\n]*/y],
    ['str', /'(?:''|[^'])*'/y],
    ['num', /\b\d+\b/y],
    ['kw', new RegExp(`\\b(?:${SQL_KW})\\b`, 'iy')],
  ],
  bash: [
    ['com', /#[^\n]*/y],
    ['str', /'[^'\n]*'|"(?:\\.|[^"\\\n])*"/y],
    ['kw', /\b(?:cd|mkdir|npm|npx|node|curl|psql|docker|createdb|export|git)\b/y],
  ],
  json: [
    ['str', /"(?:\\.|[^"\\\n])*"/y],
    ['num', /-?\b\d+(?:\.\d+)?\b/y],
    ['kw', /\b(?:true|false|null)\b/y],
  ],
  env: [
    ['com', /#[^\n]*/y],
    ['kw', /^[A-Z_][A-Z0-9_]*(?==)/my],
  ],
  text: [],
};
RULES.jsx = [['tag', /<\/?[A-Za-z][\w.]*|\/?>/y], ...RULES.js];
RULES.ts = [...RULES.js.slice(0, 3), ['kw', new RegExp(`\\b(?:${TS_KW})\\b`, 'y')]];

export function highlight(code: string, lang: Lang): { kind: Kind; text: string }[] {
  const rules = RULES[lang];
  const out: { kind: Kind; text: string }[] = [];
  let plain = '';
  const flush = () => {
    if (plain) out.push({ kind: 'plain', text: plain });
    plain = '';
  };
  let i = 0;
  while (i < code.length) {
    let hit: { kind: Kind; text: string } | null = null;
    for (const [kind, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m.index === i && m[0].length > 0) {
        hit = { kind, text: m[0] };
        break;
      }
    }
    if (hit) {
      flush();
      out.push(hit);
      i += hit.text.length;
    } else {
      plain += code[i];
      i += 1;
    }
  }
  flush();
  return out;
}

/** Splits highlighted tokens into lines so single lines can be marked. */
function toLines(code: string, lang: Lang): { kind: Kind; text: string }[][] {
  const lines: { kind: Kind; text: string }[][] = [[]];
  for (const tok of highlight(code, lang)) {
    const parts = tok.text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ kind: tok.kind, text: part });
    });
  }
  return lines;
}

export function CodeBlock({
  code,
  lang,
  file,
  caption,
  flagLines,
}: {
  code: string;
  lang: Lang;
  file?: string;
  caption?: string;
  /** 1-based lines to mark, for example the lines a type error points at. */
  flagLines?: number[];
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the text is still selectable */
    }
  };

  const label = file ?? (lang === 'bash' ? 'Terminal' : lang.toUpperCase());

  return (
    <figure className="my-4 overflow-hidden rounded-lg border border-line bg-surface-2">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-3 py-1.5">
        <figcaption className="mono min-w-0 truncate text-xs text-ink-2">{label}</figcaption>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-2 hover:bg-surface-2 hover:text-ink"
          aria-label={`Copy ${file ?? 'code'}`}
        >
          {copied ? <Check className="size-3.5 text-ok" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre tabIndex={0} className="overflow-x-auto px-4 py-3 text-[13px] leading-[1.65] text-ink">
        <code className="mono !text-[13px]">
          {toLines(code, lang).map((line, n) => (
            <span key={n} className={flagLines?.includes(n + 1) ? 'cm-flag-line -mx-4 block px-4' : 'block'}>
              {line.length === 0 ? '\u200b' : line.map((t, i) => (
                <span key={i} className={KINDS[t.kind]}>
                  {t.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
      {caption && <p className="border-t border-line px-4 py-2 text-xs text-ink-2">{caption}</p>}
    </figure>
  );
}
