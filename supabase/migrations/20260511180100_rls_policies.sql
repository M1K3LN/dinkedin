-- =============================================================================
-- Row Level Security: enable + baseline policies for player/organizer/admin
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Role helper: read role from public.profiles for the current auth user
-- SECURITY DEFINER so policies can use it without RLS recursion.
-- -----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.is_organizer_or_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('organizer', 'admin'), false)
$$;

-- -----------------------------------------------------------------------------
-- Enable RLS on every public table
-- -----------------------------------------------------------------------------
alter table public.profiles                 enable row level security;
alter table public.player_profiles          enable row level security;
alter table public.tournaments              enable row level security;
alter table public.tournament_divisions     enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.matches                  enable row level security;
alter table public.ranking_events           enable row level security;
alter table public.reward_events            enable row level security;
alter table public.referral_codes           enable row level security;
alter table public.shopify_discount_codes   enable row level security;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create policy "profiles: read own"
  on public.profiles for select
  using (user_id = auth.uid());

create policy "profiles: read all (admin)"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles: update own"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and role = public.current_user_role());

create policy "profiles: update any (admin)"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- (insert is handled by the signup trigger as security definer; no public insert policy)

-- -----------------------------------------------------------------------------
-- player_profiles
-- -----------------------------------------------------------------------------
create policy "player_profiles: read all"
  on public.player_profiles for select
  using (true);   -- rankings are public for authenticated users

create policy "player_profiles: update own"
  on public.player_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "player_profiles: update any (admin)"
  on public.player_profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- tournaments
-- -----------------------------------------------------------------------------
create policy "tournaments: read published or own"
  on public.tournaments for select
  using (
    status in ('published', 'active', 'completed')
    or created_by = auth.uid()
    or public.is_admin()
  );

create policy "tournaments: organizer/admin can insert"
  on public.tournaments for insert
  with check (
    public.is_organizer_or_admin()
    and created_by = auth.uid()
  );

create policy "tournaments: organizer can update own"
  on public.tournaments for update
  using (created_by = auth.uid() and public.is_organizer_or_admin())
  with check (created_by = auth.uid());

create policy "tournaments: admin can update any"
  on public.tournaments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "tournaments: admin can delete"
  on public.tournaments for delete
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- tournament_divisions
-- -----------------------------------------------------------------------------
create policy "divisions: read with tournament"
  on public.tournament_divisions for select
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id
        and (
          t.status in ('published', 'active', 'completed')
          or t.created_by = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "divisions: organizer/admin can manage own tournament"
  on public.tournament_divisions for all
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id
        and (t.created_by = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id
        and (t.created_by = auth.uid() or public.is_admin())
    )
  );

-- -----------------------------------------------------------------------------
-- tournament_registrations
-- -----------------------------------------------------------------------------
create policy "registrations: read own or admin"
  on public.tournament_registrations for select
  using (
    player_id = auth.uid()
    or partner_player_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.created_by = auth.uid()
    )
  );

create policy "registrations: player can register themselves"
  on public.tournament_registrations for insert
  with check (player_id = auth.uid());

create policy "registrations: player can cancel own"
  on public.tournament_registrations for update
  using (player_id = auth.uid())
  with check (player_id = auth.uid());

create policy "registrations: organizer/admin can manage"
  on public.tournament_registrations for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.created_by = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.created_by = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- matches
-- -----------------------------------------------------------------------------
create policy "matches: read for participants/organizer/admin"
  on public.matches for select
  using (
    public.is_admin()
    or player_1_id = auth.uid()
    or player_2_id = auth.uid()
    or team_1_partner_id = auth.uid()
    or team_2_partner_id = auth.uid()
    or exists (
      select 1 from public.tournaments t
      where t.id = tournament_id
        and (t.status in ('published', 'active', 'completed') or t.created_by = auth.uid())
    )
  );

create policy "matches: organizer/admin can manage"
  on public.matches for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.created_by = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.created_by = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- ranking_events
-- -----------------------------------------------------------------------------
create policy "ranking_events: read own or admin"
  on public.ranking_events for select
  using (player_id = auth.uid() or public.is_admin());

create policy "ranking_events: admin can write"
  on public.ranking_events for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- reward_events
-- -----------------------------------------------------------------------------
create policy "reward_events: read own or admin"
  on public.reward_events for select
  using (player_id = auth.uid() or public.is_admin());

create policy "reward_events: admin can write"
  on public.reward_events for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- referral_codes
-- -----------------------------------------------------------------------------
create policy "referral_codes: read own or admin"
  on public.referral_codes for select
  using (player_id = auth.uid() or public.is_admin());

create policy "referral_codes: admin can write"
  on public.referral_codes for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- shopify_discount_codes
-- -----------------------------------------------------------------------------
create policy "shopify_discount_codes: read own or admin"
  on public.shopify_discount_codes for select
  using (player_id = auth.uid() or public.is_admin());

create policy "shopify_discount_codes: admin can write"
  on public.shopify_discount_codes for all
  using (public.is_admin())
  with check (public.is_admin());
