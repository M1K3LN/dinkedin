-- Cleanup: drop the temporary diagnostic helper used to debug the
-- "permission denied for function is_admin" RLS bug.
drop function if exists public.debug_auth_uid();
