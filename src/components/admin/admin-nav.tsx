"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Cog, Home, LineChart, Package2, Settings2, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Übersicht", icon: Home },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/admin/services", label: "Services & Team", icon: Settings2 },
  { href: "/admin/appointments", label: "Kalender", icon: CalendarDays },
  { href: "/admin/customers", label: "Kunden", icon: Users },
  { href: "/admin/products", label: "Produkte", icon: Package2 },
  { href: "/admin/settings", label: "Einstellungen", icon: Cog },
  { href: "/admin/notifications", label: "Benachrichtigungen", icon: Bell },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition",
              isActive
                ? "border-brand/70 bg-brand text-brand-foreground shadow-soft"
                : "border-border/60 bg-white text-foreground hover:border-brand/50 hover:bg-brand/5"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
        RBAC: Owner/Admin/Stylist können auf das Portal zugreifen. Andere Rollen werden blockiert.
      </div>
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
        Schreibaktionen erfordern die Supabase Service Role (serverseitig). Ohne Key läuft das Portal read-only im Demo-Modus.
      </div>
    </nav>
  );
}
