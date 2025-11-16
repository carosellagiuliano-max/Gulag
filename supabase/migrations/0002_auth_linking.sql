-- Auth linking: automatically create profile/customer/staff rows for auth users
-- Assumes single-salon setup for now; uses the seeded salon id until multi-tenant support arrives

create or replace function public.handle_auth_user_signup()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_salon uuid := '11111111-1111-1111-1111-111111111111';
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  staff_role text := lower(coalesce(meta->>'staff_role', ''));
  preferred_language text := coalesce(meta->>'preferred_language', 'de');
  marketing_consent boolean := coalesce((meta->>'marketing_consent')::boolean, false);
  full_name text := coalesce(meta->>'full_name', new.email);
  phone text := meta->>'phone';
  display_name text := coalesce(meta->>'display_name', meta->>'full_name', new.email);
  staff_role_valid boolean := staff_role in ('owner', 'admin', 'stylist', 'assistant');
begin
  -- create or update profile for the auth user
  insert into public.profiles (user_id, full_name, phone, preferred_language, marketing_consent)
  values (new.id, full_name, phone, preferred_language, marketing_consent)
  on conflict (user_id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        preferred_language = excluded.preferred_language,
        marketing_consent = excluded.marketing_consent;

  -- create or update customer record tied to the same user (single salon for now)
  insert into public.customers (salon_id, user_id, full_name, email, phone, marketing_consent)
  values (default_salon, new.id, full_name, new.email, phone, marketing_consent)
  on conflict (user_id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        phone = excluded.phone,
        marketing_consent = excluded.marketing_consent;

  -- optionally create or refresh a staff record if metadata contains a valid staff_role
  if staff_role_valid then
    insert into public.staff (salon_id, user_id, role, display_name, email, phone, active)
    values (default_salon, new.id, staff_role, display_name, new.email, phone, true)
    on conflict (user_id) do update
      set role = excluded.role,
          display_name = excluded.display_name,
          email = excluded.email,
          phone = excluded.phone,
          active = true;
  end if;

  return new;
end;
$$;

-- ensure function owns minimal rights
revoke all on function public.handle_auth_user_signup() from public;
grant execute on function public.handle_auth_user_signup() to authenticated, anon, service_role;

-- trigger on auth.users to run after signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_signup();
