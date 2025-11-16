import { Cog, Clock, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSnapshot } from "@/lib/admin-data";

const dayLabels = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

export default async function SettingsPage() {
  const snapshot = await getAdminSnapshot();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Phase 6</p>
          <h1 className="font-display text-3xl text-foreground">Einstellungen</h1>
          <p className="text-muted-foreground">
            Öffnungszeiten, MwSt., Stornoregeln und Kontakt. Änderungen erfolgen serverseitig über Service Role.
          </p>
        </div>
        <Badge className="bg-brand text-brand-foreground">Priorität 5</Badge>
      </div>

      {snapshot.warnings.length > 0 && (
        <div className="space-y-2">
          {snapshot.warnings.map((warning) => (
            <div key={warning} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {warning}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-5 w-5" /> Öffnungszeiten
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Grundlage für Buchungsslots und Marketing-Seiten.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Tag</th>
                    <th className="px-3 py-2">Öffnet</th>
                    <th className="px-3 py-2">Schliesst</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.openingHours.map((entry) => (
                    <tr key={entry.dayOfWeek} className="border-t border-border/60">
                      <td className="px-3 py-2 font-medium text-foreground">{dayLabels[entry.dayOfWeek] ?? entry.dayOfWeek}</td>
                      <td className="px-3 py-2 text-muted-foreground">{entry.opensAt}</td>
                      <td className="px-3 py-2 text-muted-foreground">{entry.closesAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Cog className="h-5 w-5" /> Policies & Kontakt
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Steuer, Storno-Fenster und Kontaktadresse für Kundenkommunikation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">MwSt</p>
              <p className="text-lg font-semibold text-foreground">{snapshot.settings.vatRate}%</p>
              <p>Steuersatz kann je nach Produktkategorie variieren.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stornoregel</p>
              <p className="text-lg font-semibold text-foreground">
                {snapshot.settings.cancellationHours}h vor Termin kostenfrei
              </p>
              <p>Server Actions können Status-Änderungen vornehmen und Gebühren berechnen.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kontakt</p>
              <p className="text-lg font-semibold text-foreground">{snapshot.settings.contactEmail ?? "n/a"}</p>
              <p>Timezone: {snapshot.settings.timezone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft border-dashed">
        <CardHeader className="flex items-start gap-2">
          <Info className="h-5 w-5 text-slate-500" />
          <div>
            <CardTitle>Read-only Oberfläche</CardTitle>
            <CardDescription className="text-muted-foreground">
              Phase-6-Portal rendert die Settings und Öffnungszeiten read-only. Schreibvorgänge sollten als Server Actions mit
              Service Role umgesetzt werden.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
