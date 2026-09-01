import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PLANS } from "@/lib/constants";

export function PricingTeaser() {
  return (
    <section className="bg-white py-24">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="باقات مرنة"
          title="باقة تناسب حجم مطعمك الآن"
          description="ابدأ بأي باقة وترقّى وقتما تحتاج — بدون التزام طويل، وبدون رسوم مفاجئة."
        />

        <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Reveal key={plan.id}>
              <PricingCard plan={plan} cycle="monthly" compact />
            </Reveal>
          ))}
        </RevealGroup>

        <Reveal className="flex justify-center">
          <ButtonLink href="/pricing" variant="outline" size="lg">
            شاهد كل الباقات والإضافات بالتفصيل
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
