import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aiEnabled, config, supabaseEnabled } from './config.js';
import { getCache } from './engine/analyze.js';
import { PROBLEMS } from './problems/bank.js';
import { api } from './routes/api.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  cors({
    origin: config.clientOrigin.split(',').map((s) => s.trim()),
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '6mb' }));

app.use('/api', api);
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// In production the server also serves the built client.
const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = typeof (err as any)?.status === 'number' ? (err as any).status : 500;
  if (status >= 500) console.error('[server]', err);
  res.status(status).json({
    error: status === 413 ? 'That upload is too large.' : status >= 500 ? 'Something went wrong on the server. Try again.' : 'Bad request.',
  });
});

app.listen(config.port, () => {
  console.log(`CodeTrace server on http://localhost:${config.port}`);
  console.log(`  Gemini: ${aiEnabled() ? config.geminiModel : 'off (using offline wording)'}`);
  console.log(`  Supabase: ${supabaseEnabled() ? 'on' : 'off (demo account only)'}`);
  // Warm the reference cache so the first check is fast.
  void Promise.all(PROBLEMS.map((p) => getCache(p))).then(
    () => console.log(`  Warmed ${PROBLEMS.length} problems`),
    (e) => console.error('  Warm-up failed:', e),
  );
});
