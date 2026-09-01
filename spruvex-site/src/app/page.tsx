import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { Features } from "@/components/home/Features";
import { AppTour } from "@/components/home/AppTour";
import { StatsCounter } from "@/components/home/StatsCounter";
import { NationalDayBanner } from "@/components/home/NationalDayBanner";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { CTASection } from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Features />
      <AppTour />
      <StatsCounter />
      <NationalDayBanner />
      <PricingTeaser />
      <CTASection />
    </>
  );
}
