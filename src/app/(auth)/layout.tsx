import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-muted/30">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
