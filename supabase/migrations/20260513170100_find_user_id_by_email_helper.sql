-- =============================================================================
-- Phase 2: helper to look up a partner's user_id by their email
-- =============================================================================
-- Needed so a player can register for doubles by entering a partner's email.
-- Returns null if no user matches. Email existence is already discoverable
-- through the signup form's "already registered" error, so this exposes no
-- new information.
--
-- SECURITY DEFINER + revoked from anon: only authenticated callers can use it.

create or replace function public.find_user_id_by_email(p_email text)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1
$$;

revoke execute on function public.find_user_id_by_email(text) from anon;
grant execute on function public.find_user_id_by_email(text) to authenticated;
