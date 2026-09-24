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

create table if not exists hunt_checkpoints (
  id          text primary key,
  qr_number   integer not null unique,
  position    integer not null unique,
  label       text not null,
  token       text not null unique default encode(gen_random_bytes(24), 'hex')
);

insert into hunt_checkpoints (id, qr_number, position, label) values
  ('booth-start', 9, 0, 'Booth · Start'),
  ('entrance', 1, 1, 'The entrance'),
  ('daimayo', 2, 2, 'Daimayo area'),
  ('ac-3', 3, 3, 'AC 3'),
  ('stage-left', 4, 4, 'Stage left'),
  ('stage-right', 5, 5, 'Stage right'),
  ('speaker-1', 6, 6, 'Below speaker 1'),
  ('david', 7, 7, 'Find David'),
  ('tile-rows', 8, 8, '16 tile rows from the entrance'),
  ('registration-table', 10, 9, 'Registration table'),
  ('kelvin', 11, 10, 'Find Kelvin'),
  ('booth-finish', 12, 11, 'Booth · Finish')
on conflict (id) do nothing;

revoke all on public.hunt_checkpoints from public, anon, authenticated;
grant select on public.hunt_checkpoints to service_role;

-- Existing installations can safely apply the same script to add this optional preference.
alter table participants add column if not exists marketing_consent boolean not null default false;
alter table participants add column if not exists checkpoint_progress integer not null default 0;
-- Existing players have already started the digital stages; let them resume without losing progress.
update participants set checkpoint_progress = least(stage, 11)
 where checkpoint_progress = 0 and stage > 0;

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
alter table hunt_checkpoints enable row level security;
-- (no policies on purpose)

-- Advance only the next checkpoint, and serialize simultaneous scans for one participant.
create or replace function public.advance_hunt_checkpoint(
  p_participant_id uuid,
  p_checkpoint_position integer
) returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_checkpoint integer;
  current_stage integer;
begin
  select checkpoint_progress, stage
    into current_checkpoint, current_stage
    from participants
   where id = p_participant_id
   for update;

  if not found then
    raise exception 'participant not found';
  end if;

  if p_checkpoint_position <= current_checkpoint then
    return current_checkpoint;
  end if;

  if p_checkpoint_position <> current_checkpoint + 1
     or p_checkpoint_position <> current_stage then
    raise exception 'checkpoint out of sequence';
  end if;

  update participants
     set checkpoint_progress = p_checkpoint_position
   where id = p_participant_id;

  return p_checkpoint_position;
end;
$$;

revoke all on function public.advance_hunt_checkpoint(uuid, integer) from public, anon, authenticated;
grant execute on function public.advance_hunt_checkpoint(uuid, integer) to service_role;
