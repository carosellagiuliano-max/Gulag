import { CalendarDays, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSnapshot } from "@/lib/admin-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-900",
  scheduled: "bg-blue-100 text-blue-900",
  cancelled: "bg-rose-100 text-rose-900",
  completed: "bg-slate-100 text-slate-900",
};

export default async function AppointmentsPage() {
  const snapshot = await getAdminSnapshot();
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 1);
  const upcoming = snapshot.appointments
    .filter((appt) => new Date(appt.startsAt) >= windowStart)
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Phase 6</p>
          <h1 className="font-display text-3xl text-foreground">Kalender & Termine</h1>
          <p className="text-muted-foreground">
            Überblick über bestätigte und anstehende Termine. Änderungen erfolgen per serverseitiger Service Role.
          </p>
        </div>
        <Badge className="bg-brand text-brand-foreground">Priorität 2</Badge>
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
              <CalendarDays className="h-5 w-5" /> Kommende Termine
            </CardTitle>
            <CardDescription className="text-muted-foreground">Service, Kunde, Stylist und Status.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            {upcoming.length} Einträge
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Termine vorhanden.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Zeit</th>
                    <th className="px-3 py-2">Service</th>
                    <th className="px-3 py-2">Kunde</th>
                    <th className="px-3 py-2">Stylist</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((appt) => (
                    <tr key={appt.id} className="border-t border-border/60">
                      <td className="px-3 py-2 text-muted-foreground">{formatDate(appt.startsAt)}</td>
                      <td className="px-3 py-2 font-medium text-foreground">{appt.serviceName}</td>
                      <td className="px-3 py-2 text-muted-foreground">{appt.customerName ?? "Walk-in"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{appt.staffName ?? "Team"}</td>
                      <td className="px-3 py-2">
                        <Badge className={statusStyles[appt.status] ?? "bg-slate-100 text-slate-700"}>{appt.status}</Badge>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock3 className="h-5 w-5" /> Service-Level Hinweise
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Für echte Bearbeitungen muss die Service Role in Server Actions genutzt werden; UI läuft read-only.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
            Slots können mit Öffnungszeiten und Buffer in der Booking-Engine berechnet werden. Termine hier bleiben Quelle für
            Marketing und Kundenportal.
          </div>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
            Storno- und Status-Transitions laufen serverseitig. Bei fehlender Supabase-Konfiguration wird eine Demo-Liste
            angezeigt.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
