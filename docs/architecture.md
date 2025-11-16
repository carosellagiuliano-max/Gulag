# Architekturüberblick

SCHNITTWERK by Vanessa Carosella ist eine moderne Salon-Plattform auf Basis von Next.js (App Router) mit klarer Trennung zwischen UI-Komponenten, Domain-Logik und zukünftigen Integrationen (Supabase, Stripe, Notifications).

## Ziele
- Marketing- und Buchungserlebnis für den Salon in St. Gallen
- Von Anfang an erweiterbar für weitere Standorte
- Klar dokumentierte Basis, damit spätere Phasen (Datenbank, Auth, Admin) anschließen können

## Stack (Phase 0–4)
- **Next.js 16** mit TypeScript und App Router
- **Tailwind CSS 3** für Design Tokens & Utility Styling
- **shadcn/ui (New York, neutral)** als Komponentenbasis (Button, Card, Badge, Input, Select, Dialog, Sheet, Toast, Skeleton)
- **next/font** (Inter, Playfair Display) für Typografie
- **Supabase (Postgres + Auth)** mit Schema, RLS, Opening-Hours-Tabelle und Trigger-basierter Verknüpfung von Auth-Usern mit Profil/Customer/Staff
- **@supabase/supabase-js** für serverseitig gecachte Marketing-Daten (Salon, Services, Öffnungszeiten) mit Fallback-Daten, falls kein Key gesetzt ist und für clientseitige Auth/Booking-Interaktionen
- **Supabase Auth** mit Browser-Client für Login/Registration, Session-Persistenz und Termin-Speicherung über RLS

## Projektstruktur
- `src/app` – Routen, Layouts und Seiten (App Router)
- `src/components` – Wiederverwendbare UI- und Layout-Komponenten (`ui` enthält shadcn-basierte Bausteine)
- `src/lib` – Hilfsfunktionen (z. B. `cn` für Klassen-Merging)
- `public/` – Statische Assets
- `docs/` – Architektur- und Setup-Dokumentation

## Styling & Design Tokens
- CSS-Variablen in `globals.css` definieren Farbpalette, Radius und Typografie-Variablen.
- Tailwind-Konfiguration mappt die Variablen auf semantische Token (`background`, `foreground`, `brand`, `primary`, `secondary`, `card`, `popover`) und bindet `tailwindcss-animate` für Motion-States von Dialog, Sheet, Select und Toast.
- Typografie-Baselines in `globals.css` setzen Display-Font für Überschriften und balancieren Fließtext.
- Komponenten folgen shadcn-Konventionen (z. B. `Button`, `Card`, `Badge`, `Input`, `Select`, `Dialog`, `Sheet`, `Toast`, `Skeleton`).

## Buchungs-Engine (Phase 4)
- `/buchen` rendert die `BookingFlow`-Client-Komponente mit Service-/Mitarbeiterwahl und Slot-Generator (7-Tage-Fenster auf Basis der Öffnungszeiten). Slots werden derzeit lokal erzeugt und nutzen Service-Dauer + optionalen Buffer.
- Auth wird über den Supabase-Browser-Client abgewickelt. Ohne gesetzte Supabase-Env-Variablen bleibt die Buchung deaktiviert.
- Termin-Speicherung erstellt/aktualisiert den Customer (per `user_id`) und legt einen `appointments`-Datensatz mit Status `confirmed` an. RLS sorgt dafür, dass nur eingeloggte Kunden ihre Termine schreiben/lesen können.
- `/dashboard` zeigt bevorstehende Termine des eingeloggten Kunden mit Status-Badges und Storno (Status-Transition auf `cancelled`).

## Nächste Phasen (Ausblick)
- **Phase 5**: Shop-Listing erweitern und Checkout mit Stripe (Testmodus), Bestellmodell und Historie.
- **Phase 6**: Admin-Portal (Services/Staff, Kalender, Kunden, Produkte/Stock, Settings, Notifications) mit RBAC.
- **Phase 7**: Hardening, Analytics, Tests und UX-Politur.
