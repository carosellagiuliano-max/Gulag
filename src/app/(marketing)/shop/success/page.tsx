import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShopSuccessPage({ searchParams }: { searchParams?: { orderId?: string } }) {
  return (
    <div className="container space-y-8 py-12 md:py-16">
      <Badge className="bg-emerald-100 text-emerald-900">Vielen Dank</Badge>
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-foreground">Bestellung eingegangen</h1>
        <p className="max-w-2xl text-muted-foreground">
          Wir haben deine Bestellung erhalten und prüfen die Zahlung über Stripe. Du erhältst gleich eine Bestätigung per E-Mail.
        </p>
        {searchParams?.orderId && (
          <p className="text-sm text-muted-foreground">Bestellnummer: {searchParams.orderId}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/shop">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Zurück zum Shop
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Zu meinen Terminen</Link>
        </Button>
      </div>
    </div>
  );
}
