import 'dotenv/config';

const clean = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export const config = {
  port: Number(process.env.PORT) || 8787,
  clientOrigin: clean(process.env.CLIENT_ORIGIN) ?? 'http://localhost:5173',
  supabaseUrl: clean(process.env.SUPABASE_URL),
  supabaseServiceKey: clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  geminiKey: clean(process.env.GEMINI_API_KEY),
  geminiModel: clean(process.env.GEMINI_MODEL) ?? 'gemini-3.5-flash',
  geminiFallbackModel: clean(process.env.GEMINI_FALLBACK_MODEL) ?? 'gemini-3.5-flash-lite',
  isProd: process.env.NODE_ENV === 'production',
};

export const supabaseEnabled = () => !!(config.supabaseUrl && config.supabaseServiceKey);
export const aiEnabled = () => !!config.geminiKey;
