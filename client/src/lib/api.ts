import type {
  AnalyzeResponse,
  Attempt,
  Level,
  MistakesResponse,
  Problem,
  ProblemListItem,
  Progress,
  Topic,
  User,
} from './types';

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

let tokenProvider: () => Promise<string | null> = async () => null;
export const setTokenProvider = (fn: () => Promise<string | null>) => {
  tokenProvider = fn;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const token = init.token === undefined ? await tokenProvider() : init.token;
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method: init.method ?? (init.body !== undefined ? 'POST' : 'GET'),
      headers: {
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is it running?', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? `Request failed (${res.status})`, res.status);
  return data as T;
}

export const api = {
  status: () => request<{ ai: boolean; accounts: boolean }>('/status', { token: null }),
  demoLogin: () => request<{ token: string; user: User }>('/auth/demo', { method: 'POST', body: {}, token: null }),
  me: () => request<{ user: User }>('/me'),
  problems: () => request<{ topics: Topic[]; problems: ProblemListItem[] }>('/problems'),
  problem: (id: string) => request<Problem>(`/problems/${encodeURIComponent(id)}`),
  analyze: (id: string, code: string, confidence?: number) =>
    request<AnalyzeResponse>(`/problems/${encodeURIComponent(id)}/analyze`, { body: { code, confidence } }),
  attempt: (id: string) => request<{ attempt: Attempt }>(`/attempts/${encodeURIComponent(id)}`),
  progress: () => request<{ user: User; progress: Progress }>('/progress'),
  mistakes: () => request<MistakesResponse>('/mistakes'),
  next: (mode: 'weak' | 'mistake', opts: { exclude?: string; type?: string } = {}) => {
    const q = new URLSearchParams({ mode });
    if (opts.exclude) q.set('exclude', opts.exclude);
    if (opts.type) q.set('type', opts.type);
    return request<{ id: string; title: string; topic: string; reason: string }>(`/next?${q}`);
  },
  drill: () => request<{ problems: { id: string; title: string; topic: string; difficulty: number }[] }>('/drill'),
  resetDemo: () => request<{ ok: boolean }>('/demo/reset', { method: 'POST', body: {} }),
  explain: (attemptId: string, level: Level) =>
    request<{ text: string; source: 'gemini' | 'engine' }>('/ai/explain', { body: { attemptId, level } }),
  coach: (body: { problemId?: string; attemptId?: string; code?: string; messages: { role: 'user' | 'assistant'; content: string }[] }) =>
    request<{ text: string; source: 'gemini' | 'engine' }>('/ai/coach', { body }),
  transcribe: (image: string, mimeType: string) => request<{ code: string }>('/ai/transcribe', { body: { image, mimeType } }),
};
