-- Feedback after the conference, written only by the "feedback" Edge Function.
-- Like registrations, nothing public can touch it: RLS is on with no
-- policies, and only service_role gets table privileges.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  rating smallint not null check (rating between 1 and 5),
  role text check (role in ('student', 'parent', 'speaker', 'teacher', 'other')),
  most_useful text check (char_length(most_useful) <= 2000),
  change text check (char_length(change) <= 2000),
  -- Only if the person wants a reply
  email text check (char_length(email) <= 254)
);

comment on table public.feedback is
  'Pathways to Health feedback. Written by the feedback Edge Function only.';

alter table public.feedback enable row level security;

revoke all on public.feedback from anon, authenticated;
grant select, insert on public.feedback to service_role;
