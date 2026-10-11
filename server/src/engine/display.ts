/** Turns the sandbox's encoded JSON into the JavaScript-looking text students expect to see. */

const IDENT = /^[A-Za-z_$][\w$]*$/;

function render(v: unknown, depth: number): string {
  if (v === null) return 'null';
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    if (depth > 6) return '[…]';
    return '[' + v.map((x) => render(x, depth + 1)).join(', ') + ']';
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (typeof o.$ === 'string') {
      switch (o.$) {
        case 'bigint':
          return String(o.v) + 'n';
        case 'Map':
          return 'Map(' + render(o.v, depth + 1) + ')';
        case 'Set':
          return 'Set(' + render(o.v, depth + 1) + ')';
        default:
          return o.$;
      }
    }
    const keys = Object.keys(o);
    if (keys.length === 0) return '{}';
    if (depth > 6) return '{…}';
    return (
      '{ ' +
      keys.map((k) => (IDENT.test(k) ? k : JSON.stringify(k)) + ': ' + render(o[k], depth + 1)).join(', ') +
      ' }'
    );
  }
  return String(v);
}

export function fmtEncoded(encoded: string | undefined | null, max = 260): string {
  if (encoded === undefined || encoded === null) return 'undefined';
  let text: string;
  try {
    text = render(JSON.parse(encoded), 0);
  } catch {
    text = encoded;
  }
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

export function fmtArgs(args: unknown[]): string {
  return args.map((a) => fmtEncoded(JSON.stringify(a), 120)).join(', ');
}
