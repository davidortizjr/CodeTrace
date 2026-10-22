/**
 * The error taxonomy. Every verdict the engine gives maps to one of these.
 * The AI layer never invents a type; it only receives the one the engine chose.
 */

export type ErrorTypeId =
  | 'syntax'
  | 'runtime'
  | 'timeout'
  | 'missing-function'
  | 'no-return'
  | 'off-by-one'
  | 'bad-init'
  | 'wrong-operator'
  | 'boundary'
  | 'edge-case'
  | 'case-handling'
  | 'mutation'
  | 'sort-lexicographic'
  | 'coercion'
  | 'control-flow'
  | 'base-case'
  | 'logic'
  | 'ts-mismatch'
  | 'ts-missing-prop'
  | 'ts-null'
  | 'ts-implicit-any'
  | 'ts-unknown-name'
  | 'ts-narrowing'
  | 'ts-too-loose'
  | 'ts-any'
  | 'ts-other';

export type ErrorCategory =
  | 'Syntax & runtime'
  | 'Off-by-one & bounds'
  | 'Initialization'
  | 'Operators & comparison'
  | 'Edge cases'
  | 'State & mutation'
  | 'Control flow'
  | 'Types & coercion'
  | 'Type system'
  | 'Logic';

export interface ErrorTypeInfo {
  label: string;
  category: ErrorCategory;
  why: string;
  fix: string;
  ask: string[];
}

export const ERROR_TYPES: Record<ErrorTypeId, ErrorTypeInfo> = {
  syntax: {
    label: 'Syntax error',
    category: 'Syntax & runtime',
    why: 'The code could not be parsed, so nothing ran.',
    fix: 'Read the message and look at the line it points to, then the line before it. Missing brackets, quotes and commas are the usual cause.',
    ask: [
      'Which line does the error message point at?',
      'Does every opening bracket, brace and quote on that line and the one above have a partner?',
    ],
  },
  runtime: {
    label: 'Runtime error',
    category: 'Syntax & runtime',
    why: 'The code ran but crashed on at least one input.',
    fix: 'Find the input that crashes and walk through the code with it. The message names the value that was not what you expected.',
    ask: [
      'Which test input crashed, and what does the message say the value was?',
      'On that input, which variable could be undefined or the wrong type at that line?',
    ],
  },
  timeout: {
    label: 'Runs forever',
    category: 'Control flow',
    why: 'The code did not finish in time. A loop or recursion never reaches its stopping condition.',
    fix: 'Check that something inside the loop moves it toward the stop condition on every pass.',
    ask: [
      'What has to become true for the loop to stop?',
      'Does anything inside the loop change the variable used in that condition?',
    ],
  },
  'missing-function': {
    label: 'Function not found',
    category: 'Syntax & runtime',
    why: 'The tests call a function by name and it was not defined.',
    fix: 'Keep the function name from the starter code exactly as it is.',
    ask: ['Does the function name in your code match the starter code letter for letter?'],
  },
  'no-return': {
    label: 'No value returned',
    category: 'Control flow',
    why: 'The function finished without returning a value, so the caller gets undefined.',
    fix: 'Add a return statement with the result on every path through the function.',
    ask: [
      'What should the function hand back to whoever calls it?',
      'Is there a path through the function that ends without a return?',
    ],
  },
  'off-by-one': {
    label: 'Off by one',
    category: 'Off-by-one & bounds',
    why: 'A loop or index starts or stops one position too early or too late.',
    fix: 'Write out the first and last index you want to visit, then check your start and stop conditions against them.',
    ask: [
      'For an array of length 3, which indexes should the loop visit?',
      'Does your condition include the last one? Does it include one that does not exist?',
    ],
  },
  'bad-init': {
    label: 'Wrong starting value',
    category: 'Initialization',
    why: 'A variable starts with a value that bends every later step.',
    fix: 'Pick the starting value that does nothing to the first step: 0 for sums, 1 for products, an empty collection for building results.',
    ask: [
      'What should the variable be before the first item is processed?',
      'If the input were empty, what would your function return?',
    ],
  },
  'wrong-operator': {
    label: 'Wrong operator',
    category: 'Operators & comparison',
    why: 'An operator does a different job than the one the problem needs.',
    fix: 'Say the step out loud in words, then check that the operator you wrote means exactly that.',
    ask: [
      'Which operator in the failing step is doing the real work?',
      'What would that operator give for one small input you can check by hand?',
    ],
  },
  boundary: {
    label: 'Boundary comparison',
    category: 'Operators & comparison',
    why: 'A comparison is off exactly at the edge values, for example > where >= was needed.',
    fix: 'Test the exact boundary values from the problem statement and decide whether each one is included.',
    ask: [
      'Is the boundary value itself included in the range?',
      'What does your code return for exactly that value?',
    ],
  },
  'edge-case': {
    label: 'Missed edge case',
    category: 'Edge cases',
    why: 'The code works for typical input but not for an unusual one such as empty, negative, repeated or very large.',
    fix: 'List the unusual inputs the problem allows and trace your code with each one.',
    ask: [
      'Which kinds of input did the failing tests use that your own examples did not?',
      'What does each line do when the input is empty or at its limit?',
    ],
  },
  'case-handling': {
    label: 'Letter case not handled',
    category: 'Edge cases',
    why: 'Uppercase and lowercase letters are treated as different characters.',
    fix: 'Normalise the text with toLowerCase() or toUpperCase() before comparing.',
    ask: [
      'Are "A" and "a" the same thing for this problem?',
      'Where in your code does a letter get compared to something?',
    ],
  },
  mutation: {
    label: 'Changed the input',
    category: 'State & mutation',
    why: 'The function modified the array or object it was given. The problem asks for a new value and an untouched original.',
    fix: 'Copy first (spread, slice, or build a new result) and work on the copy.',
    ask: [
      'Which method call in your code changes the array or object in place?',
      'What would the caller see in their own variable after your function ran?',
    ],
  },
  'sort-lexicographic': {
    label: 'Default sort compares text',
    category: 'Types & coercion',
    why: 'Array.sort() with no comparator turns numbers into strings and sorts them alphabetically, so 10 comes before 9. It also sorts the original array in place.',
    fix: 'Pass a comparator such as (a, b) => a - b, or avoid sorting if you do not need it.',
    ask: [
      'How does 10 compare to 9 when both are treated as text?',
      'Does the problem actually need the values sorted?',
    ],
  },
  coercion: {
    label: 'Wrong type returned',
    category: 'Types & coercion',
    why: 'The value is right but its type is not: a number where a string was expected, or the reverse.',
    fix: 'Convert explicitly with String(), Number() or template strings at the point you build the result.',
    ask: [
      'What type does the problem say each result item should be?',
      'What type is the value in your code at the moment you add it to the result?',
    ],
  },
  'control-flow': {
    label: 'Conditions in the wrong order',
    category: 'Control flow',
    why: 'A branch catches inputs meant for a later branch, so the later branch never runs.',
    fix: 'Put the most specific condition first, or make the conditions mutually exclusive.',
    ask: [
      'Which input should reach the last branch?',
      'Does an earlier condition already match it?',
    ],
  },
  'base-case': {
    label: 'Base case problem',
    category: 'Control flow',
    why: 'A recursive function needs a stopping case that returns the right answer for the smallest input. Here it is missing or returns the wrong value.',
    fix: 'Decide the smallest input, decide its answer, return it before the recursive call.',
    ask: [
      'What is the smallest input this function should handle?',
      'What should it return for that input without calling itself?',
    ],
  },
  logic: {
    label: 'Logic error',
    category: 'Logic',
    why: 'The code runs without crashing but its steps do not produce the right result.',
    fix: 'Pick the smallest failing test and write down what each line does to your variables, then compare that with what the problem asks.',
    ask: [
      'What is the smallest test that fails?',
      'After each line runs on that input, what are the values of your variables, and what should they be?',
    ],
  },
  'ts-mismatch': {
    label: 'Type mismatch',
    category: 'Type system',
    why: 'A value of one type was used where TypeScript expects another, for example a string where a number is required.',
    fix: 'Read the two types in the message: the one you gave and the one expected. Change the value, convert it, or fix the type you declared if it was wrong.',
    ask: [
      'Which type does the message say was expected, and which did you provide?',
      'Is the declared type wrong, or is the value wrong?',
    ],
  },
  'ts-missing-prop': {
    label: 'Missing or unknown property',
    category: 'Type system',
    why: 'The code uses a property the type does not have, or builds an object that is missing a property its type requires.',
    fix: 'Compare the object with its type: add the missing property, remove the extra one, or fix a misspelled name.',
    ask: [
      'Which properties does the type list?',
      'Which one is missing from your object, or spelled differently?',
    ],
  },
  'ts-null': {
    label: 'Possibly null or undefined',
    category: 'Type system',
    why: 'The value can be null or undefined at this point, and the code uses it as if it always exists.',
    fix: 'Check for the missing case first (an if, ?. or ??) so TypeScript knows the value is there before you use it.',
    ask: [
      'In which situation is this value null or undefined?',
      'What should the code do in that situation?',
    ],
  },
  'ts-implicit-any': {
    label: 'Missing type annotation',
    category: 'Type system',
    why: 'TypeScript could not work out a type here, so it would fall back to any, which turns checking off. Strict mode refuses.',
    fix: 'Write the type on the parameter or variable.',
    ask: [
      'What kind of value does this parameter receive?',
      'Which type describes it?',
    ],
  },
  'ts-unknown-name': {
    label: 'Name not found',
    category: 'Type system',
    why: 'The code uses a name (a variable, function or type) that is not defined in this scope, or is spelled differently from its declaration.',
    fix: 'Check the spelling and capital letters against the declaration, and make sure it is declared before it is used.',
    ask: [
      'Where is this name declared?',
      'Does the spelling match exactly, including capitals?',
    ],
  },
  'ts-narrowing': {
    label: 'Type not narrowed',
    category: 'Type system',
    why: 'The value could be several types (or unknown), and the code does something that only works for one of them without checking first.',
    fix: 'Narrow the type before using it: typeof, instanceof, in, or a check on a shared literal property.',
    ask: [
      'Which types can this value be at this line?',
      'Which check would tell them apart?',
    ],
  },
  'ts-too-loose': {
    label: 'Type accepts too much',
    category: 'Type system',
    why: 'The exercise expects TypeScript to reject some code, but your type lets it through. The type is wider than it should be.',
    fix: 'Make the type more specific: a literal or union instead of string, a required property instead of an optional one, a narrower parameter type.',
    ask: [
      'Which line was supposed to be an error?',
      'Which part of your type lets that value in?',
    ],
  },
  'ts-any': {
    label: 'Checker switched off',
    category: 'Type system',
    why: 'The code uses any, @ts-ignore or a similar escape hatch. That makes errors disappear without fixing them.',
    fix: 'Write the real type. If you truly do not know the type yet, use unknown and narrow it.',
    ask: [
      'What is the real type of this value?',
      'Could unknown plus a check do the job?',
    ],
  },
  'ts-other': {
    label: 'Type error',
    category: 'Type system',
    why: 'The TypeScript compiler rejected the code.',
    fix: 'Read the compiler message for the line it points at. It names the types involved.',
    ask: [
      'What does the message say, in your own words?',
      'Which types are involved on that line?',
    ],
  },
};

export const ERROR_CATEGORIES: ErrorCategory[] = [
  'Syntax & runtime',
  'Off-by-one & bounds',
  'Initialization',
  'Operators & comparison',
  'Edge cases',
  'State & mutation',
  'Control flow',
  'Types & coercion',
  'Type system',
  'Logic',
];
