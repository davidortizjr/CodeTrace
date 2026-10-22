import type { ReactNode } from 'react';

/** `code` and **bold** in guide text. Everything else is plain text; nothing is parsed as HTML. */
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  text.split(/(`[^`\n]+`)/g).forEach((chunk, i) => {
    if (chunk.length > 2 && chunk.startsWith('`') && chunk.endsWith('`')) {
      out.push(
        <code key={i} className="rounded-[5px] border border-line bg-surface-2 px-1.5 py-px text-[0.9em]">
          {chunk.slice(1, -1)}
        </code>,
      );
      return;
    }
    chunk.split(/(\*\*[^*]+\*\*)/g).forEach((part, j) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) out.push(<strong key={`${i}-${j}`}>{part.slice(2, -2)}</strong>);
      else if (part) out.push(<span key={`${i}-${j}`}>{part}</span>);
    });
  });
  return <>{out}</>;
}
