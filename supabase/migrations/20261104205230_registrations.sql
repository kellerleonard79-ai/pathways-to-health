-- Conference registrations, written only by the "register" Edge Function.
-- The table holds minors' contact details, so nothing public can touch it:
-- RLS is on with no policies, and only service_role gets table privileges.

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null check (char_length(phone) between 7 and 30),
  street text not null check (char_length(street) between 1 and 200),
  city text not null check (char_length(city) between 1 and 100),
  state text not null check (char_length(state) between 1 and 50),
  zip text not null check (zip ~ '^\d{5}(-\d{4})?$'),

  school text not null check (char_length(school) between 1 and 150),
  grade text not null check (grade in ('9', '10', '11', '12', 'college', 'other')),
  interests text[] not null default '{}',

  is_minor boolean not null default false,
  parent_name text check (char_length(parent_name) <= 120),
  parent_email text check (char_length(parent_email) <= 254),
  parent_phone text check (char_length(parent_phone) <= 30),

  dietary text check (char_length(dietary) <= 1000),
  accessibility text check (char_length(accessibility) <= 1000),

  -- Attendees under 18 must give a parent or guardian
  constraint registrations_parent_required check (
    not is_minor
    or (parent_name is not null and parent_email is not null and parent_phone is not null)
  )
);

comment on table public.registrations is
  'Pathways to Health conference registrations. Written by the register Edge Function only.';

-- One registration per email address
create unique index registrations_email_key on public.registrations (lower(email));

alter table public.registrations enable row level security;

revoke all on public.registrations from anon, authenticated;
grant select, insert on public.registrations to service_role;
