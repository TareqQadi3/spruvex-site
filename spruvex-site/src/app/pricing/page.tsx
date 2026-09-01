import type { Metadata } from "next";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";

export const metadata: Metadata = {
  title: "الأسعار",
  description: "باقات SpruVex R: الأساسية، الاحترافية، والمتقدمة — بدورات شهرية أو 6 أشهر أو سنوية.",
};

export default function PricingPage() {
  return <PricingPageContent />;
}
