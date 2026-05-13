-- =============================================================================
-- Fix: grant EXECUTE on RLS helper functions back to `authenticated`
-- =============================================================================
-- The Phase 1 hardening migration revoked EXECUTE on these helpers from every
-- role to prevent them being called via PostgREST RPC. That was too aggressive:
-- our RLS policies on `profiles`, `tournaments`, etc. CALL these functions,
-- and RLS evaluation runs as the connecting role (`authenticated` for normal
-- users). Without EXECUTE, every policy clause that calls them errors with
-- "permission denied for function is_admin", silently failing the query.
--
-- The functions are SECURITY DEFINER, so granting EXECUTE just lets the
-- caller invoke them; the function bodies still run with the owner's
-- privileges. They only return a boolean / enum based on auth.uid(), so
-- there's no data leakage risk.

grant execute on function public.current_user_role()    to authenticated;
grant execute on function public.is_admin()              to authenticated;
grant execute on function public.is_organizer_or_admin() to authenticated;
