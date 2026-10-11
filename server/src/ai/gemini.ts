import { GoogleGenAI } from '@google/genai';
import { aiEnabled, config } from '../config.js';

/**
 * The only file that talks to Gemini.
 * The AI never decides correctness: it receives what the engine decided and
 * puts it into words, or reads handwriting. Every call has an offline fallback.
 */

export type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

let client: GoogleGenAI | null = null;
const getClient = () => (client ??= new GoogleGenAI({ apiKey: config.geminiKey! }));

/** Returns the model's text, or null if there is no key or every model failed (rate limit, outage, bad key). */
export async function generate(opts: {
  system: string;
  parts: Part[];
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  if (!aiEnabled()) return null;
  const models = [config.geminiModel, config.geminiFallbackModel].filter((m, i, a) => a.indexOf(m) === i);
  for (const model of models) {
    try {
      const res = await getClient().models.generateContent({
        model,
        contents: [{ role: 'user', parts: opts.parts }],
        config: {
          systemInstruction: opts.system,
          maxOutputTokens: opts.maxOutputTokens ?? 700,
          temperature: opts.temperature ?? 0.4,
        },
      });
      const text = res.text?.trim();
      if (text) return text;
    } catch (err) {
      console.warn(`[gemini] ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }
  return null;
}
