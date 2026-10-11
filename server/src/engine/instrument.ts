import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

/**
 * Adds trace calls to a function so the sandbox can record what its variables
 * held after every statement. Pure source rewriting: nothing here runs code.
 */

export interface InstrumentResult {
  ok: boolean;
  code: string;
  /** Variables that are snapshotted. */
  vars: string[];
  reason?: string;
}

type Node = acorn.Node & Record<string, any>;

interface Edit {
  pos: number;
  order: number;
  text: string;
}

const IDENT = /^[A-Za-z_$][\w$]*$/;

function patternNames(node: Node | null | undefined, out: Set<string>) {
  if (!node) return;
  switch (node.type) {
    case 'Identifier':
      out.add(node.name);
      break;
    case 'AssignmentPattern':
      patternNames(node.left, out);
      break;
    case 'RestElement':
      patternNames(node.argument, out);
      break;
    case 'ArrayPattern':
      node.elements.forEach((e: Node | null) => patternNames(e, out));
      break;
    case 'ObjectPattern':
      node.properties.forEach((p: Node) => patternNames(p.type === 'RestElement' ? p.argument : p.value, out));
      break;
  }
}

export function findTargetFunction(program: Node, fnName: string): Node | null {
  for (const stmt of program.body as Node[]) {
    if (stmt.type === 'FunctionDeclaration' && stmt.id?.name === fnName) return stmt;
    if (stmt.type === 'VariableDeclaration') {
      for (const d of stmt.declarations as Node[]) {
        if (
          d.id?.type === 'Identifier' &&
          d.id.name === fnName &&
          d.init &&
          (d.init.type === 'FunctionExpression' || d.init.type === 'ArrowFunctionExpression')
        ) {
          return d.init;
        }
      }
    }
  }
  return null;
}

/** Names declared inside the function (params + let/const/var), not counting nested functions. */
export function collectLocals(fn: Node): string[] {
  const names = new Set<string>();
  (fn.params as Node[]).forEach((p) => patternNames(p, names));
  walk.recursive(
    fn.body as any,
    null,
    {
      Function() {
        /* skip nested functions */
      },
      VariableDeclarator(node: any, st: any, c: any) {
        patternNames(node.id, names);
        if (node.init) c(node.init, st);
      },
    } as any,
  );
  return [...names].filter((n) => IDENT.test(n));
}

export function instrument(code: string, fnName: string, watch: string[] | 'auto'): InstrumentResult {
  let program: Node;
  try {
    program = acorn.parse(code, {
      ecmaVersion: 2022,
      locations: true,
      sourceType: 'script',
    }) as Node;
  } catch (e) {
    return { ok: false, code, vars: [], reason: 'parse' };
  }

  const fn = findTargetFunction(program, fnName);
  if (!fn || fn.body.type !== 'BlockStatement') {
    return { ok: false, code, vars: [], reason: 'no-function' };
  }

  const vars = (watch === 'auto' ? collectLocals(fn) : watch).filter((n) => IDENT.test(n));
  const snapshot = '{' + vars.map((n) => `${JSON.stringify(n)}:__v(()=>${n})`).join(',') + '}';
  const call = (line: number, kind: string) => `__t(${line},${JSON.stringify(kind)},${snapshot});`;

  const edits: Edit[] = [];
  let order = 0;
  const insert = (pos: number, text: string) => edits.push({ pos, order: order++, text });

  const visitList = (stmts: Node[]) => {
    for (const s of stmts) visitStmt(s);
  };

  const visitSub = (child: Node | null | undefined) => {
    if (!child) return;
    if (child.type === 'BlockStatement') {
      visitList(child.body);
    } else {
      insert(child.start, '{');
      visitList([child]);
      insert(child.end, '}');
    }
  };

  const visitStmt = (s: Node) => {
    const line = s.loc!.start.line;
    switch (s.type) {
      case 'ReturnStatement':
      case 'ThrowStatement':
        insert(s.start, call(line, s.type === 'ReturnStatement' ? 'return' : 'stmt'));
        break;
      case 'ExpressionStatement':
      case 'VariableDeclaration':
        insert(s.end, ';' + call(line, 'stmt'));
        break;
      case 'IfStatement':
        visitSub(s.consequent);
        visitSub(s.alternate);
        break;
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
      case 'LabeledStatement':
        visitSub(s.body);
        break;
      case 'BlockStatement':
        visitList(s.body);
        break;
      case 'TryStatement':
        visitList(s.block.body);
        if (s.handler) visitList(s.handler.body.body);
        if (s.finalizer) visitList(s.finalizer.body);
        break;
      case 'SwitchStatement':
        for (const c of s.cases as Node[]) visitList(c.consequent);
        break;
      default:
        break;
    }
  };

  // Entry snapshot so the first trace row shows the parameters.
  insert(fn.body.start + 1, call(fn.loc!.start.line, 'enter'));
  visitList(fn.body.body);

  // Apply from the end; for equal positions later edits are applied first so
  // that the final text keeps insertion order.
  edits.sort((a, b) => b.pos - a.pos || b.order - a.order);
  let out = code;
  for (const e of edits) out = out.slice(0, e.pos) + e.text + out.slice(e.pos);
  return { ok: true, code: out, vars };
}

/** Parses once and exposes the AST for the static rules. */
export function parseProgram(code: string): Node | null {
  try {
    return acorn.parse(code, { ecmaVersion: 2022, locations: true, sourceType: 'script' }) as Node;
  } catch {
    return null;
  }
}
