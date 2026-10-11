import * as walk from 'acorn-walk';
import type { ErrorTypeId } from './errors.js';
import { findTargetFunction, parseProgram } from './instrument.js';

/**
 * Small, explainable pattern checks on the student's source. They only add a
 * hint when the tests have already failed; they never decide pass or fail.
 */

export interface StaticFinding {
  type: ErrorTypeId;
  line: number;
  note: string;
}

type AnyNode = any;

export function staticFindings(code: string, fnName: string): StaticFinding[] {
  const program = parseProgram(code);
  if (!program) return [];
  const findings: StaticFinding[] = [];

  const fn = findTargetFunction(program, fnName);
  const scope: AnyNode = fn ? fn.body : program;

  const checkLoopTest = (test: AnyNode) => {
    if (!test) return;
    walk.simple(test, {
      BinaryExpression(n: AnyNode) {
        if (
          n.operator === '<=' &&
          n.right.type === 'MemberExpression' &&
          !n.right.computed &&
          n.right.property.name === 'length'
        ) {
          findings.push({
            type: 'off-by-one',
            line: n.loc.start.line,
            note: 'The loop condition uses <= with .length. The last valid index is length − 1, so the loop reaches one position past the end.',
          });
        }
      },
    } as any);
  };

  const checkAssignInCondition = (test: AnyNode) => {
    if (!test) return;
    walk.simple(test, {
      AssignmentExpression(n: AnyNode) {
        if (n.operator === '=') {
          findings.push({
            type: 'wrong-operator',
            line: n.loc.start.line,
            note: 'A single = assigns a value. To compare two values inside a condition, use === .',
          });
        }
      },
    } as any);
  };

  walk.simple(scope, {
    ForStatement(n: AnyNode) {
      checkLoopTest(n.test);
      checkAssignInCondition(n.test);
    },
    WhileStatement(n: AnyNode) {
      checkLoopTest(n.test);
      checkAssignInCondition(n.test);
    },
    IfStatement(n: AnyNode) {
      checkAssignInCondition(n.test);
    },
    CallExpression(n: AnyNode) {
      if (
        n.callee.type === 'MemberExpression' &&
        !n.callee.computed &&
        n.callee.property.name === 'sort' &&
        n.arguments.length === 0
      ) {
        findings.push({
          type: 'sort-lexicographic',
          line: n.loc.start.line,
          note: 'sort() without a comparator compares items as text and sorts the original array in place.',
        });
      }
    },
  } as any);

  if (fn && fn.body.type === 'BlockStatement') {
    let hasReturn = false;
    let callsSelf = false;
    let hasBranch = false;
    walk.recursive(
      fn.body,
      null,
      {
        Function() {
          /* nested functions do not count */
        },
        ReturnStatement(n: AnyNode, st: any, c: any) {
          hasReturn = true;
          if (n.argument) c(n.argument, st);
        },
        CallExpression(n: AnyNode, st: any, c: any) {
          if (n.callee.type === 'Identifier' && n.callee.name === fnName) callsSelf = true;
          c(n.callee, st);
          n.arguments.forEach((a: AnyNode) => c(a, st));
        },
        IfStatement(n: AnyNode, st: any, c: any) {
          hasBranch = true;
          c(n.test, st);
          c(n.consequent, st);
          if (n.alternate) c(n.alternate, st);
        },
        ConditionalExpression(n: AnyNode, st: any, c: any) {
          hasBranch = true;
          c(n.test, st);
          c(n.consequent, st);
          c(n.alternate, st);
        },
      } as any,
    );
    if (!hasReturn) {
      findings.push({
        type: 'no-return',
        line: fn.loc!.start.line,
        note: 'The function never uses return, so it hands back undefined.',
      });
    }
    if (callsSelf && !hasBranch) {
      findings.push({
        type: 'base-case',
        line: fn.loc!.start.line,
        note: 'The function calls itself but has no condition that stops the recursion.',
      });
    }
  }

  return findings;
}
