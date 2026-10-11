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
