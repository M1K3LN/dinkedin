-- =============================================================================
-- Phase 3: Award tournament placements and finalize
-- =============================================================================
-- One SECURITY DEFINER function the organizer's "Finalize" action calls.
-- Validates the caller is the tournament creator (or admin), awards points
-- per placement, and flips the tournament to 'completed'. Wrapped in a single
-- transaction so partial failures don't leave half-awarded state.
--
-- Placement points (per player and per partner where applicable):
--   1st: +50 ranking, +500 reward
--   2nd: +30 ranking, +300 reward
--   3rd: +20 ranking, +200 reward
--
-- Payload shape (jsonb):
--   [
--     { "division_id": "uuid",
--       "first":  ["uuid", "uuid?"],
--       "second": ["uuid", "uuid?"],
--       "third":  ["uuid", "uuid?"]
--     }, ...
--   ]
-- Any placement may be omitted or empty to skip.

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
    foreach v_place in array array['first','second','third'] loop
      v_players := array(
        select (e)::uuid
        from jsonb_array_elements_text(coalesce(v_div -> v_place, '[]'::jsonb)) as e
        where e is not null and e <> ''
      );

      if array_length(v_players, 1) is null then
        continue;
      end if;

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
end;
$$;

revoke execute on function public.award_tournament_placements(uuid, jsonb) from anon;
grant execute on function public.award_tournament_placements(uuid, jsonb) to authenticated;

create or replace function public.reopen_tournament(p_tournament_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  update public.tournaments set status = 'active' where id = p_tournament_id;
end;
$$;

revoke execute on function public.reopen_tournament(uuid) from anon;
grant execute on function public.reopen_tournament(uuid) to authenticated;
