import { BookingFlow } from "@/components/booking/booking-flow";
import { getMarketingContent } from "@/lib/marketing-content";

export default async function BuchenPage() {
  const marketing = await getMarketingContent();

  return (
    <div className="container space-y-10 py-12 md:py-16">
      <BookingFlow content={marketing} />
    </div>
  );
}
