-- Rank the hunt by elapsed time from BEGIN THE HUNT to scanning the final route QR.
-- Also update the public label for QR 10 without changing its stable checkpoint ID/token.

alter table public.participants
  add column if not exists route_finished_at timestamptz;

alter table public.completions
  add column if not exists route_finished_at timestamptz;

-- Preserve existing completions. Their previous duration includes the final puzzle, so use
-- their existing finish timestamp as the best available legacy route-finish timestamp.
update public.participants p
   set route_finished_at = c.finished_at
  from public.completions c
 where c.participant_id = p.id
   and p.route_finished_at is null;

update public.completions c
   set route_finished_at = coalesce(p.route_finished_at, c.finished_at)
  from public.participants p
 where p.id = c.participant_id
   and c.route_finished_at is null;

alter table public.completions
  alter column route_finished_at set not null;

update public.hunt_checkpoints
   set label = 'Restricted area'
 where id = 'registration-table';

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
     set checkpoint_progress = p_checkpoint_position,
         route_finished_at = case
           when p_checkpoint_position = 11 then coalesce(route_finished_at, now())
           else route_finished_at
         end
   where id = p_participant_id;

  return p_checkpoint_position;
end;
$$;

revoke all on function public.advance_hunt_checkpoint(uuid, integer) from public, anon, authenticated;
grant execute on function public.advance_hunt_checkpoint(uuid, integer) to service_role;
