import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { StateEffect, StateField, type Extension } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useMemo, useRef } from 'react';

const setFlag = StateEffect.define<number | null>();

/** Marks one line as "the step that went wrong"; clears itself as soon as the text is edited. */
const flagField = StateField.define<number | null>({
  create: () => null,
  update(value, tr) {
    for (const e of tr.effects) if (e.is(setFlag)) return e.value;
    return tr.docChanged ? null : value;
  },
  provide: (f) =>
    EditorView.decorations.compute([f], (state) => {
      const line = state.field(f);
      if (!line || line > state.doc.lines) return Decoration.none;
      return Decoration.set([Decoration.line({ class: 'cm-flag-line' }).range(state.doc.line(line).from)]);
    }),
});

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: 'var(--accent)', fontWeight: '500' },
  { tag: [t.string, t.regexp, t.special(t.string)], color: 'var(--ok)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--warn)' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--ink-3)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--ink)', fontWeight: '500' },
  { tag: [t.propertyName, t.variableName], color: 'var(--ink)' },
  { tag: [t.operator, t.punctuation, t.bracket], color: 'var(--ink-2)' },
]);

interface Props {
  value: string;
  onChange: (v: string) => void;
  flagLine?: number | null;
  onSubmit?: () => void;
  minHeight?: string;
}

export function Editor({ value, onChange, flagLine, onSubmit, minHeight = '280px' }: Props) {
  const viewRef = useRef<EditorView | null>(null);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  const extensions = useMemo<Extension[]>(
    () => [
      javascript(),
      syntaxHighlighting(highlight),
      flagField,
      EditorView.contentAttributes.of({ 'aria-label': 'Code editor. Press Control or Command plus Enter to check.' }),
      EditorView.domEventHandlers({
        keydown(e) {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            submitRef.current?.();
            return true;
          }
          return false;
        },
      }),
    ],
    [],
  );

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: setFlag.of(flagLine ?? null) });
    if (flagLine && flagLine <= view.state.doc.lines) {
      const pos = view.state.doc.line(flagLine).from;
      view.dispatch({ effects: EditorView.scrollIntoView(pos, { y: 'nearest', yMargin: 40 }) });
    }
  }, [flagLine]);

  return (
    <div className="overflow-hidden rounded-[10px] border border-line-strong">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        minHeight={minHeight}
        maxHeight="560px"
        basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: false, searchKeymap: false }}
        onCreateEditor={(view) => {
          viewRef.current = view;
        }}
      />
    </div>
  );
}
