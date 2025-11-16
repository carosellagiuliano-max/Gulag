import { Bell, Mail, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSnapshot } from "@/lib/admin-data";

const channelIcon = {
  email: Mail,
  sms: Smartphone,
  push: Bell,
};

export default async function NotificationsPage() {
  const snapshot = await getAdminSnapshot();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Phase 6</p>
          <h1 className="font-display text-3xl text-foreground">Benachrichtigungen</h1>
          <p className="text-muted-foreground">
            Templates für Bestätigungen, Erinnerungen und Follow-ups. Anpassung erfolgt serverseitig via Service Role.
          </p>
        </div>
        <Badge className="bg-brand text-brand-foreground">Priorität 6</Badge>
      </div>

      {snapshot.warnings.length > 0 && (
        <div className="space-y-2">
          {snapshot.warnings.map((warning) => (
            <div key={warning} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {warning}
            </div>
          ))}
        </div>
      )}

      <Card className="shadow-soft">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-5 w-5" /> Vorlagen
            </CardTitle>
            <CardDescription className="text-muted-foreground">Status: read-only, Anpassung via Server Action.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            {snapshot.templates.length} Templates
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {snapshot.templates.map((template) => {
            const Icon = channelIcon[template.channel];
            return (
              <div key={template.id} className="rounded-lg border border-border/60 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <p className="font-medium text-foreground">{template.name}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {template.channel}
                  </Badge>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{template.subject}</p>
                <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
                <p className="mt-3 text-xs text-slate-500">Aktualisiert {new Date(template.updatedAt).toLocaleDateString("de-CH")}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
