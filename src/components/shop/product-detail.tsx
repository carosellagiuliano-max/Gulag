"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/components/shop/cart-context";
import { formatMoneyLabel, type Product } from "@/lib/shop";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <Card className="bg-white/80 shadow-soft">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
          {product.featured && <Badge className="bg-brand-muted text-brand">Signature</Badge>}
          {product.stock <= 3 && <Badge variant="outline">Nur wenige verfügbar</Badge>}
        </div>
        <CardTitle className="font-display text-3xl text-foreground">{product.name}</CardTitle>
        <CardDescription className="text-muted-foreground">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-video overflow-hidden rounded-md bg-gradient-to-br from-brand-muted/30 to-white">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} width={800} height={600} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Bild folgt</div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{product.sku}</p>
            <p className="text-2xl font-semibold text-foreground">{formatMoneyLabel(product.priceCents, product.currency)}</p>
          </div>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => addItem(product, 1)}
            disabled={product.stock <= 0}
          >
            <ShoppingBag className="mr-2 h-5 w-5" /> {product.stock > 0 ? "In den Warenkorb" : "Ausverkauft"}
          </Button>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Pickup & Versand</p>
          <p>Abholung im Salon möglich; Versandoptionen folgen mit Stripe Test-Checkout.</p>
        </div>
      </CardContent>
    </Card>
  );
}
