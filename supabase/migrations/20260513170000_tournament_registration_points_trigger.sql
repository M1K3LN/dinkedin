-- =============================================================================
-- Phase 2: Award ranking + reward points when a player registers for a division
-- =============================================================================
-- Fires after INSERT on tournament_registrations. Awards both the registering
-- player and their doubles partner (when set) +5 ranking points and +50 reward
-- points each. Skips waitlisted/canceled rows so only confirmed registrations
-- earn. Uses SECURITY DEFINER so it can write to ranking_events/reward_events
-- (those tables only allow writes by admins via RLS).

create or replace function public.handle_new_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  player_ids uuid[];
  pid uuid;
begin
  if new.status <> 'registered' then
    return new;
  end if;

  player_ids := array_remove(array[new.player_id, new.partner_player_id], null);

  foreach pid in array player_ids loop
    insert into public.ranking_events (player_id, tournament_id, points, reason)
    values (pid, new.tournament_id, 5, 'tournament_registration');

    insert into public.reward_events (player_id, points, reason, source)
    values (pid, 50, 'tournament_registration', new.tournament_id::text);

    update public.player_profiles
       set total_ranking_points = total_ranking_points + 5,
           total_reward_points  = total_reward_points + 50
     where user_id = pid;
  end loop;

  return new;
end;
$$;

revoke execute on function public.handle_new_registration() from anon, authenticated;

drop trigger if exists on_registration_created on public.tournament_registrations;

create trigger on_registration_created
  after insert on public.tournament_registrations
  for each row execute function public.handle_new_registration();
