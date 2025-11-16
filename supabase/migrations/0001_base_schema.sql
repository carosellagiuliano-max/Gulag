-- Base schema for Phase 1: core entities and auth-ready tables
create extension if not exists pgcrypto;

-- salons represents a single physical location (single tenant for now)
create table if not exists public.salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  description text,
  street_address text,
  postal_code text,
  city text,
  country_code char(2) default 'CH'::char(2),
  phone text,
  email text,
  timezone text default 'Europe/Zurich',
  created_at timestamptz not null default now()
);

-- profiles keep per-user preferences and contact details
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  marketing_consent boolean not null default false,
  preferred_language text default 'de',
  created_at timestamptz not null default now()
);

-- staff are workers connected to a salon and optionally to an auth user
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  role text not null check (role in ('owner', 'admin', 'stylist', 'assistant')),
  display_name text not null,
  bio text,
  phone text,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- categories allow grouping of services (e.g., Haircuts, Color)
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  name text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- individual services offered by the salon
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  service_category_id uuid references public.service_categories (id) on delete set null,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  buffer_minutes integer not null default 0 check (buffer_minutes >= 0),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'CHF',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- customers represent visitors, optionally linked to an auth user
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  user_id uuid unique references auth.users (id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  notes text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now()
);

-- appointments capture a booking for a customer and service
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  staff_id uuid references public.staff (id) on delete set null,
  customer_id uuid not null references public.customers (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'confirmed', 'cancelled', 'completed')),
  price_cents integer check (price_cents >= 0),
  notes text,
  created_at timestamptz not null default now(),
  constraint appointment_time_check check (ends_at is null or ends_at > starts_at)
);

-- helpful indexes
create index if not exists idx_services_salon_active on public.services (salon_id, active);
create index if not exists idx_service_categories_salon on public.service_categories (salon_id);
create index if not exists idx_staff_salon on public.staff (salon_id);
create index if not exists idx_customers_salon_user on public.customers (salon_id, user_id);
create index if not exists idx_appointments_customer on public.appointments (customer_id, starts_at);
create index if not exists idx_appointments_salon_start on public.appointments (salon_id, starts_at);

-- ===============================
-- Row Level Security
-- ===============================
alter table public.salons enable row level security;
alter table public.profiles enable row level security;
alter table public.staff enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;

-- Salon visibility: public read for marketing, service role full access
create policy "Public salon read" on public.salons
  for select using (true);
create policy "Service role salon access" on public.salons
  for all using (auth.role() = 'service_role');

-- Profiles: users manage their own profile
create policy "User can view own profile" on public.profiles
  for select using (auth.uid() = user_id);
create policy "User can upsert own profile" on public.profiles
  for insert with check (auth.uid() = user_id)
  to authenticated;
create policy "User can update own profile" on public.profiles
  for update using (auth.uid() = user_id);
create policy "Service role profiles" on public.profiles
  for all using (auth.role() = 'service_role');

-- Staff: readable to authenticated users; staff manage their own record
create policy "Staff readable to authenticated" on public.staff
  for select to authenticated using (true);
create policy "Staff manage self" on public.staff
  for update using (auth.uid() = user_id);
create policy "Service role staff" on public.staff
  for all using (auth.role() = 'service_role');

-- Service categories: public read, managed by service role
create policy "Public service categories read" on public.service_categories
  for select using (true);
create policy "Service role categories" on public.service_categories
  for all using (auth.role() = 'service_role');

-- Services: public read, managed by service role
create policy "Public services read" on public.services
  for select using (true);
create policy "Service role services" on public.services
  for all using (auth.role() = 'service_role');

-- Customers: user can see and manage own customer record (by user_id)
create policy "Customer owner read" on public.customers
  for select to authenticated using (user_id = auth.uid());
create policy "Customer owner upsert" on public.customers
  for insert with check (user_id = auth.uid())
  to authenticated;
create policy "Customer owner update" on public.customers
  for update using (user_id = auth.uid());
create policy "Service role customers" on public.customers
  for all using (auth.role() = 'service_role');

-- Appointments: customer linked users can view/update their own; service role full
create policy "Customer appointment access" on public.appointments
  for select to authenticated using (
    customer_id in (
      select id from public.customers where user_id = auth.uid()
    )
  );
create policy "Customer appointment insert" on public.appointments
  for insert to authenticated with check (
    customer_id in (
      select id from public.customers where user_id = auth.uid()
    )
  );
create policy "Customer appointment update" on public.appointments
  for update to authenticated using (
    customer_id in (
      select id from public.customers where user_id = auth.uid()
    )
  );
create policy "Service role appointments" on public.appointments
  for all using (auth.role() = 'service_role');

-- Helpful default data
insert into public.salons (id, name, tagline, description, street_address, postal_code, city, phone, email)
values (
  '11111111-1111-1111-1111-111111111111',
  'SCHNITTWERK by Vanessa Carosella',
  'Modern hair artistry in St. Gallen',
  'Signature haircuts, color, and styling with a boutique experience.',
  'Rorschacherstrasse 152',
  '9000',
  'St. Gallen',
  '+41 71 000 00 00',
  'hello@schnittwerk-salon.ch'
) on conflict (id) do nothing;

insert into public.service_categories (id, salon_id, name, description, position)
values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Haircuts', 'Signature cuts and styling', 1),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Color', 'Color services and glossing', 2)
on conflict (id) do nothing;

insert into public.services (id, salon_id, service_category_id, name, description, duration_minutes, price_cents, currency, active)
values
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Signature Haircut', 'Consultation, wash, cut, and style', 60, 12000, 'CHF', true),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Color Refresh', 'Root touch-up and gloss', 90, 18000, 'CHF', true)
on conflict (id) do nothing;
