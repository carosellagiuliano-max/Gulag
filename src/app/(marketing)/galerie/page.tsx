import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const placeholders = [
  {
    title: "Color Highlights",
    description: "Balayage, Glossing und Highlights mit gesunden Übergängen.",
  },
  {
    title: "Signature Cuts",
    description: "Präzise Schnitte, die sich zu Hause leicht stylen lassen.",
  },
  {
    title: "Salon Moments",
    description: "Ruhige Atmosphäre, Getränke und liebevolle Details.",
  },
];

export default function GaleriePage() {
  return (
    <div className="container space-y-10 py-12 md:py-16">
      <div className="space-y-3">
        <Badge className="bg-brand-muted text-brand">Galerie</Badge>
        <h1 className="font-display text-4xl text-foreground">Einblicke in unseren Salon</h1>
        <p className="max-w-3xl text-muted-foreground">
          Kurzer Vorgeschmack auf Styles, Farben und Atmosphäre. In Phase 4 binden wir echte Medien aus Supabase Storage ein.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {placeholders.map((item) => (
          <Card key={item.title} className="bg-white/80 shadow-soft">
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-brand-muted/70 to-white" />
            <CardHeader>
              <CardTitle className="font-display text-xl">{item.title}</CardTitle>
              <CardDescription className="text-muted-foreground">{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Galerie-Upload folgt – wir optimieren gerade das Storage-Konzept und holen Freigaben der Kund:innen ein.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
