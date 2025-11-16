import { Users, Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSnapshot } from "@/lib/admin-data";

function formatDate(value?: string | null) {
  if (!value) return "–";
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CustomersPage() {
  const snapshot = await getAdminSnapshot();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Phase 6</p>
          <h1 className="font-display text-3xl text-foreground">Kunden</h1>
          <p className="text-muted-foreground">
            Übersicht über Kunden, Marketing-Einwilligungen und letzte Besuche. Aktionen laufen serverseitig über Service Role.
          </p>
        </div>
        <Badge className="bg-brand text-brand-foreground">Priorität 3</Badge>
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

      <Card className="shadow-soft">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5" /> Kundenübersicht
            </CardTitle>
            <CardDescription className="text-muted-foreground">Kontaktdaten, Einwilligung, letzter Besuch.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            {snapshot.customers.length} Kunden
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {snapshot.customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Kunden vorhanden.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Kontakt</th>
                    <th className="px-3 py-2">Marketing</th>
                    <th className="px-3 py-2">Erstellt</th>
                    <th className="px-3 py-2">Letzter Besuch</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-border/60">
                      <td className="px-3 py-2 font-medium text-foreground">{customer.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <div className="flex flex-col gap-1">
                          {customer.email && (
                            <span className="inline-flex items-center gap-1 text-sm">
                              <Mail className="h-3.5 w-3.5" /> {customer.email}
                            </span>
                          )}
                          {customer.phone && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Phone className="h-3.5 w-3.5" /> {customer.phone}
                            </span>
                          )}
                          {!customer.email && !customer.phone && <span>–</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge className={customer.marketingConsent ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"}>
                          {customer.marketingConsent ? "Opt-In" : "Kein Opt-In"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{formatDate(customer.createdAt)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{formatDate(customer.lastVisit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
