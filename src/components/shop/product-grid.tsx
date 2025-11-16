"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoneyLabel, type Product } from "@/lib/shop";
import { useCart } from "@/components/shop/cart-context";

export function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="bg-white/80 shadow-soft">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
              {product.featured && <Badge className="bg-brand-muted text-brand">Salon Empfehlung</Badge>}
              {product.stock <= 3 && <Badge variant="outline">Begrenzt</Badge>}
            </div>
            <CardTitle className="font-display text-xl text-foreground">
              <Link href={`/shop/${product.slug}`} className="hover:underline">
                {product.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-muted-foreground">{product.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video overflow-hidden rounded-md bg-gradient-to-br from-brand-muted/30 to-white">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  Produktbild folgt
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{product.sku}</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatMoneyLabel(product.priceCents, product.currency)}
                </p>
              </div>
              <Button
                className="bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={() => addItem(product, 1)}
                disabled={product.stock <= 0}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {product.stock > 0 ? "In den Warenkorb" : "Ausverkauft"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
