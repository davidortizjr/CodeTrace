-- CodeTrace schema. Run once in the Supabase SQL editor (or `supabase db push`).
--
-- The Express server talks to this table with the service-role key and always
-- filters by the verified user id. Row Level Security is still switched on so
-- that nothing can read another user's attempts directly with the anon key.

create table if not exists public.attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  problem_id  text not null,
  topic       text not null,
  correct     boolean not null,
  passed      integer not null check (passed >= 0),
  total       integer not null check (total > 0),
  error_type  text,
  confidence  integer check (confidence between 0 and 100),
  code        text not null default '',
  analysis    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists attempts_user_created_idx
  on public.attempts (user_id, created_at desc);

alter table public.attempts enable row level security;

drop policy if exists "attempts: owner can read" on public.attempts;
create policy "attempts: owner can read"
  on public.attempts for select
  using (auth.uid() = user_id);

drop policy if exists "attempts: owner can insert" on public.attempts;
create policy "attempts: owner can insert"
  on public.attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "attempts: owner can delete" on public.attempts;
create policy "attempts: owner can delete"
  on public.attempts for delete
  using (auth.uid() = user_id);

-- Quiz and exam results (added with the JavaScript and TypeScript course).
-- Safe to run on an existing project: it only creates what is missing.
create table if not exists public.quiz_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  scope       text not null,
  score       integer not null check (score >= 0),
  total       integer not null check (total > 0),
  created_at  timestamptz not null default now()
);

create index if not exists quiz_results_user_created_idx
  on public.quiz_results (user_id, created_at desc);

alter table public.quiz_results enable row level security;

drop policy if exists "quiz_results: owner can read" on public.quiz_results;
create policy "quiz_results: owner can read"
  on public.quiz_results for select
  using (auth.uid() = user_id);

drop policy if exists "quiz_results: owner can insert" on public.quiz_results;
create policy "quiz_results: owner can insert"
  on public.quiz_results for insert
  with check (auth.uid() = user_id);

drop policy if exists "quiz_results: owner can delete" on public.quiz_results;
create policy "quiz_results: owner can delete"
  on public.quiz_results for delete
  using (auth.uid() = user_id);
