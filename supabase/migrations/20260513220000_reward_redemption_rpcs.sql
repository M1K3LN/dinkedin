-- =============================================================================
-- Phase 4: Reward redemption RPCs
-- =============================================================================
-- Three SECURITY DEFINER functions that gate the reward -> Shopify discount
-- flow safely from the client. The shopify_discount_codes table is admin-only
-- under RLS; players never write to it directly. Points deduction uses
-- FOR UPDATE to prevent double-spend across concurrent requests.

create or replace function public.redeem_reward_points(
  p_points_required int,
  p_discount_type   public.shopify_discount_type,
  p_discount_value  numeric,
  p_code            text,
  p_expires_at      timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id      uuid := auth.uid();
  v_current_balance int;
  v_redemption_id  uuid;
begin
  if v_player_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if p_points_required <= 0 then
    raise exception 'Invalid points amount' using errcode = '22023';
  end if;
  if p_discount_value < 0 then
    raise exception 'Invalid discount value' using errcode = '22023';
  end if;

  select total_reward_points into v_current_balance
    from public.player_profiles
   where user_id = v_player_id
   for update;

  if v_current_balance is null then
    raise exception 'Player profile not found' using errcode = 'P0002';
  end if;
  if v_current_balance < p_points_required then
    raise exception 'Insufficient reward points' using errcode = '22023';
  end if;

  update public.player_profiles
     set total_reward_points = total_reward_points - p_points_required
   where user_id = v_player_id;

  insert into public.reward_events (player_id, points, reason, source)
  values (v_player_id, -p_points_required, 'shopify_redemption', p_code);

  insert into public.shopify_discount_codes (
    player_id, code, discount_type, discount_value,
    reward_points_used, status, expires_at
  ) values (
    v_player_id, p_code, p_discount_type, p_discount_value,
    p_points_required, 'pending', p_expires_at
  )
  returning id into v_redemption_id;

  return v_redemption_id;
end;
$$;

revoke execute on function public.redeem_reward_points(int, public.shopify_discount_type, numeric, text, timestamptz) from anon;
grant execute on function public.redeem_reward_points(int, public.shopify_discount_type, numeric, text, timestamptz) to authenticated;

create or replace function public.mark_redemption_active(
  p_redemption_id      uuid,
  p_shopify_discount_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid := auth.uid();
begin
  if v_player_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  update public.shopify_discount_codes
     set status = 'active',
         shopify_discount_id = p_shopify_discount_id
   where id = p_redemption_id
     and player_id = v_player_id
     and status = 'pending';
end;
$$;

revoke execute on function public.mark_redemption_active(uuid, text) from anon;
grant execute on function public.mark_redemption_active(uuid, text) to authenticated;

create or replace function public.mark_redemption_failed(p_redemption_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id   uuid := auth.uid();
  v_redemption  record;
begin
  if v_player_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select id, reward_points_used, code into v_redemption
    from public.shopify_discount_codes
   where id = p_redemption_id
     and player_id = v_player_id
     and status = 'pending'
   for update;

  if not found then
    return;
  end if;

  update public.shopify_discount_codes
     set status = 'failed'
   where id = v_redemption.id;

  update public.player_profiles
     set total_reward_points = total_reward_points + v_redemption.reward_points_used
   where user_id = v_player_id;

  insert into public.reward_events (player_id, points, reason, source)
  values (
    v_player_id,
    v_redemption.reward_points_used,
    'admin_adjustment',
    'redemption_refund:' || v_redemption.code
  );
end;
$$;

revoke execute on function public.mark_redemption_failed(uuid) from anon;
grant execute on function public.mark_redemption_failed(uuid) to authenticated;
