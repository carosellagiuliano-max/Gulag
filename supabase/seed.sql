-- Seed data for local development
-- Note: create the admin user in Supabase Auth first (with metadata like full_name, staff_role, phone). The trigger in
-- 0002_auth_linking.sql will create linked profile/customer/staff rows; update the UUIDs below only if you need the sample
-- appointment to reference that exact user id.

-- consistent opening hours for marketing and booking windows
insert into public.opening_hours (salon_id, day_of_week, opens_at, closes_at)
values
  ('11111111-1111-1111-1111-111111111111', 1, '09:00', '18:30'),
  ('11111111-1111-1111-1111-111111111111', 2, '09:00', '18:30'),
  ('11111111-1111-1111-1111-111111111111', 3, '09:00', '18:30'),
  ('11111111-1111-1111-1111-111111111111', 4, '09:00', '18:30'),
  ('11111111-1111-1111-1111-111111111111', 5, '08:00', '15:00')
on conflict (salon_id, day_of_week) do nothing;

-- create a profile and staff record for the admin user once available
insert into public.profiles (user_id, full_name, preferred_language, marketing_consent)
values ('00000000-0000-0000-0000-000000000001', 'Vanessa Carosella', 'de', true)
on conflict (user_id) do nothing;

insert into public.customers (id, salon_id, user_id, full_name, email, marketing_consent)
values ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001',
'Vanessa Carosella', 'vanessa@schnittwerk-salon.ch', true)
on conflict (id) do nothing;

insert into public.staff (id, salon_id, user_id, role, display_name, email, phone)
values ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001',
'owner', 'Vanessa', 'vanessa@schnittwerk-salon.ch', '+41 71 000 00 01')
on conflict (id) do nothing;

insert into public.appointments (id, salon_id, service_id, staff_id, customer_id, starts_at, ends_at, status, price_cents)
values (
  '88888888-8888-8888-8888-888888888888',
  '11111111-1111-1111-1111-111111111111',
  '44444444-4444-4444-4444-444444444444',
  '77777777-7777-7777-7777-777777777777',
  '66666666-6666-6666-6666-666666666666',
  now() + interval '2 days',
  now() + interval '2 days 1 hour',
  'scheduled',
  12000
) on conflict (id) do nothing;

-- Beispiel: bestätigter Termin in der Zukunft
insert into public.appointments (id, salon_id, service_id, staff_id, customer_id, starts_at, ends_at, status, price_cents)
values (
  '99999999-9999-9999-9999-999999999999',
  '11111111-1111-1111-1111-111111111111',
  '44444444-4444-4444-4444-444444444444',
  '77777777-7777-7777-7777-777777777777',
  '66666666-6666-6666-6666-666666666666',
  now() + interval '5 days',
  now() + interval '5 days 1 hour',
  'confirmed',
  12000
) on conflict (id) do nothing;

-- Produkte für den Shop
insert into public.products (id, salon_id, name, slug, description, price_cents, currency, sku, stock, active, featured)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Repair & Shine Shampoo', 'repair-shine-shampoo', 'Sanfte Reinigung mit Proteinen und Glanz-Booster, ideal nach Farbservices.', 3400, 'CHF', 'SW-SHAMPOO-01', 15, true, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'Hydrate Leave-In Mist', 'hydrate-leave-in-mist', 'Leichter Feuchtigkeitsspray mit Hitzeschutz für tägliches Styling.', 2900, 'CHF', 'SW-LEAVEIN-01', 20, true, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111', 'Volume Root Lift', 'volume-root-lift', 'Ansatzspray für feines Haar, langanhaltendes Volumen ohne zu beschweren.', 3200, 'CHF', 'SW-VOLUME-01', 10, true, false)
ON CONFLICT (id) DO NOTHING;

insert into public.product_images (product_id, image_url, position)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '/window.svg', 0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '/globe.svg', 0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '/next.svg', 0)
ON CONFLICT DO NOTHING;

-- Beispielbestellung zur Verprobung
insert into public.orders (id, salon_id, customer_id, email, status, total_cents, currency)
values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  '66666666-6666-6666-6666-666666666666',
  'vanessa@schnittwerk-salon.ch',
  'paid',
  6300,
  'CHF'
) on conflict (id) do nothing;

insert into public.order_items (order_id, product_id, name, sku, quantity, unit_price_cents, currency, subtotal_cents)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Repair & Shine Shampoo', 'SW-SHAMPOO-01', 1, 3400, 'CHF', 3400),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Hydrate Leave-In Mist', 'SW-LEAVEIN-01', 1, 2900, 'CHF', 2900)
ON CONFLICT DO NOTHING;
