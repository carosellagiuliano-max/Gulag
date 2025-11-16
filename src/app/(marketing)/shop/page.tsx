import { Badge } from "@/components/ui/badge";
import { CartProvider } from "@/components/shop/cart-context";
import { CartSummary } from "@/components/shop/cart-summary";
import { ProductGrid } from "@/components/shop/product-grid";
import { getProducts } from "@/lib/shop";

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="container space-y-10 py-12 md:py-16">
      <div className="space-y-3">
        <Badge className="bg-brand-muted text-brand">Shop</Badge>
        <h1 className="font-display text-4xl text-foreground">Produkte für Zuhause</h1>
        <p className="max-w-3xl text-muted-foreground">
          Salonkuratiertes Sortiment mit Stripe Test-Checkout. Lagerstände werden geprüft, bevor wir eine Bestellung annehmen.
        </p>
      </div>

      <CartProvider>
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Sortiment</p>
            <ProductGrid products={products} />
          </div>
          <CartSummary />
        </div>
      </CartProvider>
    </div>
  );
}
