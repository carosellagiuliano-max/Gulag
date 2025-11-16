import { Wrench, Users2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSnapshot } from "@/lib/admin-data";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency }).format(value / 100);
}

export default async function ServicesPage() {
  const snapshot = await getAdminSnapshot();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Phase 6</p>
          <h1 className="font-display text-3xl text-foreground">Services & Team</h1>
          <p className="text-muted-foreground">
            Verwaltung von Leistungen, Preisen, Dauer und Team-Rollen. Änderungen laufen serverseitig über Service Role.
          </p>
        </div>
        <Badge className="bg-brand text-brand-foreground">Priorität 1</Badge>
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
                <Wrench className="h-5 w-5" /> Leistungen
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Übersicht über Services, Preise und Dauer. Bearbeitung per Service Role API.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-50 text-slate-700">
              {snapshot.services.filter((svc) => svc.active).length} aktiv
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.services.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Services definiert.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Service</th>
                      <th className="px-3 py-2">Kategorie</th>
                      <th className="px-3 py-2">Dauer</th>
                      <th className="px-3 py-2">Preis</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.services.map((svc) => (
                      <tr key={svc.id} className="border-t border-border/60">
                        <td className="px-3 py-2 font-medium text-foreground">{svc.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{svc.category ?? "–"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{svc.durationMinutes} min</td>
                        <td className="px-3 py-2 text-muted-foreground">{formatMoney(svc.priceCents, svc.currency)}</td>
                        <td className="px-3 py-2">
                          <Badge className={svc.active ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"}>
                            {svc.active ? "aktiv" : "inaktiv"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users2 className="h-5 w-5" /> Team & Rollen
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                RBAC nutzt die Rolle aus der staff-Tabelle (owner/admin/stylist/assistant).
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-50 text-slate-700">
              {snapshot.staff.length} Personen
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.staff.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Teammitglieder gepflegt.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Rolle</th>
                      <th className="px-3 py-2">Kontakt</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.staff.map((member) => (
                      <tr key={member.id} className="border-t border-border/60">
                        <td className="px-3 py-2 font-medium text-foreground">{member.name}</td>
                        <td className="px-3 py-2 text-muted-foreground capitalize">{member.role}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {member.email || member.phone ? (
                            <div className="flex flex-col">
                              {member.email && <span>{member.email}</span>}
                              {member.phone && <span className="text-xs text-slate-500">{member.phone}</span>}
                            </div>
                          ) : (
                            <span>–</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Badge className={member.active ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"}>
                            {member.active ? "aktiv" : "inaktiv"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
