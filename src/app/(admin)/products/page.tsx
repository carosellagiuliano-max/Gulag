import { PackageSearch, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSnapshot } from "@/lib/admin-data";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency }).format(value / 100);
}

export default async function ProductsPage() {
  const snapshot = await getAdminSnapshot();
  const lowStock = snapshot.products.filter((product) => product.stock <= 5 && product.active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Phase 6</p>
          <h1 className="font-display text-3xl text-foreground">Produkte & Lager</h1>
          <p className="text-muted-foreground">
            Shop-Bestand, Preise und Aktiv-Status. Checkout nutzt Service Role; hier read-only Übersicht.
          </p>
        </div>
        <Badge className="bg-brand text-brand-foreground">Priorität 4</Badge>
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
              <PackageSearch className="h-5 w-5" /> Produktinventar
            </CardTitle>
            <CardDescription className="text-muted-foreground">Stock, Preise, SKU und Aktivierung.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            {snapshot.products.length} Produkte
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {snapshot.products.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Produkte gepflegt.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Produkt</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Preis</th>
                    <th className="px-3 py-2">Bestand</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.products.map((product) => (
                    <tr key={product.id} className="border-t border-border/60">
                      <td className="px-3 py-2 font-medium text-foreground">{product.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{product.sku ?? "–"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{formatMoney(product.priceCents, product.currency)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{product.stock}</td>
                      <td className="px-3 py-2">
                        <Badge className={product.active ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"}>
                          {product.active ? "aktiv" : "inaktiv"}
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-amber-600" /> Niedrige Bestände
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Signalisiert Artikel, die bald nachbestellt werden müssen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Artikel unter Schwellenwert.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {lowStock.map((product) => (
                <div key={product.id} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU {product.sku ?? "–"}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-900">{product.stock} auf Lager</Badge>
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
