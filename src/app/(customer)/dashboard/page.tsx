"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Loader2, LogIn, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_SALON_ID } from "@/lib/constants";
import { formatPrice } from "@/lib/marketing-content";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/ui/use-toast";

type AppointmentRow = {
  id: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  price_cents: number | null;
  service: { name: string; duration_minutes: number } | null;
  staff: { display_name: string } | null;
};

type Appointment = {
  id: string;
  startsAt: Date;
  endsAt: Date | null;
  status: string;
  serviceName: string;
  staffName?: string;
  priceCents?: number | null;
};

const statusBadgeMap: Record<string, string> = {
  scheduled: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
  completed: "bg-slate-100 text-slate-900",
};

export default function DashboardPage() {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
        setAppointments([]);
        setLoading(false);
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let active = true;
    if (!supabase || !userId) {
      return undefined;
    }

    const loadAppointments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("id, starts_at, ends_at, status, price_cents, service:service_id(name, duration_minutes), staff:staff_id(display_name)")
        .eq("salon_id", DEFAULT_SALON_ID)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true });

      if (!active) return;

      if (error) {
        console.error(error);
        toast({ title: "Termine konnten nicht geladen werden", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      const mapped: Appointment[] = (data as AppointmentRow[]).map((row) => ({
        id: row.id,
        startsAt: new Date(row.starts_at),
        endsAt: row.ends_at ? new Date(row.ends_at) : null,
        status: row.status,
        serviceName: row.service?.name ?? "Service",
        staffName: row.staff?.display_name ?? undefined,
        priceCents: row.price_cents,
      }));

      setAppointments(mapped);
      setLoading(false);
    };

    void loadAppointments();

    return () => {
      active = false;
    };
  }, [supabase, toast, userId]);

  async function cancelAppointment(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast({ title: "Konnte Termin nicht stornieren", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Termin storniert" });
    setAppointments((prev) => prev.map((appt) => (appt.id === id ? { ...appt, status: "cancelled" } : appt)));
  }

  if (!supabase) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            Supabase ist nicht konfiguriert. Bitte setze die Environment-Variablen, um Termine zu laden.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Kundenbereich</CardTitle>
          <CardDescription className="text-muted-foreground">
            Melde dich an, um deine Termine zu sehen.
          </CardDescription>
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
          <h1 className="font-display text-3xl text-foreground">Deine Termine</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/buchen">
            <CalendarDays className="mr-2 h-4 w-4" /> Neuen Termin buchen
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-white/80 p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Lädt Termine...
        </div>
      ) : appointments.length === 0 ? (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Keine Termine geplant</CardTitle>
            <CardDescription className="text-muted-foreground">
              Buche jetzt deinen nächsten Service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link href="/buchen">Jetzt buchen</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((appt) => {
            const dateLabel = new Intl.DateTimeFormat("de-CH", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(appt.startsAt);

            return (
              <Card key={appt.id} className="shadow-soft border-border/60">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{appt.serviceName}</CardTitle>
                    <CardDescription className="text-muted-foreground">{dateLabel}</CardDescription>
                    {appt.staffName && <p className="text-sm text-muted-foreground">mit {appt.staffName}</p>}
                  </div>
                  <Badge className={`${statusBadgeMap[appt.status] ?? "bg-slate-100 text-slate-900"} capitalize`}>
                    {appt.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {appt.priceCents != null && <p>Preis: {formatPrice(appt.priceCents, "CHF")}</p>}
                  {appt.endsAt && (
                    <p>
                      Dauer: {Math.max(30, Math.round((appt.endsAt.getTime() - appt.startsAt.getTime()) / 60000))} Minuten
                    </p>
                  )}
                  {appt.status !== "cancelled" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelAppointment(appt.id)}
                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Stornieren
                      </Button>
                      {appt.status !== "confirmed" && (
                        <Badge className="bg-emerald-100 text-emerald-900">
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Wird bestätigt
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
