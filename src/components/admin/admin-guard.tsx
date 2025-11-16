"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogIn, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const [status, setStatus] = useState<"checking" | "granted" | "denied" | "demo">(
    supabase ? "checking" : "demo"
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let active = true;

    const evaluate = async () => {
      const { data: sessionData } = await client.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        if (active) setStatus("denied");
        return;
      }

      setUserEmail(session.user.email ?? null);

      const { data: staff, error } = await client
        .from("staff")
        .select("role, display_name")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!active) return;

      if (error || !staff) {
        setStatus("denied");
        return;
      }

      const allowedRoles = ["owner", "admin", "stylist"];
      if (allowedRoles.includes(staff.role)) {
        setRole(staff.role);
        setStatus("granted");
      } else {
        setStatus("denied");
      }
    };

    void evaluate();

    const { data: subscription } = client.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) {
        setStatus("denied");
        setUserEmail(null);
        setRole(null);
        return;
      }

      setUserEmail(newSession.user.email ?? null);
      void evaluate();
    });

    return () => {
      active = false;
      subscription?.subscription.unsubscribe();
    };
  }, [supabase]);

  if (status === "checking") {
    return (
      <Card className="shadow-soft border-dashed">
        <CardHeader>
          <CardTitle>Prüfe Zugriff...</CardTitle>
          <CardDescription className="text-muted-foreground">
            Die RBAC-Zuordnung wird geladen.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "denied") {
    return (
      <Card className="shadow-soft border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <CardTitle>Kein Zugriff</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Bitte melde dich mit einem Admin- oder Staff-Konto an, das in Supabase der Rolle owner/admin/stylist zugeordnet ist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" /> Zum Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {status === "demo" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase ist nicht konfiguriert. Die Admin-Ansicht läuft im Demo-Modus ohne Schreibzugriff.
        </div>
      )}
      {status === "granted" && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-muted-foreground shadow-soft">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">RBAC aktiv</span>
            <span className="font-medium text-foreground">{userEmail ?? "Angemeldet"}</span>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-700">{role ?? "staff"}</span>
        </div>
      )}
      {children}
    </div>
  );
}
