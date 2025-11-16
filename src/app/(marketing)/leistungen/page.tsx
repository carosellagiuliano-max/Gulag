import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, getMarketingContent } from "@/lib/marketing-content";

export default async function LeistungenPage() {
  const marketing = await getMarketingContent();

  return (
    <div className="container space-y-10 py-12 md:py-16">
      <div className="space-y-3">
        <Badge className="bg-brand-muted text-brand">Leistungen</Badge>
        <h1 className="font-display text-4xl text-foreground">Alle Services im Überblick</h1>
        <p className="max-w-3xl text-muted-foreground">
          Transparent beschrieben, mit klaren Zeitfenstern und Preisen. Alle Services beinhalten eine persönliche Beratung,
          hochwertige Produkte und Styling-Tipps für zu Hause.
        </p>
      </div>

      <div className="space-y-8">
        {marketing.serviceCategories.map((category) => (
          <section key={category.id} className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
              <div>
                <h2 className="font-display text-2xl text-foreground">{category.name}</h2>
                {category.description ? (
                  <p className="text-muted-foreground">{category.description}</p>
                ) : (
                  <p className="text-muted-foreground">Fein abgestimmte Services, individuell geplant.</p>
                )}
              </div>
              <Badge variant="outline">Termin nach Verfügbarkeit</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {category.services.map((service) => (
                <Card key={service.id} className="bg-white/80 shadow-soft">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {service.description ?? "Beratung, Umsetzung und Finish inklusive."}
                        </CardDescription>
                      </div>
                      <p className="text-sm font-semibold text-brand">
                        {formatPrice(service.priceCents, service.currency)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Dauer: ca. {service.durationMinutes} Minuten</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
