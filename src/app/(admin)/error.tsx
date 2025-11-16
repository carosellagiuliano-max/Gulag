"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Admin route error", error);
  }, [error]);

  return (
    <div className="space-y-4 rounded-lg border border-destructive/40 bg-destructive/5 px-6 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-destructive">Fehler</p>
        <h1 className="font-display text-2xl text-foreground">Etwas ist schiefgelaufen</h1>
        <p className="text-muted-foreground">
          Bitte versuche es erneut. Bei wiederholten Fehlern den Service-Key und RLS-Policies prüfen.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Erneut laden</Button>
        <Button variant="outline" onClick={() => window.location.assign("/")}>Zur Startseite</Button>
      </div>
    </div>
  );
}
