-- =============================================================================
-- Phase 5: Match Center schema + points-eligibility gating
-- =============================================================================
-- Adds the columns the Player Match Center needs (numeric per-team scores,
-- round_number, court_number, scheduled_time) and wires up division-level
-- points eligibility based on registered-team count. Eligibility is kept in
-- sync automatically by triggers on registration changes and tournament
-- status changes, and is checked by the match-completion trigger and the
-- placement-award RPC before awarding any points.

create type public.points_eligibility_status as enum (
  'pending_minimum_teams',
  'points_eligible',
  'tracked_only',
  'canceled'
);

alter table public.tournament_divisions
  add column min_teams_for_points int not null default 8,
  add column teams_advancing int,
  add column points_eligibility_status public.points_eligibility_status
    not null default 'pending_minimum_teams',
  add column points_eligible boolean not null default false,
  add column finalized_at timestamptz;

alter table public.matches
  add column round_number int,
  add column court_number int,
  add column scheduled_time timestamptz,
  add column team_1_score int,
  add column team_2_score int;

create index matches_round_idx on public.matches (tournament_id, division_id, round_number);

create or replace function public.recalc_division_eligibility(p_division_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_count int;
  v_min int;
  v_t_status public.tournament_status;
  v_div_canceled boolean;
begin
  select count(*) into v_team_count
    from public.tournament_registrations
   where division_id = p_division_id
     and status <> 'canceled';

  select d.min_teams_for_points, t.status,
         (d.points_eligibility_status = 'canceled')
    into v_min, v_t_status, v_div_canceled
    from public.tournament_divisions d
    join public.tournaments t on t.id = d.tournament_id
   where d.id = p_division_id;

  if v_div_canceled or v_t_status = 'canceled' then
    update public.tournament_divisions
       set points_eligibility_status = 'canceled',
           points_eligible = false
     where id = p_division_id;
    return;
  end if;

  if v_team_count >= v_min then
    update public.tournament_divisions
       set points_eligibility_status = 'points_eligible',
           points_eligible = true
     where id = p_division_id;
    return;
  end if;

  if v_t_status in ('draft', 'published') then
    update public.tournament_divisions
       set points_eligibility_status = 'pending_minimum_teams',
           points_eligible = false
     where id = p_division_id;
    return;
  end if;

  update public.tournament_divisions
     set points_eligibility_status = 'tracked_only',
         points_eligible = false
   where id = p_division_id;
end;
$$;

revoke execute on function public.recalc_division_eligibility(uuid) from anon, authenticated;

create or replace function public.trigger_recalc_eligibility_on_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalc_division_eligibility(old.division_id);
    return old;
  end if;
  perform public.recalc_division_eligibility(new.division_id);
  if tg_op = 'UPDATE' and old.division_id is distinct from new.division_id then
    perform public.recalc_division_eligibility(old.division_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_registration_recalc_eligibility on public.tournament_registrations;
create trigger on_registration_recalc_eligibility
  after insert or update or delete on public.tournament_registrations
  for each row execute function public.trigger_recalc_eligibility_on_registration();

create or replace function public.trigger_recalc_eligibility_on_tournament()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_div_id uuid;
begin
  if new.status is distinct from old.status then
    for v_div_id in
      select id from public.tournament_divisions where tournament_id = new.id
    loop
      perform public.recalc_division_eligibility(v_div_id);
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists on_tournament_status_recalc_eligibility on public.tournaments;
create trigger on_tournament_status_recalc_eligibility
  after update of status on public.tournaments
  for each row execute function public.trigger_recalc_eligibility_on_tournament();

-- Match completion: still update W/L for all divisions; only award ranking +
-- reward points when the division is points-eligible.
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
  v_points_eligible boolean;
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

  select points_eligible into v_points_eligible
    from public.tournament_divisions where id = new.division_id;
  v_points_eligible := coalesce(v_points_eligible, false);

  foreach pid in array winners loop
    if v_points_eligible then
      insert into public.ranking_events (player_id, tournament_id, match_id, points, reason)
      values (pid, new.tournament_id, new.id, 10, 'match_win');
      insert into public.reward_events (player_id, points, reason, source)
      values (pid, 10, 'match_win', new.id::text);
      update public.player_profiles
         set total_ranking_points = total_ranking_points + 10,
             total_reward_points  = total_reward_points  + 10,
             wins                 = wins + 1
       where user_id = pid;
    else
      update public.player_profiles set wins = wins + 1 where user_id = pid;
    end if;
  end loop;

  foreach pid in array losers loop
    update public.player_profiles set losses = losses + 1 where user_id = pid;
  end loop;

  return new;
end;
$$;

create or replace function public.award_tournament_placements(
  p_tournament_id uuid,
  p_placements jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_status  public.tournament_status;
  v_div     jsonb;
  v_place   text;
  v_players uuid[];
  v_pid     uuid;
  v_rank_pts int;
  v_rew_pts  int;
  v_rank_reason public.ranking_event_reason;
  v_div_eligible boolean;
  v_div_id uuid;
begin
  select created_by, status into v_creator, v_status
    from public.tournaments where id = p_tournament_id;

  if v_creator is null then
    raise exception 'Tournament not found' using errcode = 'P0002';
  end if;
  if v_creator <> auth.uid() and not public.is_admin() then
    raise exception 'Not authorized to finalize this tournament' using errcode = '42501';
  end if;
  if v_status not in ('published', 'active') then
    raise exception 'Tournament is not in a finalizable state' using errcode = '22023';
  end if;

  for v_div in select * from jsonb_array_elements(coalesce(p_placements, '[]'::jsonb))
  loop
    v_div_id := (v_div ->> 'division_id')::uuid;
    select coalesce(points_eligible, false) into v_div_eligible
      from public.tournament_divisions where id = v_div_id;
    if not v_div_eligible then
      continue;
    end if;

    foreach v_place in array array['first','second','third'] loop
      v_players := array(
        select (e)::uuid
        from jsonb_array_elements_text(coalesce(v_div -> v_place, '[]'::jsonb)) as e
        where e is not null and e <> ''
      );
      if array_length(v_players, 1) is null then continue; end if;

      if v_place = 'first' then
        v_rank_pts := 50; v_rew_pts := 500; v_rank_reason := 'first_place';
      elsif v_place = 'second' then
        v_rank_pts := 30; v_rew_pts := 300; v_rank_reason := 'second_place';
      else
        v_rank_pts := 20; v_rew_pts := 200; v_rank_reason := 'third_place';
      end if;

      foreach v_pid in array v_players loop
        insert into public.ranking_events (player_id, tournament_id, points, reason)
        values (v_pid, p_tournament_id, v_rank_pts, v_rank_reason);
        insert into public.reward_events (player_id, points, reason, source)
        values (v_pid, v_rew_pts, 'tournament_placement', p_tournament_id::text);
        update public.player_profiles
           set total_ranking_points = total_ranking_points + v_rank_pts,
               total_reward_points  = total_reward_points  + v_rew_pts
         where user_id = v_pid;
      end loop;
    end loop;
  end loop;

  update public.tournaments set status = 'completed' where id = p_tournament_id;
  update public.tournament_divisions set finalized_at = now()
   where tournament_id = p_tournament_id;
end;
$$;

-- Backfill: recalc eligibility for every existing division
do $$
declare v_id uuid;
begin
  for v_id in select id from public.tournament_divisions loop
    perform public.recalc_division_eligibility(v_id);
  end loop;
end;
$$;
