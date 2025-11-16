import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, getMarketingContent, weekdayLabel } from "@/lib/marketing-content";

export default async function HomePage() {
  const marketing = await getMarketingContent();
  const featuredServices = marketing.serviceCategories
    .flatMap((category) => category.services.map((service) => ({ ...service, category: category.name })))
    .slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      <section className="container grid items-center gap-12 pt-8 md:grid-cols-[1.1fr_0.9fr] md:pt-16">
        <div className="space-y-8">
          <Badge className="bg-brand-muted text-brand">Salon-Experience 2025 ready</Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {marketing.contact.name} · {marketing.contact.city}
            </p>
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              Zeitlose Schnitte, moderne Colorationen und echte Betreuung.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Wir kombinieren präzises Handwerk mit digitaler Klarheit: einfache Online-Buchung, ehrliche Beratung und Produkte,
              die dein Haar langfristig stärken.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-brand text-brand-foreground shadow-soft hover:bg-brand/90" asChild>
              <Link href="/buchen">Termin buchen</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/leistungen">Leistungen ansehen</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="bg-white/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-semibold text-brand">12+</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Jahre Erfahrung in Schnitt & Farbe
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-semibold">95%</CardTitle>
                <CardDescription className="text-muted-foreground">
                  der Kund:innen empfehlen uns weiter
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-semibold">+ CHF 10</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Pflege-Upgrade für nachhaltiges Haargefühl
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
        <Card className="border-0 bg-white/80 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Dein Termin, klar geplant</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Wir arbeiten mit klaren Zeitfenstern, damit du ohne Warten in deinen Look starten kannst.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredServices.map((service) => (
              <div key={service.id} className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                  </div>
                  <p className="text-sm font-medium text-brand">{formatPrice(service.priceCents, service.currency)}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {service.description ?? "Präzise ausgeführt, mit Fokus auf Pflege und Haltbarkeit."}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Dauer: ca. {service.durationMinutes} Minuten
                </p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Noch unsicher? Melde dich kurz – wir empfehlen dir den passenden Service.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/kontakt">Kontakt aufnehmen</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="container space-y-10" id="leistungen">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-foreground">Leistungen im Überblick</h2>
            <p className="text-muted-foreground">
              Für jeden Haartyp und jede Lebenssituation – klar beschrieben und transparent geplant.
            </p>
          </div>
          <Badge variant="outline">Individuelle Beratung inklusive</Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredServices.map((service) => (
            <Card key={service.id} className="bg-white/80 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-xl">{service.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description ?? "Beratung, Präzision und Pflege gehören immer dazu."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Dauer: {service.durationMinutes} Min.</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(service.priceCents, service.currency)}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <Button variant="link" asChild className="text-brand">
            <Link href="/leistungen">Alle Leistungen ansehen →</Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border/70 bg-white/70 py-16" id="team">
        <div className="container grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <h2 className="font-display text-3xl text-foreground">Wie wir arbeiten</h2>
            <p className="text-muted-foreground">
              Vanessa und das Team arbeiten mit klaren Abläufen, damit dein Termin sich wie eine Auszeit anfühlt – ohne Hektik,
              mit ehrlicher Beratung und liebevollen Details.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Beratung auf Augenhöhe", "Ruhiges Salon-Erlebnis", "Nachhaltige Produkte", "Digitale Buchung"].map((title) => (
              <Card key={title} className="bg-white/90">
                <CardHeader>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Wir nehmen uns Zeit, reduzieren Wartezeiten und arbeiten mit klaren Zeitfenstern.
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container grid gap-10 md:grid-cols-[1.1fr_0.9fr]" id="besuch">
        <div className="space-y-4">
          <h2 className="font-display text-3xl text-foreground">Dein Besuch im SCHNITTWERK</h2>
          <p className="text-muted-foreground">
            Komm ein paar Minuten früher, genieße einen Drink und erzähle uns, was dir wichtig ist. Wir halten deine Vorlieben in
            deinem Profil fest, damit jeder Termin nahtlos wird.
          </p>
          <div className="rounded-xl border border-border/60 bg-white/80 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Infos zum Salon</p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>{marketing.contact.streetAddress}</p>
              <p>
                {marketing.contact.postalCode} {marketing.contact.city}
              </p>
              <p>{marketing.contact.phone}</p>
              <p>{marketing.contact.email}</p>
            </div>
          </div>
        </div>
        <div className="space-y-6" id="booking">
          <div className="space-y-2">
            <h3 className="font-display text-2xl">Bereit für deinen Termin?</h3>
            <p className="text-muted-foreground">
              Wähle den Service, sichere dir deinen Slot und freue dich auf ein Salon-Erlebnis ohne Stress.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-brand text-brand-foreground">
              <CardHeader>
                <CardTitle>Online buchen</CardTitle>
                <CardDescription className="text-brand-foreground/90">
                  In wenigen Klicks deinen Wunschtermin reservieren. Bestätigung kommt sofort.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="secondary" className="bg-white text-foreground hover:bg-white/90" asChild>
                  <Link href="/buchen">Buchung öffnen</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle>Persönlich abstimmen</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Du hast besondere Wünsche? Schreib uns kurz, wir planen deinen Termin gemeinsam.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="mailto:hello@schnittwerk.ch">E-Mail senden</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="rounded-xl border border-border/60 bg-white/80 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Öffnungszeiten</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {marketing.openingHours.map((hour) => (
                <div key={hour.dayOfWeek} className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{weekdayLabel(hour.dayOfWeek)}</p>
                  <p className="text-sm text-muted-foreground">
                    {hour.opensAt} – {hour.closesAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
