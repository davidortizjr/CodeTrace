/**
 * Runs a snippet exactly the way the course does (the same sandbox and TypeScript checker),
 * so you can see what an example prints before you write it into a lesson.
 *
 *   npm run try -- path/to/snippet.js
 *   npm run try -- path/to/snippet.ts
 *   echo "console.log(1 + 1)" | npm run try -- --js
 */
import fs from 'node:fs';
import { runSnippet } from '../src/course/run.js';

const args = process.argv.slice(2);
const flag = args.find((a) => a === '--js' || a === '--ts');
const file = args.find((a) => !a.startsWith('--'));
const lang = flag ? (flag.slice(2) as 'js' | 'ts') : file?.endsWith('.ts') ? 'ts' : 'js';
const code = file ? fs.readFileSync(file, 'utf8') : fs.readFileSync(0, 'utf8');

const r = await runSnippet(lang, code);
if (r.syntaxError) console.log(`SYNTAX ERROR${r.syntaxError.line ? ` (line ${r.syntaxError.line})` : ''}: ${r.syntaxError.message}`);
for (const d of r.diagnostics) console.log(`TS${d.code} line ${d.line}:${d.col}  ${d.message}`);
console.log(JSON.stringify(r.output));
if (r.error) console.log(`ERROR${r.error.line ? ` (line ${r.error.line})` : ''}: ${r.error.name}: ${r.error.message}`);
