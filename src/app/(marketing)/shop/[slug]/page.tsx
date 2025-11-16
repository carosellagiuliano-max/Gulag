import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CartProvider } from "@/components/shop/cart-context";
import { ProductDetail } from "@/components/shop/product-detail";
import { getProductBySlug } from "@/lib/shop";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container space-y-8 py-12 md:py-16">
      <Button asChild variant="ghost" className="px-0 text-muted-foreground hover:text-foreground">
        <Link href="/shop">
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zum Shop
        </Link>
      </Button>

      <div className="space-y-2">
        <Badge className="bg-brand-muted text-brand">Produkt</Badge>
        <h1 className="font-display text-4xl text-foreground">{product.name}</h1>
        <p className="text-muted-foreground">Salonkuratiertes Sortiment, bereit für den Stripe Test-Checkout.</p>
      </div>

      <CartProvider>
        <ProductDetail product={product} />
      </CartProvider>
    </div>
  );
}
