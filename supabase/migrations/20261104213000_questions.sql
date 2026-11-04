-- Questions for speakers, written only by the "ask" Edge Function.
-- Like registrations, nothing public can touch it: RLS is on with no
-- policies, and only service_role gets table privileges.

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  -- A speaker's name or a topic, if the asker named one
  speaker text check (char_length(speaker) <= 150),
  question text not null check (char_length(question) between 1 and 2000)
);

comment on table public.questions is
  'Pathways to Health questions for speakers. Written by the ask Edge Function only.';

alter table public.questions enable row level security;

revoke all on public.questions from anon, authenticated;
grant select, insert on public.questions to service_role;
