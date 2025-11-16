import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMarketingContent } from "@/lib/marketing-content";

export default async function UeberUnsPage() {
  const marketing = await getMarketingContent();

  return (
    <div className="container space-y-10 py-12 md:py-16">
      <div className="space-y-3">
        <Badge className="bg-brand-muted text-brand">Über uns</Badge>
        <h1 className="font-display text-4xl text-foreground">Salonphilosophie & Team</h1>
        <p className="max-w-3xl text-muted-foreground">
          Wir verbinden präzises Handwerk, digitale Klarheit und eine ruhige Atmosphäre. Jeder Besuch soll sich wie eine kleine
          Auszeit anfühlen – planbar, wertschätzend und persönlich.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Vanessa Carosella</CardTitle>
            <CardDescription className="text-muted-foreground">
              Inhaberin, Color Specialist und dein Partner für Looks, die zu deinem Alltag passen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Nach über zwölf Jahren Erfahrung in Schnitt, Farbe und Beratung habe ich SCHNITTWERK als Ort gebaut, an dem Kund:in
              und Team zur Ruhe kommen können.
            </p>
            <p>
              Technologie hilft uns, Termine klar zu planen, Wünsche festzuhalten und dir Empfehlungen transparent zu machen.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Was uns wichtig ist</CardTitle>
            <CardDescription className="text-muted-foreground">
              Kurze Wartezeiten, ehrliche Empfehlungen, hochwertige Produkte und dokumentierte Vorlieben.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Beratung auf Augenhöhe und klare Sprache zu Aufwand, Dauer und Preis.</p>
            <p>• Pflegeempfehlungen, die dein Haar langfristig stärken.</p>
            <p>• Digitale Buchung und Erinnerungen ohne Komplexität.</p>
            <p>• Privatsphäre, Daten- und Einwilligungsmanagement nach Schweizer Datenschutz.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl">Wo du uns findest</CardTitle>
          <CardDescription className="text-muted-foreground">
            {marketing.contact.streetAddress}, {marketing.contact.postalCode} {marketing.contact.city}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Kontakt</p>
            <p>{marketing.contact.phone}</p>
            <p>{marketing.contact.email}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Was dich erwartet</p>
            <p>Ruhiger Salon mit Getränken, stabiler WLAN-Verbindung und dokumentierten Vorlieben.</p>
            <p>Parkplätze und ÖV-Haltestelle in wenigen Gehminuten.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
