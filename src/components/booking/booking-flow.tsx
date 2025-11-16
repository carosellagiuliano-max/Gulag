"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, LogIn, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { DEFAULT_SALON_ID } from "@/lib/constants";
import { formatPrice } from "@/lib/marketing-content";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import type { MarketingContent, OpeningHour, Service, ServiceCategory } from "@/lib/marketing-content";

const fallbackStaff = [
  {
    id: "staff-vanessa",
    display_name: "Vanessa",
    role: "owner",
  },
  {
    id: "staff-lea",
    display_name: "Lea",
    role: "stylist",
  },
];

function sortByPosition(categories: ServiceCategory[]) {
  return [...categories].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

function makeDateLabel(date: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function makeTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type Slot = {
  start: Date;
  label: string;
};

type BookingFlowProps = {
  content: MarketingContent;
};

function createSlots(openingHours: OpeningHour[], service: Service | null, daysForward = 7): Slot[] {
  if (!service || !openingHours.length) return [];
  const slots: Slot[] = [];
  const now = new Date();
  const duration = (service.durationMinutes + (service.bufferMinutes ?? 0)) * 60000;

  for (let i = 0; i < daysForward; i += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    day.setHours(0, 0, 0, 0);
    const dow = day.getDay();
    const opening = openingHours.find((h) => h.dayOfWeek === (dow === 0 ? 7 : dow));
    if (!opening) continue;

    const [openHour, openMinute] = opening.opensAt.split(":").map(Number);
    const [closeHour, closeMinute] = opening.closesAt.split(":").map(Number);

    const openDate = new Date(day);
    openDate.setHours(openHour, openMinute, 0, 0);
    const closeDate = new Date(day);
    closeDate.setHours(closeHour, closeMinute, 0, 0);

    let current = new Date(openDate);
    while (current.getTime() + duration <= closeDate.getTime()) {
      if (current > now) {
        slots.push({
          start: new Date(current),
          label: `${makeDateLabel(current)} · ${makeTimeLabel(current)}`,
        });
      }
      current = new Date(current.getTime() + 30 * 60000);
    }
  }

  return slots;
}

export function BookingFlow({ content }: BookingFlowProps) {
  const { toast } = useToast();
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const [sessionUser, setSessionUser] = useState<null | { id: string; email?: string | null }>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>(sortByPosition(content.serviceCategories));
  const [staff, setStaff] = useState(fallbackStaff);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(content.openingHours);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingState, setBookingState] = useState<"idle" | "success">("idle");

  useEffect(() => {
    if (!supabase) return;

    supabase.auth
      .getSession()
      .then(({ data }) => setSessionUser(data.session?.user ?? null))
      .catch(() => setSessionUser(null));

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSessionUser(session?.user ?? null);
      }
      if (event === "SIGNED_OUT") {
        setSessionUser(null);
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let active = true;
    if (!supabase) return undefined;

    const loadDynamicData = async () => {
      const [{ data: categoriesData }, { data: servicesData }, { data: staffData }, { data: hoursData }] = await Promise.all([
        supabase
          .from("service_categories")
          .select("id, name, description, position")
          .eq("salon_id", DEFAULT_SALON_ID)
          .order("position", { ascending: true }),
        supabase
          .from("services")
          .select("id, name, description, duration_minutes, buffer_minutes, price_cents, currency, service_category_id")
          .eq("salon_id", DEFAULT_SALON_ID)
          .eq("active", true),
        supabase
          .from("staff")
          .select("id, display_name, role")
          .eq("salon_id", DEFAULT_SALON_ID)
          .eq("active", true),
        supabase
          .from("opening_hours")
          .select("day_of_week, opens_at, closes_at")
          .eq("salon_id", DEFAULT_SALON_ID)
          .order("day_of_week", { ascending: true }),
      ]);

      if (!active) return;

      if (categoriesData && servicesData) {
        const mapped = categoriesData.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          position: category.position ?? 0,
          services:
            servicesData
              ?.filter((service) => service.service_category_id === category.id)
              .map((service) => ({
                id: service.id,
                name: service.name,
                description: service.description,
                durationMinutes: service.duration_minutes,
                bufferMinutes: service.buffer_minutes ?? 0,
                priceCents: service.price_cents,
                currency: service.currency,
              })) ?? [],
        }));
        setCategories(sortByPosition(mapped));
      }

      if (staffData?.length) {
        setStaff(staffData);
      }

      if (hoursData?.length) {
        setOpeningHours(
          hoursData.map((hour) => ({
            dayOfWeek: hour.day_of_week,
            opensAt: hour.opens_at,
            closesAt: hour.closes_at,
          }))
        );
      }
    };

    loadDynamicData();

    return () => {
      active = false;
    };
  }, [supabase]);

  const slots = useMemo(() => createSlots(openingHours, selectedService), [openingHours, selectedService]);

  const selectedStaffRecord = staff.find((member) => member.id === selectedStaff);

  async function ensureCustomerId(userId: string, email?: string | null) {
    if (!supabase) return null;
    const { data: existingCustomer, error: existingError } = await supabase
      .from("customers")
      .select("id, full_name, email")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingCustomer?.id) return existingCustomer.id;
    if (existingError && existingError.code !== "PGRST116") {
      console.error(existingError);
    }

    const profileName = existingCustomer?.full_name ?? email ?? "Gast";
    const { data, error } = await supabase
      .from("customers")
      .upsert({
        salon_id: DEFAULT_SALON_ID,
        user_id: userId,
        full_name: profileName,
        email: email ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to upsert customer", error);
      return null;
    }

    return data?.id ?? null;
  }

  async function handleBook(slot: Slot) {
    if (!supabase) {
      toast({
        title: "Supabase nicht konfiguriert",
        description: "Setze NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY für die Buchung.",
        variant: "destructive",
      });
      return;
    }
    if (!sessionUser) {
      toast({
        title: "Bitte anmelden",
        description: "Für die Terminbuchung benötigst du ein Kundenkonto.",
        action: (
          <Link href="/auth/login" className="text-sm font-semibold text-brand underline">
            Anmelden
          </Link>
        ),
      });
      return;
    }

    if (!selectedService) return;

    setLoading(true);
    const customerId = await ensureCustomerId(sessionUser.id, sessionUser.email);
    if (!customerId) {
      toast({
        title: "Kunde konnte nicht angelegt werden",
        description: "Bitte versuche es erneut oder kontaktiere uns.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const endsAt = new Date(slot.start.getTime() + (selectedService.durationMinutes + (selectedService.bufferMinutes ?? 0)) * 60000);

    const { error } = await supabase.from("appointments").insert({
      salon_id: DEFAULT_SALON_ID,
      service_id: selectedService.id,
      staff_id: selectedStaff ?? null,
      customer_id: customerId,
      starts_at: slot.start.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "confirmed",
      price_cents: selectedService.priceCents,
    });

    setLoading(false);

    if (error) {
      console.error("Failed to book appointment", error);
      toast({
        title: "Termin konnte nicht gespeichert werden",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      });
      return;
    }

    setBookingState("success");
    toast({
      title: "Termin bestätigt",
      description: `${selectedService.name} am ${slot.label}`,
    });
  }

  const headline = bookingState === "success" ? "Termin gebucht" : "Starte deinen Termin";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge className="bg-brand-muted text-brand">Buchung</Badge>
        <h1 className="font-display text-4xl text-foreground">{headline}</h1>
        <p className="max-w-3xl text-muted-foreground">
          Wähle Service, Mitarbeiter und Slot. Die Buchung speichert einen bestätigten Termin in Supabase und verknüpft ihn mit
          deinem Kundenkonto.
        </p>
        {!supabase && (
          <p className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <Clock3 className="h-4 w-4" /> Supabase-Umgebungsvariablen fehlen – die Buchung ist nur mit gültigem Backend möglich.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">1. Service wählen</h2>
              <p className="text-sm text-muted-foreground">Pflicht</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => (
                <Card key={category.id} className="shadow-soft border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.description ? (
                      <CardDescription className="text-muted-foreground">{category.description}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.services.map((service) => {
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => {
                            setSelectedService(service);
                            setSelectedSlot(null);
                          }}
                          className={`w-full rounded-lg border px-3 py-3 text-left transition hover:border-brand hover:bg-brand-muted/40 ${
                            isSelected ? "border-brand bg-brand-muted/60" : "border-border/70"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{service.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {service.description ?? "Individuell abgestimmt, inklusive Beratung."}
                              </p>
                            </div>
                            <div className="text-right text-sm font-semibold text-brand">
                              {formatPrice(service.priceCents, service.currency)}
                              <p className="text-[11px] font-normal text-muted-foreground">{service.durationMinutes} Min.</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">2. Mitarbeiter</h2>
              <p className="text-sm text-muted-foreground">Optional</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className={`rounded-lg border px-3 py-3 text-left transition hover:border-brand hover:bg-brand-muted/40 ${
                  selectedStaff === null ? "border-brand bg-brand-muted/60" : "border-border/70"
                }`}
              >
                <p className="font-medium text-foreground">Keine Präferenz</p>
                <p className="text-sm text-muted-foreground">Wir wählen den passenden Profi für dich.</p>
              </button>
              {staff.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedStaff(member.id)}
                  className={`rounded-lg border px-3 py-3 text-left transition hover:border-brand hover:bg-brand-muted/40 ${
                    selectedStaff === member.id ? "border-brand bg-brand-muted/60" : "border-border/70"
                  }`}
                >
                  <p className="font-medium text-foreground">{member.display_name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">3. Slot wählen</h2>
              <p className="text-sm text-muted-foreground">7 Tage Vorschau</p>
            </div>
            {selectedService ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.label === slot.label;
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border px-3 py-3 text-left transition hover:border-brand hover:bg-brand-muted/40 ${
                        isSelected ? "border-brand bg-brand-muted/60" : "border-border/70"
                      }`}
                    >
                      <p className="font-medium text-foreground">{slot.label}</p>
                      <p className="text-sm text-muted-foreground">{selectedStaffRecord?.display_name ?? "Passender Staff"}</p>
                    </button>
                  );
                })}
                {!slots.length && (
                  <Card className="sm:col-span-2 lg:col-span-3 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg">Keine Slots gefunden</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Prüfe die Öffnungszeiten in Supabase oder passe die Slotgenerierung an.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Bitte zuerst einen Service wählen.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4 rounded-2xl border border-border/60 bg-white/70 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand">
            <Timer className="h-4 w-4" /> Zusammenfassung
          </div>
          {selectedService ? (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-medium">{selectedService.name}</p>
              <p className="text-sm text-muted-foreground">{selectedService.durationMinutes} Minuten</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Wähle einen Service, um fortzufahren.</p>
          )}
          {selectedStaffRecord && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Mitarbeiter</p>
              <p className="font-medium">{selectedStaffRecord.display_name}</p>
            </div>
          )}
          {selectedSlot && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Termin</p>
              <p className="font-medium">{selectedSlot.label}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Preis</p>
            <p className="font-semibold text-brand">
              {selectedService ? formatPrice(selectedService.priceCents, selectedService.currency) : "-"}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={!selectedService || !selectedSlot || loading}
              onClick={() => {
                if (selectedSlot) {
                  void handleBook(selectedSlot);
                }
              }}
            >
              {loading ? "Speichere..." : "Termin bestätigen"}
            </Button>
            {!sessionUser && (
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-brand"
              >
                <LogIn className="h-4 w-4" /> Neu? Konto erstellen
              </Link>
            )}
            {bookingState === "success" && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                <span>Termin gesichert. Sieh deine Buchungen im Dashboard.</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
