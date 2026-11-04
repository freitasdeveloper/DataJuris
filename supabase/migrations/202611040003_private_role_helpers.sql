-- Keep elevated role-check logic outside the exposed public API schema.
-- Public wrappers remain SECURITY INVOKER and delegate to private functions.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = required_role
  );
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role in ('moderator'::public.app_role, 'admin'::public.app_role)
  );
$$;

revoke all on function private.has_role(public.app_role) from public, anon, authenticated;
revoke all on function private.is_staff() from public, anon, authenticated;
grant execute on function private.has_role(public.app_role) to anon, authenticated;
grant execute on function private.is_staff() to anon, authenticated;

create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.has_role(required_role);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_staff();
$$;

-- Trigger execution does not require client EXECUTE privileges.
revoke all on function public.handle_new_user() from public, anon, authenticated;
