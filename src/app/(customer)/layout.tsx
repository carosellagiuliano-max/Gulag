import type { ReactNode } from "react";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-muted/20">
      <div className="container py-10">{children}</div>
    </div>
  );
}
