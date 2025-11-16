import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeAdminAnalytics } from "@/lib/admin-analytics";
import { getAdminSnapshot } from "@/lib/admin-data";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency }).format(value / 100);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default async function AdminAnalyticsPage() {
  const snapshot = await getAdminSnapshot();
  const analytics = computeAdminAnalytics(snapshot);
  const currency = snapshot.orders[0]?.currency ?? snapshot.services[0]?.currency ?? "CHF";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Phase 7</p>
          <h1 className="font-display text-3xl text-foreground">Analytics & Metriken</h1>
          <p className="text-muted-foreground">
            Umsatz, Wiederbuchung und Einwilligungen als Steuerungsgrössen. Datenquelle: {snapshot.source}.
          </p>
        </div>
        <Badge className="bg-brand text-brand-foreground">Monitoring</Badge>
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
            <CardDescription>Umsatz (30 Tage)</CardDescription>
            <CardTitle className="text-3xl">{formatMoney(analytics.revenue30d, currency)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Durchschnittlicher Warenkorb: {formatMoney(analytics.averageOrderValue, currency)}.
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardDescription>Wiederbuchungen</CardDescription>
            <CardTitle className="text-3xl">{formatPercent(analytics.repeatCustomerRate)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {analytics.rebookingCustomers} Kund:innen mit mehr als einem Besuch.
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardDescription>Marketing-Einwilligungen</CardDescription>
            <CardTitle className="text-3xl">{formatPercent(analytics.marketingConsentRate)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Basis: {snapshot.customers.length} Kund:innen im System.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle>Aktivität</CardTitle>
              <CardDescription className="text-muted-foreground">
                Nächste Termine und Lagerwarnungen.
              </CardDescription>
            </div>
            <Badge variant="outline">Live</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-white/80 px-3 py-2">
              <span>Kommende Termine</span>
              <span className="font-semibold text-foreground">{analytics.upcomingAppointments}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-white/80 px-3 py-2">
              <span>Produkte unter Schwelle (≤3)</span>
              <span className="font-semibold text-foreground">{analytics.lowStockItems}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Letzte Bestellungen</CardTitle>
              <CardDescription className="text-muted-foreground">Status-Mix der letzten 5 Orders.</CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {snapshot.source === "supabase" ? "live" : "demo"}
            </Badge>
          </CardHeader>
          <CardContent>
            {snapshot.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Bestellungen vorhanden.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Datum</th>
                      <th className="px-3 py-2">Total</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-t border-border/60">
                        <td className="px-3 py-2 font-mono text-xs">{order.id.slice(0, 8)}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {new Intl.DateTimeFormat("de-CH", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          }).format(new Date(order.createdAt))}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatMoney(order.totalCents, order.currency)}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={order.status === "paid" || order.status === "fulfilled" ? "default" : "outline"}>
                            {order.status}
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
