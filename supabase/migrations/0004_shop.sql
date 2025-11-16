-- Phase 5: shop, products, orders, and checkout scaffolding

-- products and stock tracking
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  name text not null,
  slug text unique,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'CHF',
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- simple order lifecycle
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'requires_payment', 'paid', 'fulfilled', 'cancelled', 'failed')),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'CHF',
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  name text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  currency text not null,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_products_salon_active on public.products (salon_id, active);
create index if not exists idx_orders_customer on public.orders (customer_id, created_at desc);
create index if not exists idx_orders_profile on public.orders (profile_id, created_at desc);

-- update timestamp helper
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_set_updated before update on public.products
for each row execute function public.touch_updated_at();

create trigger orders_set_updated before update on public.orders
for each row execute function public.touch_updated_at();

-- ===============================
-- Row Level Security
-- ===============================
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- products: public can view active items
create policy "Public product read" on public.products
  for select using (active = true);
create policy "Service role products" on public.products
  for all using (auth.role() = 'service_role');

create policy "Public product images" on public.product_images
  for select using (true);
create policy "Service role product images" on public.product_images
  for all using (auth.role() = 'service_role');

-- orders: customers can see their own; inserts happen via service role or authenticated owner
create policy "Customer order read" on public.orders
  for select to authenticated using (
    customer_id in (
      select id from public.customers where user_id = auth.uid()
    ) or profile_id = (
      select id from public.profiles where user_id = auth.uid()
    )
  );

create policy "Customer order insert" on public.orders
  for insert to authenticated with check (
    customer_id in (
      select id from public.customers where user_id = auth.uid()
    ) or profile_id = (
      select id from public.profiles where user_id = auth.uid()
    )
  );

create policy "Customer order update" on public.orders
  for update to authenticated using (
    customer_id in (
      select id from public.customers where user_id = auth.uid()
    ) or profile_id = (
      select id from public.profiles where user_id = auth.uid()
    )
  );

create policy "Service role orders" on public.orders
  for all using (auth.role() = 'service_role');

create policy "Customer order items" on public.order_items
  for select to authenticated using (
    order_id in (
      select id from public.orders where customer_id in (select id from public.customers where user_id = auth.uid())
        or profile_id = (select id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Service role order items" on public.order_items
  for all using (auth.role() = 'service_role');
