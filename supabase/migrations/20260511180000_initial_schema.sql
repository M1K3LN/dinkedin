-- =============================================================================
-- Dinkedin Phase 1 schema: core tables, enums, signup trigger
-- =============================================================================

-- Extensions (gen_random_uuid)
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('player', 'organizer', 'admin');

create type public.tournament_status as enum
  ('draft', 'published', 'active', 'completed', 'canceled');

create type public.play_type as enum
  ('singles', 'doubles', 'mixed_doubles');

create type public.gender_type as enum
  ('mens', 'womens', 'mixed', 'open');

create type public.registration_status as enum
  ('registered', 'waitlisted', 'canceled', 'completed');

create type public.match_status as enum
  ('scheduled', 'completed', 'disputed', 'canceled');

create type public.winner_team as enum ('team_1', 'team_2');

create type public.ranking_event_reason as enum
  ('tournament_registration', 'match_win', 'first_place',
   'second_place', 'third_place', 'admin_adjustment');

create type public.reward_event_reason as enum
  ('account_created', 'tournament_registration', 'match_win',
   'tournament_placement', 'referral_signup', 'admin_adjustment',
   'shopify_redemption');

create type public.referral_code_status as enum
  ('active', 'inactive', 'expired');

create type public.shopify_code_status as enum
  ('pending', 'active', 'used', 'expired', 'revoked', 'failed');

create type public.shopify_discount_type as enum
  ('percentage', 'fixed_amount');

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles: every authenticated user has exactly one row here
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  email       text not null,
  role        public.user_role not null default 'player',
  first_name  text,
  last_name   text,
  phone       text,
  city        text,
  state       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- player_profiles: pickleball-specific player data
-- -----------------------------------------------------------------------------
create table public.player_profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references auth.users(id) on delete cascade,
  display_name          text,
  skill_level           numeric(3,1),         -- e.g. 3.5, 4.0
  dominant_hand         text,                  -- 'right' | 'left' | 'ambidextrous'
  preferred_play_type   public.play_type,
  home_court            text,
  bio                   text,
  total_ranking_points  integer not null default 0,
  total_reward_points   integer not null default 0,
  wins                  integer not null default 0,
  losses                integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index player_profiles_ranking_idx
  on public.player_profiles (total_ranking_points desc);

create trigger player_profiles_set_updated_at
before update on public.player_profiles
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- tournaments
-- -----------------------------------------------------------------------------
create table public.tournaments (
  id                      uuid primary key default gen_random_uuid(),
  created_by              uuid not null references auth.users(id) on delete restrict,
  name                    text not null,
  description             text,
  location_name           text,
  address                 text,
  city                    text,
  state                   text,
  start_date              date,
  end_date                date,
  registration_deadline   timestamptz,
  status                  public.tournament_status not null default 'draft',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index tournaments_created_by_idx on public.tournaments (created_by);
create index tournaments_status_idx     on public.tournaments (status);
create index tournaments_start_date_idx on public.tournaments (start_date);

create trigger tournaments_set_updated_at
before update on public.tournaments
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- tournament_divisions
-- -----------------------------------------------------------------------------
create table public.tournament_divisions (
  id             uuid primary key default gen_random_uuid(),
  tournament_id  uuid not null references public.tournaments(id) on delete cascade,
  name           text not null,
  skill_level    numeric(3,1),
  play_type      public.play_type not null,
  gender_type    public.gender_type not null default 'open',
  max_players    integer,
  entry_fee      numeric(10,2) not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index tournament_divisions_tournament_idx
  on public.tournament_divisions (tournament_id);

create trigger tournament_divisions_set_updated_at
before update on public.tournament_divisions
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- tournament_registrations
-- -----------------------------------------------------------------------------
create table public.tournament_registrations (
  id                 uuid primary key default gen_random_uuid(),
  tournament_id      uuid not null references public.tournaments(id) on delete cascade,
  division_id        uuid not null references public.tournament_divisions(id) on delete cascade,
  player_id          uuid not null references auth.users(id) on delete cascade,
  partner_player_id  uuid references auth.users(id) on delete set null,
  status             public.registration_status not null default 'registered',
  registered_at      timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (division_id, player_id)
);

create index tournament_registrations_tournament_idx
  on public.tournament_registrations (tournament_id);
create index tournament_registrations_player_idx
  on public.tournament_registrations (player_id);

create trigger tournament_registrations_set_updated_at
before update on public.tournament_registrations
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- matches
-- -----------------------------------------------------------------------------
create table public.matches (
  id                  uuid primary key default gen_random_uuid(),
  tournament_id       uuid not null references public.tournaments(id) on delete cascade,
  division_id         uuid not null references public.tournament_divisions(id) on delete cascade,
  round_name          text,
  player_1_id         uuid references auth.users(id) on delete set null,
  player_2_id         uuid references auth.users(id) on delete set null,
  team_1_partner_id   uuid references auth.users(id) on delete set null,
  team_2_partner_id   uuid references auth.users(id) on delete set null,
  winner_player_id    uuid references auth.users(id) on delete set null,
  winner_team         public.winner_team,
  score               text,
  status              public.match_status not null default 'scheduled',
  played_at           timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index matches_tournament_idx on public.matches (tournament_id);
create index matches_division_idx   on public.matches (division_id);

create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- ranking_events
-- -----------------------------------------------------------------------------
create table public.ranking_events (
  id             uuid primary key default gen_random_uuid(),
  player_id      uuid not null references auth.users(id) on delete cascade,
  tournament_id  uuid references public.tournaments(id) on delete set null,
  match_id       uuid references public.matches(id) on delete set null,
  points         integer not null,
  reason         public.ranking_event_reason not null,
  created_at     timestamptz not null default now()
);

create index ranking_events_player_idx     on public.ranking_events (player_id);
create index ranking_events_tournament_idx on public.ranking_events (tournament_id);

-- -----------------------------------------------------------------------------
-- reward_events
-- -----------------------------------------------------------------------------
create table public.reward_events (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid not null references auth.users(id) on delete cascade,
  points     integer not null,
  reason     public.reward_event_reason not null,
  source     text,
  created_at timestamptz not null default now()
);

create index reward_events_player_idx on public.reward_events (player_id);

-- -----------------------------------------------------------------------------
-- referral_codes
-- -----------------------------------------------------------------------------
create table public.referral_codes (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references auth.users(id) on delete cascade,
  code        text not null unique,
  status      public.referral_code_status not null default 'active',
  total_uses  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index referral_codes_player_idx on public.referral_codes (player_id);

create trigger referral_codes_set_updated_at
before update on public.referral_codes
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- shopify_discount_codes (structure only; Phase 4 will wire up the API)
-- -----------------------------------------------------------------------------
create table public.shopify_discount_codes (
  id                     uuid primary key default gen_random_uuid(),
  player_id              uuid not null references auth.users(id) on delete cascade,
  code                   text not null unique,
  discount_type          public.shopify_discount_type not null,
  discount_value         numeric(10,2) not null,
  reward_points_used     integer not null,
  shopify_discount_id    text,
  status                 public.shopify_code_status not null default 'pending',
  expires_at             timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index shopify_discount_codes_player_idx
  on public.shopify_discount_codes (player_id);

create trigger shopify_discount_codes_set_updated_at
before update on public.shopify_discount_codes
for each row execute function public.set_updated_at();

-- =============================================================================
-- Signup trigger: create profile + player_profile + initial reward bonus
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email);

  insert into public.player_profiles (user_id, display_name, total_reward_points)
  values (new.id, split_part(new.email, '@', 1), 100);

  insert into public.reward_events (player_id, points, reason, source)
  values (new.id, 100, 'account_created', 'signup_bonus');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
