import { DEFAULT_SALON_ID } from "@/lib/constants";
import { getServiceSupabaseClient } from "@/lib/supabase-admin";

export type AdminService = {
  id: string;
  name: string;
  category?: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  active: boolean;
};

export type AdminStaff = {
  id: string;
  name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  active: boolean;
};

export type AdminAppointment = {
  id: string;
  startsAt: string;
  status: string;
  serviceName: string;
  servicePriceCents?: number;
  serviceCurrency?: string;
  customerId?: string;
  customerName?: string;
  staffName?: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  marketingConsent: boolean;
  createdAt: string;
  lastVisit?: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  sku?: string | null;
  stock: number;
  priceCents: number;
  currency: string;
  active: boolean;
};

export type AdminOpeningHour = {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
};

export type AdminSettings = {
  timezone: string;
  vatRate: number;
  cancellationHours: number;
  contactEmail?: string | null;
};

export type AdminOrder = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  customerId?: string | null;
};

export type NotificationTemplate = {
  id: string;
  channel: "email" | "sms" | "push";
  name: string;
  subject: string;
  description: string;
  updatedAt: string;
};

export type AdminSnapshot = {
  source: "supabase" | "demo";
  warnings: string[];
  services: AdminService[];
  staff: AdminStaff[];
  appointments: AdminAppointment[];
  customers: AdminCustomer[];
  products: AdminProduct[];
  orders: AdminOrder[];
  openingHours: AdminOpeningHour[];
  settings: AdminSettings;
  templates: NotificationTemplate[];
};

const demoSnapshot: AdminSnapshot = {
  source: "demo",
  warnings: [
    "Supabase Service Key nicht gesetzt – zeige Demo-Daten für die Admin-Ansicht.",
  ],
  services: [
    {
      id: "svc-cut",
      name: "Signature Cut",
      category: "Haircuts",
      durationMinutes: 45,
      priceCents: 12000,
      currency: "CHF",
      active: true,
    },
    {
      id: "svc-color",
      name: "Balayage & Gloss",
      category: "Color",
      durationMinutes: 120,
      priceCents: 26000,
      currency: "CHF",
      active: true,
    },
    {
      id: "svc-style",
      name: "Blowout",
      category: "Styling",
      durationMinutes: 40,
      priceCents: 8000,
      currency: "CHF",
      active: false,
    },
  ],
  staff: [
    {
      id: "stf-vanessa",
      name: "Vanessa Carosella",
      role: "owner",
      email: "vanessa@schnittwerk.example",
      phone: "+41 71 000 00 01",
      active: true,
    },
    {
      id: "stf-lea",
      name: "Lea Keller",
      role: "stylist",
      email: "lea@schnittwerk.example",
      phone: "+41 71 000 00 02",
      active: true,
    },
    {
      id: "stf-sam",
      name: "Sam Schmid",
      role: "assistant",
      email: "sam@schnittwerk.example",
      phone: null,
      active: false,
    },
  ],
  appointments: [
    {
      id: "appt-1",
      startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: "confirmed",
      serviceName: "Signature Cut",
      servicePriceCents: 12000,
      serviceCurrency: "CHF",
      customerName: "Julia Frei",
      staffName: "Vanessa Carosella",
    },
    {
      id: "appt-2",
      startsAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
      serviceName: "Balayage & Gloss",
      servicePriceCents: 26000,
      serviceCurrency: "CHF",
      customerName: "Laura Benz",
      staffName: "Lea Keller",
    },
    {
      id: "appt-3",
      startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      serviceName: "Blowout",
      servicePriceCents: 8000,
      serviceCurrency: "CHF",
      customerName: "Mara Lüthi",
      staffName: "Sam Schmid",
    },
  ],
  customers: [
    {
      id: "cust-1",
      name: "Julia Frei",
      email: "julia.frei@example.com",
      phone: "+41 76 000 00 11",
      marketingConsent: true,
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "cust-2",
      name: "Laura Benz",
      email: "laura.benz@example.com",
      phone: "+41 79 000 00 22",
      marketingConsent: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      lastVisit: null,
    },
    {
      id: "cust-3",
      name: "Mara Lüthi",
      email: "mara.luethi@example.com",
      phone: null,
      marketingConsent: true,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastVisit: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  products: [
    {
      id: "prd-1",
      name: "Hydrate Shampoo",
      sku: "SW-HY-01",
      stock: 18,
      priceCents: 3200,
      currency: "CHF",
      active: true,
    },
    {
      id: "prd-2",
      name: "Glossing Serum",
      sku: "SW-GL-01",
      stock: 4,
      priceCents: 4500,
      currency: "CHF",
      active: true,
    },
    {
      id: "prd-3",
      name: "Curl Cream",
      sku: "SW-CC-01",
      stock: 0,
      priceCents: 3600,
      currency: "CHF",
      active: false,
    },
  ],
  orders: [
    {
      id: "ord-1",
      status: "paid",
      totalCents: 18500,
      currency: "CHF",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      customerId: "cust-1",
    },
    {
      id: "ord-2",
      status: "fulfilled",
      totalCents: 9200,
      currency: "CHF",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      customerId: "cust-2",
    },
    {
      id: "ord-3",
      status: "pending",
      totalCents: 3600,
      currency: "CHF",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      customerId: "cust-3",
    },
  ],
  openingHours: [
    { dayOfWeek: 0, opensAt: "10:00", closesAt: "18:00" },
    { dayOfWeek: 1, opensAt: "09:00", closesAt: "19:00" },
    { dayOfWeek: 2, opensAt: "09:00", closesAt: "19:00" },
    { dayOfWeek: 3, opensAt: "09:00", closesAt: "19:00" },
    { dayOfWeek: 4, opensAt: "09:00", closesAt: "20:00" },
    { dayOfWeek: 5, opensAt: "09:00", closesAt: "16:00" },
    { dayOfWeek: 6, opensAt: "geschlossen", closesAt: "geschlossen" },
  ],
  settings: {
    timezone: "Europe/Zurich",
    vatRate: 7.7,
    cancellationHours: 24,
    contactEmail: "hello@schnittwerk-salon.ch",
  },
  templates: [
    {
      id: "tmpl-confirm",
      channel: "email",
      name: "Terminbestätigung",
      subject: "Dein Termin bei SCHNITTWERK",
      description: "Sendet sofort nach Buchung eine Bestätigung mit Datum/Uhrzeit und Storno-Link.",
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tmpl-reminder",
      channel: "sms",
      name: "Erinnerung 24h",
      subject: "Termin-Erinnerung",
      description: "Kurze SMS-Erinnerung 24h vor Terminbeginn.",
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tmpl-followup",
      channel: "email",
      name: "Follow-up & Pflege",
      subject: "Danke für deinen Besuch",
      description: "Empfehlungen für Pflegeprodukte mit Link zum Shop.",
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return demoSnapshot;
  }

  const warnings: string[] = [];

  const [
    servicesResult,
    staffResult,
    appointmentsResult,
    customersResult,
    productsResult,
    ordersResult,
    openingHoursResult,
    salonResult,
  ] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents, currency, active, service_categories(name)")
      .eq("salon_id", DEFAULT_SALON_ID)
      .order("created_at", { ascending: true }),
    supabase
      .from("staff")
      .select("id, display_name, role, email, phone, active")
      .eq("salon_id", DEFAULT_SALON_ID)
      .order("created_at", { ascending: true }),
    supabase
      .from("appointments")
      .select(
        "id, starts_at, status, service:service_id(name, price_cents, currency), customer:customer_id(id, full_name), staff:staff_id(display_name)"
      )
      .eq("salon_id", DEFAULT_SALON_ID)
      .order("starts_at", { ascending: false })
      .limit(24),
    supabase
      .from("customers")
      .select("id, full_name, email, phone, marketing_consent, created_at")
      .eq("salon_id", DEFAULT_SALON_ID)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("products")
      .select("id, name, sku, stock, price_cents, currency, active")
      .eq("salon_id", DEFAULT_SALON_ID)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("orders")
      .select("id, status, total_cents, currency, created_at, customer_id")
      .eq("salon_id", DEFAULT_SALON_ID)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("opening_hours")
      .select("day_of_week, opens_at, closes_at")
      .eq("salon_id", DEFAULT_SALON_ID)
      .order("day_of_week", { ascending: true }),
    supabase.from("salons").select("timezone, email").eq("id", DEFAULT_SALON_ID).maybeSingle(),
  ]);

  const services = servicesResult.data
    ? servicesResult.data.map((svc) => ({
        id: svc.id,
        name: svc.name,
        category: svc.service_categories?.name ?? undefined,
        durationMinutes: svc.duration_minutes,
        priceCents: svc.price_cents ?? 0,
        currency: svc.currency ?? "CHF",
        active: svc.active,
      }))
    : demoSnapshot.services;

  if (servicesResult.error) {
    warnings.push("Services konnten nicht geladen werden – zeige Demo-Daten.");
  }

  const staff = staffResult.data
    ? staffResult.data.map((member) => ({
        id: member.id,
        name: member.display_name,
        role: member.role,
        email: member.email,
        phone: member.phone,
        active: member.active,
      }))
    : demoSnapshot.staff;

  if (staffResult.error) {
    warnings.push("Team-Daten konnten nicht geladen werden – zeige Demo-Daten.");
  }

  const appointments = appointmentsResult.data
    ? appointmentsResult.data.map((appt) => ({
        id: appt.id,
        startsAt: appt.starts_at,
        status: appt.status,
        serviceName: appt.service?.name ?? "Service",
        servicePriceCents: appt.service?.price_cents ?? undefined,
        serviceCurrency: appt.service?.currency ?? "CHF",
        customerId: appt.customer?.id ?? undefined,
        customerName: appt.customer?.full_name ?? undefined,
        staffName: appt.staff?.display_name ?? undefined,
      }))
    : demoSnapshot.appointments;

  if (appointmentsResult.error) {
    warnings.push("Termine konnten nicht geladen werden – zeige Demo-Daten.");
  }

  const lastVisitByCustomer = new Map<string, string>();
  if (appointmentsResult.data) {
    appointments.forEach((appt) => {
      if (!appt.customerId) return;
      const existing = lastVisitByCustomer.get(appt.customerId);
      if (!existing || new Date(appt.startsAt) > new Date(existing)) {
        lastVisitByCustomer.set(appt.customerId, appt.startsAt);
      }
    });
  }

  const customers = customersResult.data
    ? customersResult.data.map((customer) => ({
        id: customer.id,
        name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        marketingConsent: customer.marketing_consent,
        createdAt: customer.created_at,
        lastVisit: lastVisitByCustomer.get(customer.id) ?? undefined,
      }))
    : demoSnapshot.customers;

  if (customersResult.error) {
    warnings.push("Kundendaten konnten nicht geladen werden – zeige Demo-Daten.");
  }

  const products = productsResult.data
    ? productsResult.data.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stock ?? 0,
        priceCents: product.price_cents ?? 0,
        currency: product.currency ?? "CHF",
        active: product.active,
      }))
    : demoSnapshot.products;

  if (productsResult.error) {
    warnings.push("Produkte konnten nicht geladen werden – zeige Demo-Daten.");
  }

  const orders = ordersResult.data
    ? ordersResult.data.map((order) => ({
        id: order.id,
        status: order.status,
        totalCents: order.total_cents ?? 0,
        currency: order.currency ?? "CHF",
        createdAt: order.created_at,
        customerId: order.customer_id,
      }))
    : demoSnapshot.orders;

  if (ordersResult.error) {
    warnings.push("Bestellungen konnten nicht geladen werden – zeige Demo-Daten.");
  }

  const openingHours = openingHoursResult.data
    ? openingHoursResult.data.map((entry) => ({
        dayOfWeek: entry.day_of_week,
        opensAt: entry.opens_at,
        closesAt: entry.closes_at,
      }))
    : demoSnapshot.openingHours;

  if (openingHoursResult.error) {
    warnings.push("Öffnungszeiten konnten nicht geladen werden – zeige Demo-Daten.");
  }

  const settings: AdminSettings = {
    timezone: salonResult.data?.timezone ?? demoSnapshot.settings.timezone,
    vatRate: demoSnapshot.settings.vatRate,
    cancellationHours: demoSnapshot.settings.cancellationHours,
    contactEmail: salonResult.data?.email ?? demoSnapshot.settings.contactEmail,
  };

  if (salonResult.error) {
    warnings.push("Salon-Settings konnten nicht geladen werden – zeige Demo-Daten.");
  }

  return {
    source: "supabase",
    warnings,
    services,
    staff,
    appointments,
    customers,
    products,
    orders,
    openingHours,
    settings,
    templates: demoSnapshot.templates,
  };
}
