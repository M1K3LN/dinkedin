-- =============================================================================
-- Harden SECURITY DEFINER functions: pin search_path, revoke public EXECUTE.
-- These functions are only meant to be called from RLS policies and the
-- on_auth_user_created trigger, not via PostgREST.
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.current_user_role()      from public, anon, authenticated;
revoke execute on function public.is_admin()                from public, anon, authenticated;
revoke execute on function public.is_organizer_or_admin()   from public, anon, authenticated;
revoke execute on function public.handle_new_user()         from public, anon, authenticated;
