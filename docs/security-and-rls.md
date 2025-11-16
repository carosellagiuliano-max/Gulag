# Security and RLS (Phase 1)

This project uses Supabase/PostgreSQL with Row Level Security enabled on all domain tables. Policies are defined directly in `supabase/migrations/0001_base_schema.sql` (plus `0002_auth_linking.sql`, `0003_opening_hours.sql`, `0004_shop.sql`) to keep security versioned alongside schema changes.

## Principles
- **Least privilege**: grant only the operations required for the current phase.
- **Customer ownership**: authenticated users only see and mutate rows tied to their `auth.uid()` via `user_id` or linked `customer_id`.
- **Service role override**: service role has full access for admin jobs, seeds, and migrations.
- **Public marketing visibility**: selected read-only tables remain publicly readable to support the marketing site.

## Table policies

### salons
- Public `select` to allow marketing site to render salon information.
- `service_role` policy for unrestricted administrative operations.

### profiles
- Users can `select`, `insert`, and `update` rows where `user_id = auth.uid()`.
- `service_role` policy for full control.

### staff
- Authenticated users may `select` staff records (needed for booking and listings).
- Staff can `update` their own row (`user_id = auth.uid()`).
- `service_role` policy for administrative control.

### service_categories
- Public `select` for marketing/booking UI.
- `service_role` policy for management operations.

### services
- Public `select` for marketing/booking UI.
- `service_role` policy for management operations.

### opening_hours
- Public `select` to surface Öffnungszeiten auf Marketing-Seiten.
- `service_role` policy für Pflege der Öffnungszeiten.

### customers
- Authenticated users can `select`, `insert`, and `update` rows where `user_id = auth.uid()`.
- `service_role` policy for admin and support flows.

### appointments
- Authenticated users can `select`, `insert`, and `update` rows when the appointment links to a customer they own (`customer_id` lookup against `user_id = auth.uid()`).
- `service_role` policy for full control.

The Phase-4 Booking-Flow läuft vollständig über den Supabase-Browser-Client und vertraut auf diese Policies: ohne aktive Session ist keine Terminbuchung oder Dashboard-Anzeige möglich, mit Session greifen die RLS-Regeln automatisch.

### products & product_images
- Public `select` for products to power Marketing/Shop ohne Login, nur aktive Produkte werden ausgeliefert.
- Public `select` for product_images.
- `service_role` policies for inserts/updates and stock adjustments.

### orders & order_items
- Authenticated users can `select`, `insert`, and `update` orders only when the order is linked to their customer/profile (`customer_id` by `user_id = auth.uid()` or matching `profile_id`).
- Order items are readable to authenticated users only if the parent order is visible to them.
- `service_role` policy for full control; server actions use the service key to create orders and adjust stock before invoking Stripe Checkout.

## Operational guidance
- Migration `0002_auth_linking.sql` installs a trigger on `auth.users` that upserts the profile/customer/staff rows automatically
  based on `raw_user_meta_data` (e.g., `full_name`, `phone`, `preferred_language`, `marketing_consent`, `staff_role`).
- When creating an admin via Supabase Auth, set `staff_role` metadata so the staff record is created and linked immediately.
- If you want the demo appointment in `supabase/seed.sql` to reference the new admin, update the UUID there and rerun `supabase db seed`.
- Future phases will tighten policies (e.g., role-based staff/admin actions) and add audit logging.
