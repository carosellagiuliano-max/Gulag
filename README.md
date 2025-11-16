# SCHNITTWERK by Vanessa Carosella

Digitale Basis für den Salon in St. Gallen: Marketing-Seite, klare Buchungsstrecke und später Admin-, Kunden- und Shop-Funktionen. Phase 0 liefert das technische Fundament (Next.js, Tailwind, shadcn/ui) und eine erste Marketing-Startseite. Phase 1 ergänzt das Supabase-Schema und Auth-Grundlagen. Phase 2 bringt ein erweitertes Design System (Dialog, Sheet, Select, Toast, Skeleton) und eine mobile Navigation über das globale Layout. Phase 5 fügt den Shop mit Stripe-Test-Checkout, Lagerführung und Bestellverlauf hinzu.

## Quickstart
```bash
npm install
npm run dev
# http://localhost:3000
```

Weitere Details findest du in [docs/dev-setup.md](docs/dev-setup.md).

## Was ist enthalten?
- Next.js 16 (App Router) mit TypeScript
- Tailwind CSS 3 + Design Tokens über CSS-Variablen
- shadcn/ui (New York, neutral) mit Basis-Komponenten (Button, Card, Badge, Input) plus neue Bausteine (Select, Dialog, Sheet, Toast, Skeleton)
- Grundlayout (Header/Footer), mobile Navigation via Sheet, Typografie (Inter, Playfair Display) und Salon-Messaging auf der Startseite
- Supabase Schema + Seeds für Salons, Profile, Staff, Services, Customers, Opening Hours, Products, Orders
- Buchungs-Flow mit Service-/Mitarbeiter-/Slot-Auswahl, Supabase-gestützter Termin-Speicherung und Kunden-Dashboard inkl. Storno
- Shop mit Produktlisting, Produktdetail, Warenkorb, Lagerstandsprüfung und Stripe Test-Checkout
- Dokumentation zu Architektur, Setup, Datenmodell und Security in `docs/`

## Projektstruktur
- `src/app` – Layout & Seiten
- `src/components` – Wiederverwendbare UI- und Layout-Komponenten
- `src/lib` – Utilities (z. B. `cn`)
- `public` – Statische Assets
- `supabase` – Datenbank-Migrationen und Seeds
- `docs` – Architektur-, Setup- und Sicherheitsdokumentation

## Status & nächste Schritte
- ✅ Phase 0: Next.js-Grundgerüst, Fonts, Layout, Landingpage
- ✅ Phase 1: Supabase-Schema, RLS, Seeds und automatische Auth-Verknüpfung für Profile/Customers/Staff
- ✅ Phase 2: Erweitertes Design System (Dialog, Sheet, Select, Toast, Skeleton) und mobile Navigation
- ✅ Phase 3: Öffentliche Seiten (Home, Leistungen, Galerie, Über uns, Kontakt, Shop, Buchung) mit dynamischen Inhalten
- ✅ Phase 4: Buchungsstrecke mit Auth (Login/Registration), Termin-Speicherung und Kunden-Dashboard
- ✅ Phase 5: Shop mit Stripe-Test-Checkout, Lagerführung und Bestellhistorie im Kundenportal
