"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(true);

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      toast({
        title: "Supabase nicht konfiguriert",
        description: "Setze NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email,
            marketing_consent: marketingConsent,
            preferred_language: "de",
          },
        },
      });

      setLoading(false);

      if (error) {
        toast({ title: "Registrierung fehlgeschlagen", description: error.message, variant: "destructive" });
        return;
      }

      toast({
        title: "Konto angelegt",
        description: "Du bist angemeldet und kannst Termine buchen.",
      });
      router.push("/buchen");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast({ title: "Login fehlgeschlagen", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Willkommen zurück", description: "Du bist eingeloggt." });
    router.push("/dashboard");
  }

  return (
    <Card className="shadow-soft border-border/60">
      <CardHeader>
        <CardTitle>{isRegister ? "Konto erstellen" : "Anmelden"}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {isRegister
            ? "Registriere dich, um Termine zu buchen und dein Dashboard zu nutzen."
            : "Melde dich mit deiner E-Mail und deinem Passwort an."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Voller Name</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Vor- und Nachname"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="du@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>
          {isRegister && (
            <label className="flex items-center gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(event) => setMarketingConsent(event.target.checked)}
                className="h-4 w-4 rounded border-border/70"
              />
              Marketing-Updates erhalten
            </label>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90" disabled={loading}>
            {loading ? "Sende..." : isRegister ? "Registrieren" : "Einloggen"}
          </Button>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-4 w-4" />
            Mit der Registrierung stimmst du zu, dass wir für Termin-Updates per E-Mail kontaktieren dürfen.
          </p>
          <p className="text-sm text-muted-foreground">
            {isRegister ? "Bereits Kunde?" : "Neu bei uns?"}
            <Button asChild variant="link" className="px-1 text-brand" size="sm">
              <a href={isRegister ? "/auth/login" : "/auth/register"}>
                {isRegister ? "Zum Login" : "Konto erstellen"}
              </a>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
