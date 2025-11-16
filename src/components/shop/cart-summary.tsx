"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShoppingCart, Trash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatMoneyLabel } from "@/lib/shop";
import { useCart } from "@/components/shop/cart-context";
import { startCheckout } from "@/app/(marketing)/shop/actions";
import { DEFAULT_SALON_ID } from "@/lib/constants";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export function CartSummary() {
  const { items, updateQuantity, removeItem, totalCents, currency, clear } = useCart();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;

    supabase
      .from("customers")
      .select("id")
      .eq("salon_id", DEFAULT_SALON_ID)
      .maybeSingle()
      .then(({ data }) => setCustomerId(data?.id ?? null))
      .catch(() => setCustomerId(null));
  }, []);

  const checkoutDisabled = useMemo(() => items.length === 0 || !email, [items.length, email]);

  async function handleCheckout() {
    try {
      setLoading(true);
      const response = await startCheckout(
        items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        email,
        customerId
      );

      if (response?.error) {
        toast({ title: "Checkout fehlgeschlagen", description: response.error, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (response?.url) {
        clear();
        window.location.href = response.url;
      } else {
        toast({ title: "Checkout URL fehlt", description: "Bitte versuche es erneut.", variant: "destructive" });
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      toast({ title: "Checkout fehlgeschlagen", description: message, variant: "destructive" });
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white/80 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <ShoppingCart className="h-5 w-5" />
          Warenkorb
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Pflegeprodukte, die perfekt zu unseren Salonservices passen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Füge Produkte hinzu, um den Checkout zu starten.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-start justify-between rounded-lg border border-border/70 p-3">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">Menge</label>
                    <Input
                      type="number"
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
                      className="h-8 w-20"
                    />
                    <Badge variant="secondary">{formatMoneyLabel(item.product.priceCents, item.product.currency)}</Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-semibold text-foreground">
                    {formatMoneyLabel(item.product.priceCents * item.quantity, item.product.currency)}
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.product.id)}>
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="checkout-email" className="text-sm font-medium text-foreground">
            E-Mail für die Bestätigung
          </label>
          <Input
            id="checkout-email"
            type="email"
            placeholder="du@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Zwischensumme</div>
          <div className="text-lg font-semibold text-foreground">{formatMoneyLabel(totalCents, currency)}</div>
        </div>

        <Button
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          disabled={checkoutDisabled || loading}
          onClick={handleCheckout}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />} Checkout
          starten
        </Button>
      </CardContent>
    </Card>
  );
}
