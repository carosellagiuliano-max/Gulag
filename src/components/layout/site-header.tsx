import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/leistungen", label: "Leistungen" },
  { href: "/galerie", label: "Galerie" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/shop", label: "Shop" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Bestellungen" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground shadow-soft">
            SW
          </div>
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Schnittwerk</p>
            <p className="font-display text-lg text-foreground">by Vanessa Carosella</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-muted-foreground lg:block">Rorschacherstrasse 152 · 9000 St. Gallen</p>
          <Button asChild className="shadow-soft bg-brand text-brand-foreground hover:bg-brand/90">
            <Link href="/buchen">Termin buchen</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border/70 text-foreground shadow-none md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Navigation öffnen</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xs">
              <SheetHeader>
                <SheetTitle>Menü</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4 text-sm font-medium text-muted-foreground">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
                <Link href="/buchen" className="hover:text-foreground">
                  Termin buchen
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
