import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-border/60 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
              <h1 className="font-display text-2xl text-foreground">SCHNITTWERK Backoffice</h1>
            </div>
            <div className="rounded-full border border-brand/50 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              Phase 6 · Admin-Portal
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[240px,1fr]">
          <aside className="h-fit space-y-4 rounded-xl border border-border/60 bg-white p-4 shadow-soft">
            <AdminNav />
          </aside>
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
