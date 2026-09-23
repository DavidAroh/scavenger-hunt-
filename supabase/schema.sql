-- RIL Scavenger Hunt: run this once in the Supabase SQL editor.
-- All access goes through server-side route handlers/actions using the SERVICE ROLE key,
-- so RLS is enabled with NO public policies. The anon key can read nothing (your lead list is safe).

create extension if not exists "pgcrypto";

create table if not exists participants (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text unique,
  phone          text unique,
  interest       text[] not null default '{}',
  consent        boolean not null default false,
  marketing_consent boolean not null default false,
  track          text not null default '',
  session_token  text not null unique,
  entry_location text not null default 'start',
  source         text not null default 'treasure-hunt',
  created_at     timestamptz not null default now(),
  -- Director's Lost Treasure progress:
  stage          integer not null default 0,
  collected      jsonb not null default '{}',
  started_at     timestamptz,
  -- optional lead-capture fields:
  handle         text,
  age_range      text,
  role           text,
  wants_programs boolean not null default false,
  constraint contact_present check (email is not null or phone is not null)
);

-- Existing installations can safely apply the same script to add this optional preference.
alter table participants add column if not exists marketing_consent boolean not null default false;

-- Per-stage attempt log (replaces the old per-location `scans` table).
create table if not exists stage_events (
  participant_id   uuid not null references participants(id) on delete cascade,
  stage_id         text not null,
  attempts         integer not null default 0,
  solved_at        timestamptz,
  -- server-authoritative countdown for `timed` stages (the race):
  timer_started_at timestamptz,
  timeouts         integer not null default 0,
  primary key (participant_id, stage_id)
);
-- If you ran an earlier version of this schema, add the timed-race columns:
alter table stage_events add column if not exists timer_started_at timestamptz;
alter table stage_events add column if not exists timeouts integer not null default 0;

create table if not exists completions (
  participant_id uuid primary key references participants(id) on delete cascade,
  finished_at    timestamptz not null default now(),
  duration_ms    integer not null,
  claim_code     text not null unique,
  claimed_at     timestamptz
);

-- Staff-awarded extra raffle entries for merchandise, RIL Versus and demos.
create table if not exists raffle_entries (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  reason         text not null check (reason in ('versus', 'merch', 'demo')),
  created_at     timestamptz not null default now()
);

create index if not exists completions_finished_idx on completions (finished_at);

alter table participants enable row level security;
alter table stage_events enable row level security;
alter table completions  enable row level security;
alter table raffle_entries enable row level security;
-- (no policies on purpose)
