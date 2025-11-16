-- Opening hours for marketing and booking windows
create table if not exists public.opening_hours (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  opens_at time not null,
  closes_at time not null,
  created_at timestamptz not null default now(),
  unique (salon_id, day_of_week)
);

create index if not exists idx_opening_hours_salon_day on public.opening_hours (salon_id, day_of_week);

alter table public.opening_hours enable row level security;

create policy "Public opening hours read" on public.opening_hours
  for select using (true);
create policy "Service role opening hours" on public.opening_hours
  for all using (auth.role() = 'service_role');
