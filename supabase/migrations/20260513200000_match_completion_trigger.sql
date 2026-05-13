-- =============================================================================
-- Phase 3: Award ranking + reward points and update W/L on match completion
-- =============================================================================
-- Fires after UPDATE on public.matches when status transitions to 'completed'
-- with a winner set. Awards +10 ranking and +10 reward to every winner
-- (including doubles partner), increments their wins, and increments losses
-- for every loser. Idempotent w.r.t. repeated saves: only fires when the
-- match was not previously completed OR the winner changed.

create or replace function public.handle_match_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  winners uuid[];
  losers  uuid[];
  pid     uuid;
begin
  if new.status <> 'completed' then
    return new;
  end if;
  if old.status = 'completed'
     and old.winner_team is not distinct from new.winner_team
     and old.winner_player_id is not distinct from new.winner_player_id then
    return new;
  end if;

  if new.winner_team = 'team_1' then
    winners := array_remove(array[new.player_1_id, new.team_1_partner_id], null);
    losers  := array_remove(array[new.player_2_id, new.team_2_partner_id], null);
  elsif new.winner_team = 'team_2' then
    winners := array_remove(array[new.player_2_id, new.team_2_partner_id], null);
    losers  := array_remove(array[new.player_1_id, new.team_1_partner_id], null);
  elsif new.winner_player_id is not null then
    if new.winner_player_id = new.player_1_id then
      winners := array[new.player_1_id];
      losers  := array_remove(array[new.player_2_id], null);
    else
      winners := array[new.player_2_id];
      losers  := array_remove(array[new.player_1_id], null);
    end if;
  else
    return new;
  end if;

  foreach pid in array winners loop
    insert into public.ranking_events (player_id, tournament_id, match_id, points, reason)
    values (pid, new.tournament_id, new.id, 10, 'match_win');

    insert into public.reward_events (player_id, points, reason, source)
    values (pid, 10, 'match_win', new.id::text);

    update public.player_profiles
       set total_ranking_points = total_ranking_points + 10,
           total_reward_points  = total_reward_points  + 10,
           wins                 = wins + 1
     where user_id = pid;
  end loop;

  foreach pid in array losers loop
    update public.player_profiles
       set losses = losses + 1
     where user_id = pid;
  end loop;

  return new;
end;
$$;

revoke execute on function public.handle_match_completion() from anon, authenticated;

drop trigger if exists on_match_completed on public.matches;

create trigger on_match_completed
  after update of status, winner_team, winner_player_id
  on public.matches
  for each row execute function public.handle_match_completion();
