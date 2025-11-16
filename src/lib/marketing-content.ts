import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

import { DEFAULT_SALON_ID, DEFAULT_TIMEZONE } from "@/lib/constants";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  bufferMinutes?: number;
  priceCents: number;
  currency: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  description: string | null;
  position: number;
  services: Service[];
};

export type OpeningHour = {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
};

export type SalonContact = {
  name: string;
  tagline: string;
  description: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  timezone: string;
};

export type MarketingContent = {
  contact: SalonContact;
  openingHours: OpeningHour[];
  serviceCategories: ServiceCategory[];
};

const fallbackContent: MarketingContent = {
  contact: {
    name: "SCHNITTWERK by Vanessa Carosella",
    tagline: "Modern hair artistry in St. Gallen",
    description: "Signature Haarschnitte, Colorationen und Pflege mit Boutique-Erlebnis.",
    streetAddress: "Rorschacherstrasse 152",
    postalCode: "9000",
    city: "St. Gallen",
    phone: "+41 71 000 00 00",
    email: "hello@schnittwerk-salon.ch",
    timezone: DEFAULT_TIMEZONE,
  },
  openingHours: [
    { dayOfWeek: 1, opensAt: "09:00", closesAt: "18:30" },
    { dayOfWeek: 2, opensAt: "09:00", closesAt: "18:30" },
    { dayOfWeek: 3, opensAt: "09:00", closesAt: "18:30" },
    { dayOfWeek: 4, opensAt: "09:00", closesAt: "18:30" },
    { dayOfWeek: 5, opensAt: "08:00", closesAt: "15:00" },
  ],
  serviceCategories: [
    {
      id: "haircuts",
      name: "Haircuts",
      description: "Signature Schnitte und Stylings",
      position: 1,
      services: [
        {
          id: "signature-cut",
          name: "Signature Haircut",
          description: "Beratung, Waschen, Schnitt & Styling",
          durationMinutes: 60,
          bufferMinutes: 0,
          priceCents: 12000,
          currency: "CHF",
        },
      ],
    },
    {
      id: "color",
      name: "Color",
      description: "Glanz und Farbe, die zu dir passt",
      position: 2,
      services: [
        {
          id: "color-refresh",
          name: "Color Refresh",
          description: "Ansatz auffrischen und Glanz veredeln",
          durationMinutes: 90,
          bufferMinutes: 0,
          priceCents: 18000,
          currency: "CHF",
        },
      ],
    },
  ],
};

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const getMarketingContent = cache(async (): Promise<MarketingContent> => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return fallbackContent;
  }

  try {
    const [{ data: salon }, { data: categories }, { data: services }, { data: hours }] = await Promise.all([
      supabase
        .from("salons")
        .select(
          "id, name, tagline, description, street_address, postal_code, city, phone, email, timezone"
        )
        .eq("id", DEFAULT_SALON_ID)
        .single(),
      supabase
        .from("service_categories")
        .select("id, name, description, position")
        .eq("salon_id", DEFAULT_SALON_ID)
        .order("position", { ascending: true }),
      supabase
        .from("services")
        .select("id, name, description, duration_minutes, price_cents, currency, service_category_id")
        .eq("salon_id", DEFAULT_SALON_ID)
        .eq("active", true)
        .order("name", { ascending: true }),
      supabase
        .from("opening_hours")
        .select("day_of_week, opens_at, closes_at")
        .eq("salon_id", DEFAULT_SALON_ID)
        .order("day_of_week", { ascending: true }),
    ]);

    const categoriesWithServices: ServiceCategory[] | undefined = categories?.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      position: category.position ?? 0,
      services:
        services
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

    const contact: SalonContact | undefined = salon
      ? {
          name: salon.name,
          tagline: salon.tagline ?? fallbackContent.contact.tagline,
          description: salon.description ?? fallbackContent.contact.description,
          streetAddress: salon.street_address ?? fallbackContent.contact.streetAddress,
          postalCode: salon.postal_code ?? fallbackContent.contact.postalCode,
          city: salon.city ?? fallbackContent.contact.city,
          phone: salon.phone ?? fallbackContent.contact.phone,
          email: salon.email ?? fallbackContent.contact.email,
          timezone: salon.timezone ?? fallbackContent.contact.timezone,
        }
      : undefined;

    const openingHours: OpeningHour[] | undefined = hours?.map((hour) => ({
      dayOfWeek: hour.day_of_week,
      opensAt: hour.opens_at,
      closesAt: hour.closes_at,
    }));

    if (!contact || !categoriesWithServices || categoriesWithServices.length === 0) {
      return fallbackContent;
    }

    return {
      contact,
      openingHours: openingHours?.length ? openingHours : fallbackContent.openingHours,
      serviceCategories: categoriesWithServices,
    };
  } catch (error) {
    console.error("Failed to load marketing content from Supabase", error);
    return fallbackContent;
  }
});

export function formatPrice(priceCents: number, currency: string) {
  try {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(priceCents / 100);
  } catch (error) {
    console.error("Failed to format price", error);
    return `${priceCents / 100} ${currency}`;
  }
}

export function weekdayLabel(dayOfWeek: number) {
  const labels = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  return labels[dayOfWeek] ?? `Tag ${dayOfWeek}`;
}
