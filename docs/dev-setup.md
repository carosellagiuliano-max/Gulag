# Developer Setup

## Voraussetzungen
- Node.js 20+
- npm (Standard in Phase 0)
- Supabase CLI (`npm install -g supabase` oder binär von supabase.com)
- Keine weiteren globalen Abhängigkeiten; shadcn-CLI wird per `npx` aufgerufen.

## Projekt installieren
```bash
npm install
```

## Entwicklung starten (Frontend)
```bash
npm run dev
# öffnet http://localhost:3000
```

## Supabase lokal verwenden
```bash
supabase start           # startet lokale Supabase-Services
supabase db reset        # wendet Migrationen an und leert die DB
supabase db seed         # importiert supabase/seed.sql
```

- Migrationen liegen unter `supabase/migrations`. Neue Migration hinzufügen:
```bash
supabase db diff --linked --file 0002_<beschriftung>.sql
```
- Seed-Daten liegen in `supabase/seed.sql` (UUID des Admin-Users nach Auth-Setup anpassen).
- Marketing-Daten (Salon, Services, Öffnungszeiten) werden serverseitig aus Supabase gelesen, wenn diese Umgebungsvariablen
  gesetzt sind:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=<deine-url>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<dein-anon-key>
  ```
  Ohne Keys greifen die Seiten auf Fallback-Daten aus `src/lib/marketing-content.ts` zurück.
- Die Buchungs- und Dashboard-Seiten erfordern einen eingeloggten Supabase-User; ohne gültige URL/Key bleibt die Termin-Erstellung deaktiviert.
- Shop/Checkout (Phase 5) benötigt zusätzlich:
  ```bash
  SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # serverseitig für Orders/Stock
  STRIPE_SECRET_KEY=<test-secret-key>            # Stripe Testmodus
  NEXT_PUBLIC_SITE_URL=http://localhost:3000     # Basis-URL für Checkout-Redirects
  ```
  Der Checkout läuft über einen Server Action Aufruf (`startCheckout`) mit Supabase Service Key, prüft Lagerstände und erzeugt eine Stripe Checkout Session.

### Supabase Auth verknüpfen
- Beim Signup legt Supabase automatisch einen Eintrag in `auth.users` an. Die Migration `0002_auth_linking.sql` erzeugt via
  Trigger sofort verknüpfte Datensätze in `public.profiles`, `public.customers` (aktueller Salon) und optional in `public.staff`
  (wenn ein gültiger `staff_role` in den User-Metadaten steckt).
- Beispiel: Admin-User in der Supabase UI/CLI anlegen und Metadaten setzen:
  ```bash
  supabase auth sign up \\
    --email vanessa@schnittwerk-salon.ch \\
    --password "<dein-passwort>" \\
    --data '{"full_name":"Vanessa Carosella","staff_role":"owner","phone":"+41 71 000 00 01","preferred_language":"de","marketing_consent":true}'
  ```
- Danach `supabase db seed` erneut ausführen, falls du das Seed-Appointment aktualisieren möchtest.

## Qualitätssicherung
```bash
npm run lint
```

## Komponenten (shadcn/ui)
- Konfiguration: `components.json`
- Basiskomponenten liegen unter `src/components/ui`
- Erweiterte Bausteine (Dialog, Sheet, Select, Toast, Skeleton) sind vorbereitet und nutzen `tailwindcss-animate` für Motion-States. Der Toaster wird global in `src/app/layout.tsx` eingebunden.
- Neue Komponenten hinzufügen:
```bash
npx shadcn@latest add <component-name>
```

## Ordnerstruktur
- `src/app` – App Router Layouts & Seiten
- `src/components` – UI- und Layout-Komponenten
- `src/lib` – Hilfsfunktionen (z. B. `cn`)
- `docs` – Projekt- und Setup-Dokumentation
- `supabase` – Migrationen & Seeds

## Nächste Schritte
- ✅ Phase 1: Supabase anbinden (Schema + Auth), RLS definieren, Trigger-gestützte Verknüpfung der Auth-User.
- ✅ Phase 2: Navigationsstruktur und Design System weiter ausbauen (Responsive States, Galerie/Über uns Seiten vorbereiten).
- ✅ Phase 3: Öffentliche Inhaltsseiten (Home, Leistungen, Galerie, Über uns, Kontakt, Shop, Buchung) mit Supabase-Daten und Fallbacks.
- ✅ Phase 4: Buchungs-Engine mit Service/Staff/Slot-Auswahl, Kunden-Login und Dashboard.
- ✅ Phase 5: Shop mit Stripe-Test-Checkout, Lagerstandsprüfung und Bestellverlauf im Kundenportal.
- ⏭️ Phase 6: Admin-Portal (Service/Staff Management, Kalender, Kunden, Produkte/Stock, Settings, Templates).
