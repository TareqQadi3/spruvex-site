import type { Metadata } from "next";
import { Mail, Globe, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TrialForm } from "@/components/forms/TrialForm";
import { getCsrfTokenForForm } from "@/lib/csrf";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "تواصل معنا / ابدأ تجربة مجانية",
  description: "تواصل مع فريق SpruVex R أو ابدأ تجربتك المجانية لمدة 14 يومًا الآن.",
};

export default async function ContactPage() {
  const csrfToken = await getCsrfTokenForForm();

  return (
    <section className="bg-[var(--color-bg)] py-20">
      <Container className="mx-auto flex max-w-xl flex-col gap-14">
        <SectionHeading
          eyebrow="ابدأ الآن"
          title="جاهز تجرّب SpruVex R؟"
          description="عبّئ بياناتك وابدأ تجربتك المجانية مباشرة."
        />

        <Reveal>
          <TrialForm csrfToken={csrfToken} />
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4">
            <Mail size={20} className="text-[var(--color-accent-600)]" />
            <span dir="ltr" className="text-sm font-bold text-[var(--color-navy-900)]">
              hello@{BRAND.domain}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4">
            <Globe size={20} className="text-[var(--color-accent-600)]" />
            <span dir="ltr" className="text-sm font-bold text-[var(--color-navy-900)]">
              {BRAND.domain}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4">
            <Clock size={20} className="text-[var(--color-accent-600)]" />
            <span className="text-sm font-bold text-[var(--color-navy-900)]">
              نرد على الطلبات خلال ساعات عمل يوم العمل
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
