# Data model (Phase 1)

This document outlines the Supabase/PostgreSQL schema for SCHNITTWERK. Tables are defined as SQL migrations in `supabase/migrations/0001_base_schema.sql` (plus `0002_auth_linking.sql` für Auth-Automation, `0003_opening_hours.sql` für Öffnungszeiten, `0004_shop.sql` für Produkte & Bestellungen) and seeded via `supabase/seed.sql` for local development.

## Tables

### salons
Represents a single physical location (single tenant for now). Provides baseline contact and timezone metadata.

Key fields:
- `id`: UUID primary key.
- `name`, `tagline`, `description`: Marketing details.
- `street_address`, `postal_code`, `city`, `country_code`: Address metadata (default country `CH`).
- `phone`, `email`: Contact points.
- `timezone`: Defaults to `Europe/Zurich`.

### profiles
Stores per-user preferences and contact information tied to Supabase Auth users.

Key fields:
- `user_id`: Unique reference to `auth.users` (nullable until account exists).
- `full_name`, `phone`, `preferred_language` (default `de`).
- `marketing_consent`: Boolean flag.

### staff
Salon staff members, optionally linked to an auth user.

Key fields:
- `salon_id`: FK to `salons`.
- `user_id`: FK to `auth.users` (nullable for placeholder records).
- `role`: One of `owner | admin | stylist | assistant`.
- `display_name`, `bio`, `phone`, `email`, `active`.

### service_categories
Groups services for navigation and booking (e.g., Haircuts, Color).

Key fields:
- `salon_id`: FK to `salons`.
- `name`, `description`, `position`: Ordering integer for display.

### services
Individual services offered by the salon.

Key fields:
- `salon_id`: FK to `salons`.
- `service_category_id`: FK to `service_categories` (nullable; preserves services if category removed).
- `name`, `description`.
- `duration_minutes` (> 0) and optional `buffer_minutes` (>= 0).
- `price_cents` (>= 0) and `currency` (default `CHF`).
- `active`: Boolean toggle.

### opening_hours
Defines weekly opening windows for marketing und spätere Slot-Berechnung.

Key fields:
- `salon_id`: FK to `salons`.
- `day_of_week`: 0–6 (Sonntag = 0, Montag = 1, ...).
- `opens_at`, `closes_at`: `time` Felder für Anzeige und künftige Slot-Generierung.

### customers
Salon customers, optionally tied to an authenticated user.

Key fields:
- `salon_id`: FK to `salons`.
- `user_id`: Unique FK to `auth.users` (nullable for guest-only records).
- `full_name`, `phone`, `email`, `notes`.
- `marketing_consent` flag.

### appointments
Represents a booking connecting customer, staff, and service.

Key fields:
- `salon_id`: FK to `salons`.
- `service_id`: FK to `services`.
- `staff_id`: FK to `staff` (nullable for unassigned bookings).
- `customer_id`: FK to `customers`.
- `starts_at`, `ends_at` with `appointment_time_check` to ensure end is after start.
- `status`: `scheduled | confirmed | cancelled | completed` (default `scheduled`).
- `price_cents`: Optional override captured at booking time.
- Status-Transitions in Phase 4: Buchungen werden als `confirmed` angelegt, das Dashboard erlaubt eine Stornierung (Update auf `cancelled`).

### products
Salonkuratiertes Sortiment für den Shop inkl. einfacher Lagerführung.

Key fields:
- `salon_id`: FK to `salons` (Single-Tenant Annahme).
- `name`, `slug`, `description`, `sku`.
- `price_cents` (>= 0), `currency` (default `CHF`).
- `stock` (>= 0), `active`, `featured`.
- Timestamps inkl. `updated_at` Trigger.

### product_images
Optionale Bild-URLs pro Produkt (Supabase Storage oder Public Assets).

Key fields:
- `product_id`: FK to `products`.
- `image_url`: Pfad/URL, `position` für Sortierung.

### orders
Persistiert Warenkörbe nach dem Stripe Checkout Einstieg, bindet Kund:innen an Supabase-Profile.

Key fields:
- `salon_id`: FK to `salons`.
- `customer_id`: FK zu `customers` (optional, falls Auth bekannt).
- `profile_id`: FK zu `profiles` (optional).
- `email`: Rechnungs-/Kontaktadresse für Stripe.
- `status`: `pending | requires_payment | paid | fulfilled | cancelled | failed`.
- `total_cents`, `currency`, Stripe IDs (`stripe_session_id`, `stripe_payment_intent_id`).

### order_items
Positionen einer Bestellung für Beleganzeige und Lageranpassung.

Key fields:
- `order_id`: FK to `orders` (Cascade Delete).
- `product_id`: FK to `products`.
- `name`, `sku`, `quantity`, `unit_price_cents`, `currency`, `subtotal_cents`.

## Seed data

`supabase/seed.sql` seeds opening hours, plus a placeholder admin/staff/customer once you create the matching Supabase Auth user ID, and an example appointment. `0001_base_schema.sql` also seeds:
- Salon: SCHNITTWERK by Vanessa Carosella.
- Service categories: Haircuts and Color.
- Services: Signature Haircut, Color Refresh.

## Auth linking (Supabase)
- Migration `0002_auth_linking.sql` adds the trigger `on_auth_user_created` on `auth.users`.
- The trigger executes `public.handle_auth_user_signup()` to:
  - Upsert a `profiles` row for the user (name, phone, preferred_language, marketing_consent from auth metadata).
  - Upsert a `customers` row for the current salon (single-tenant assumption) using the same metadata + email.
  - Optionally upsert a `staff` row when `staff_role` is present in auth `raw_user_meta_data` and matches `owner|admin|stylist|assistant`.
- Re-running seeds after adding an Auth user lets you keep the demo appointment aligned with the created user IDs.

## Notes and future steps
- Additional entities (products, orders, schedules, availability templates) will be added in later phases.
- Migrations assume `pgcrypto` is available for `gen_random_uuid()` (enabled in the migration).
- Keep auth-linked columns nullable until the user is provisioned to avoid blocked inserts during bootstrap.
