import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SCHNITTWERK by Vanessa Carosella | Modern Salon in St. Gallen",
  description:
    "Zeitlose Haarschnitte, Colorationen und Pflegeerlebnisse in St. Gallen – gestaltet von Vanessa Carosella und Team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground antialiased",
          inter.variable,
          playfair.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
