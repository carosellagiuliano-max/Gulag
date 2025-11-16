import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMarketingContent, weekdayLabel } from "@/lib/marketing-content";

export default async function KontaktPage() {
  const marketing = await getMarketingContent();

  return (
    <div className="container space-y-10 py-12 md:py-16">
      <div className="space-y-3">
        <Badge className="bg-brand-muted text-brand">Kontakt</Badge>
        <h1 className="font-display text-4xl text-foreground">So erreichst du uns</h1>
        <p className="max-w-3xl text-muted-foreground">
          Ruf an, schreib uns oder buche direkt online. Wir antworten werktags innerhalb weniger Stunden und halten alle Absprachen
          in deinem Profil fest.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_0.7fr]">
        <Card className="bg-white/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Kontakt & Standort</CardTitle>
            <CardDescription className="text-muted-foreground">
              {marketing.contact.streetAddress}, {marketing.contact.postalCode} {marketing.contact.city}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Telefon & Mail</p>
              <p>{marketing.contact.phone}</p>
              <p>{marketing.contact.email}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Anfahrt</p>
              <p>Rorschacherstrasse 152, 9000 St. Gallen</p>
              <p>Parkplätze in der Nähe, ÖV-Haltestelle 2 Minuten zu Fuß.</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-brand text-brand-foreground shadow-soft hover:bg-brand/90" asChild>
                <a href="tel:+41710000000">Anrufen</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:hello@schnittwerk.ch">E-Mail senden</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Öffnungszeiten</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ideal zum Einplanen deines Termins oder spontanen Besuchs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {marketing.openingHours.map((hour) => (
              <div key={hour.dayOfWeek} className="space-y-1 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{weekdayLabel(hour.dayOfWeek)}</p>
                <p>
                  {hour.opensAt} – {hour.closesAt}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
