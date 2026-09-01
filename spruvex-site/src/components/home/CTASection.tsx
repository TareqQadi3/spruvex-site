import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TRIAL_DAYS } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-navy-950)] py-24">
      <div className="pointer-events-none absolute inset-0 bg-noise" />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <Reveal>
          <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            جاهز تدير مطعمك بذكاء؟
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-xl text-balance text-lg text-white/60">
            جرّب SpruVex R مجانًا لمدة {TRIAL_DAYS} يومًا — تفعيل سريع، بدون بطاقة ائتمان، وبدون
            التزام.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <ButtonLink href="/contact" size="lg">
            ابدأ تجربتك المجانية الآن
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
