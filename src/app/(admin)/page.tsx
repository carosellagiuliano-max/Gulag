import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default async function AdminHomePage() {
  const snapshot = await getAdminSnapshot();
  const activeServices = snapshot.services.filter((svc) => svc.active).length;
  const activeStaff = snapshot.staff.filter((member) => member.active).length;
  const upcoming = snapshot.appointments.filter((appt) => new Date(appt.startsAt) >= new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
        <h1 className="font-display text-3xl text-foreground">Übersicht</h1>
        <p className="text-muted-foreground">Phase 7 Übersicht mit Live-Daten, Warnungen und Schnellblick auf Termine.</p>
      </div>

      {snapshot.warnings.length > 0 && (
        <div className="space-y-2">
          {snapshot.warnings.map((warning) => (
            <div
              key={warning}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-soft"
            >
              {warning}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader>
            <CardDescription>Aktive Services</CardDescription>
            <CardTitle className="text-3xl">{activeServices}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Insgesamt {snapshot.services.length} Services in {new Set(snapshot.services.map((s) => s.category)).size} Kategorien.
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardDescription>Team</CardDescription>
            <CardTitle className="text-3xl">{activeStaff}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {snapshot.staff.length} Mitarbeitende, RBAC über Rollen owner/admin/stylist.
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardDescription>Kommende Termine</CardDescription>
            <CardTitle className="text-3xl">{upcoming.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Letzte Synchronisierung: {snapshot.source === "supabase" ? "live" : "Demo"}.
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Heute & Nächste Termine</CardTitle>
            <CardDescription className="text-muted-foreground">Kalender-Peek über Service, Kunde und Status.</CardDescription>
          </div>
          <Badge className="bg-brand text-brand-foreground">Kalender</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine anstehenden Termine.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 6).map((appt) => (
                <div
                  key={appt.id}
                  className="flex flex-col gap-1 rounded-lg border border-border/70 bg-white/80 px-3 py-2 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{appt.serviceName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appt.customerName ? `${appt.customerName} · ` : ""}
                      {appt.staffName ?? "Team"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{formatDate(appt.startsAt)}</span>
                    <Badge variant="outline" className="capitalize">
                      {appt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
