"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, LogIn, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/marketing-content";
import { useToast } from "@/components/ui/use-toast";

const orderStatusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  requires_payment: "bg-amber-100 text-amber-900",
  paid: "bg-emerald-100 text-emerald-900",
  fulfilled: "bg-emerald-200 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
  failed: "bg-rose-100 text-rose-900",
};

type OrderItem = {
  name: string;
  quantity: number;
  subtotal_cents: number;
};

type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  order_items: OrderItem[];
};

type Order = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: Date;
  items: OrderItem[];
};

export default function OrdersPage() {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth
      .getSession()
      .then(({ data }) => setUserId(data.session?.user?.id ?? null))
      .catch(() => setUserId(null));

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUserId(session?.user?.id ?? null);
      }
      if (event === "SIGNED_OUT") {
        setUserId(null);
        setOrders([]);
        setLoading(false);
      }
    });

    return () => subscription?.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    let active = true;
    if (!supabase || !userId) return undefined;

    const loadOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_cents, currency, created_at, order_items(name, quantity, subtotal_cents)")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error(error);
        toast({ title: "Bestellungen konnten nicht geladen werden", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      const mapped: Order[] = (data as OrderRow[]).map((order) => ({
        id: order.id,
        status: order.status,
        totalCents: order.total_cents,
        currency: order.currency,
        createdAt: new Date(order.created_at),
        items: order.order_items ?? [],
      }));

      setOrders(mapped);
      setLoading(false);
    };

    void loadOrders();

    return () => {
      active = false;
    };
  }, [supabase, toast, userId]);

  if (!supabase) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Bestellungen</CardTitle>
          <CardDescription className="text-muted-foreground">
            Supabase ist nicht konfiguriert. Bitte setze die Environment-Variablen, um Bestellungen zu laden.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Bestellungen</CardTitle>
          <CardDescription className="text-muted-foreground">Melde dich an, um deine Bestellungen zu sehen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" /> Jetzt anmelden
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Kundenbereich</p>
          <h1 className="font-display text-3xl text-foreground">Bestellungen</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/shop">
            <ShoppingBag className="mr-2 h-4 w-4" /> Zurück zum Shop
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-white/80 p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Lädt Bestellungen...
        </div>
      ) : orders.length === 0 ? (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Keine Bestellungen</CardTitle>
            <CardDescription className="text-muted-foreground">Starte mit deinem ersten Einkauf.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link href="/shop">Zum Shop</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">#{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {new Intl.DateTimeFormat("de-CH", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(order.createdAt)}
                  </CardDescription>
                </div>
                <Badge className={orderStatusStyles[order.status] ?? "bg-slate-100 text-slate-900"}>{order.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p>Menge: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-foreground">{formatPrice(item.subtotal_cents, order.currency)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-3 text-foreground">
                  <p className="font-semibold">Summe</p>
                  <p className="font-semibold">{formatPrice(order.totalCents, order.currency)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
