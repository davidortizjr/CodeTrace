import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import type { Attempt, AttemptSummary, NewAttempt, NewQuizResult, QuizResult, Store } from './types.js';

let client: SupabaseClient | null = null;

/** Server-side client using the service-role key. Never expose this key to the browser. */
export function supabaseAdmin(): SupabaseClient {
  if (!config.supabaseUrl || !config.supabaseServiceKey) throw new Error('Supabase is not configured');
  client ??= createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

const SUMMARY_COLUMNS = 'id,problem_id,topic,correct,passed,total,error_type,confidence,created_at';

const toSummary = (r: any): AttemptSummary => ({
  id: r.id,
  problemId: r.problem_id,
  topic: r.topic,
  correct: r.correct,
  passed: r.passed,
  total: r.total,
  errorType: r.error_type,
  confidence: r.confidence,
  createdAt: r.created_at,
});

export class SupabaseStore implements Store {
  async add(a: NewAttempt): Promise<Attempt> {
    const { data, error } = await supabaseAdmin()
      .from('attempts')
      .insert({
        user_id: a.userId,
        problem_id: a.problemId,
        topic: a.topic,
        correct: a.correct,
        passed: a.passed,
        total: a.total,
        error_type: a.errorType,
        confidence: a.confidence,
        code: a.code,
        analysis: a.analysis,
      })
      .select('*')
      .single();
    if (error) throw new Error(`Could not save attempt: ${error.message}`);
    return { ...toSummary(data), userId: a.userId, code: data.code, analysis: data.analysis };
  }

  async list(userId: string): Promise<AttemptSummary[]> {
    const { data, error } = await supabaseAdmin()
      .from('attempts')
      .select(SUMMARY_COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(2000);
    if (error) throw new Error(`Could not load attempts: ${error.message}`);
    return (data ?? []).map(toSummary);
  }

  async get(userId: string, id: string): Promise<Attempt | null> {
    const { data, error } = await supabaseAdmin()
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Could not load attempt: ${error.message}`);
    if (!data) return null;
    return { ...toSummary(data), userId, code: data.code, analysis: data.analysis };
  }

  async addResult(r: NewQuizResult): Promise<QuizResult> {
    const { data, error } = await supabaseAdmin()
      .from('quiz_results')
      .insert({ user_id: r.userId, scope: r.scope, score: r.score, total: r.total })
      .select('*')
      .single();
    if (error) throw new Error(`Could not save quiz result: ${error.message}`);
    return { id: data.id, userId: r.userId, scope: data.scope, score: data.score, total: data.total, createdAt: data.created_at };
  }

  async listResults(userId: string): Promise<QuizResult[]> {
    const { data, error } = await supabaseAdmin()
      .from('quiz_results')
      .select('id,scope,score,total,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(2000);
    if (error) throw new Error(`Could not load quiz results: ${error.message}`);
    return (data ?? []).map((r) => ({ id: r.id, userId, scope: r.scope, score: r.score, total: r.total, createdAt: r.created_at }));
  }
}
