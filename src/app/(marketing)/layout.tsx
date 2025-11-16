import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getMarketingContent } from "@/lib/marketing-content";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const marketing = await getMarketingContent();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-muted/40 via-white to-white text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter contact={marketing.contact} />
    </div>
  );
}
