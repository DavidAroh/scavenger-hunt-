-- Apply this migration to an existing RIL hunt database before deploying checkpoint scans.
create extension if not exists "pgcrypto";

alter table public.participants
  add column if not exists checkpoint_progress integer not null default 0;

-- Existing players have already started the digital stages; let them resume without losing progress.
update public.participants set checkpoint_progress = least(stage, 11)
 where checkpoint_progress = 0 and stage > 0;

create table if not exists public.hunt_checkpoints (
  id          text primary key,
  qr_number   integer not null unique,
  position    integer not null unique,
  label       text not null,
  token       text not null unique default encode(gen_random_bytes(24), 'hex')
);

insert into public.hunt_checkpoints (id, qr_number, position, label) values
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

alter table public.hunt_checkpoints enable row level security;
revoke all on public.hunt_checkpoints from public, anon, authenticated;
grant select on public.hunt_checkpoints to service_role;

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
    from public.participants
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

  update public.participants
     set checkpoint_progress = p_checkpoint_position
   where id = p_participant_id;

  return p_checkpoint_position;
end;
$$;

revoke all on function public.advance_hunt_checkpoint(uuid, integer) from public, anon, authenticated;
grant execute on function public.advance_hunt_checkpoint(uuid, integer) to service_role;
