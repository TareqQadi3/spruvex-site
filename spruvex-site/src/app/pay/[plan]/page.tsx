import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Landmark, Copy, BadgePercent } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { BankTransferForm } from "@/components/forms/BankTransferForm";
import { getCsrfTokenForForm } from "@/lib/csrf";
import {
  BANK_TRANSFER_INFO,
  BILLING_CYCLES,
  NATIONAL_DAY_PROMO,
  getPlan,
  priceForCycle,
  type BillingCycle,
  type PlanId,
} from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ plan: string }>;
}): Promise<Metadata> {
  const { plan: planId } = await params;
  const plan = getPlan(planId as PlanId);
  return { title: plan ? `إتمام الاشتراك — باقة ${plan.name}` : "إتمام الاشتراك" };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-black/5 py-3 last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <span dir="ltr" className="flex items-center gap-2 text-sm font-bold text-white">
        {value}
        <Copy size={14} className="text-white/30" />
      </span>
    </div>
  );
}

export default async function PayPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ plan: string }>;
  searchParams: Promise<{ cycle?: string }>;
}) {
  const { plan: planId } = await params;
  const { cycle: cycleParam } = await searchParams;

  const plan = getPlan(planId as PlanId);
  if (!plan) notFound();

  const cycle: BillingCycle = BILLING_CYCLES.some((c) => c.id === cycleParam)
    ? (cycleParam as BillingCycle)
    : "monthly";
  const cycleLabel = BILLING_CYCLES.find((c) => c.id === cycle)!.label;
  const amount = priceForCycle(plan, cycle);
  const csrfToken = await getCsrfTokenForForm();

  return (
    <section className="bg-[var(--color-bg)] py-20">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="إتمام الاشتراك"
          title={`باقة ${plan.name} — ${cycleLabel}`}
          description={`المبلغ المطلوب تحويله: ${amount.toLocaleString("ar-SA-u-nu-latn")} ريال سعودي`}
        />

        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <Reveal className="rounded-3xl bg-[var(--color-navy-950)] p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <Landmark className="text-[var(--color-accent-400)]" size={22} />
              <h3 className="text-lg font-extrabold text-white">بيانات التحويل البنكي</h3>
            </div>
            <div className="flex flex-col">
              <InfoRow label="البنك" value={BANK_TRANSFER_INFO.bankName} />
              <InfoRow label="اسم صاحب الحساب" value={BANK_TRANSFER_INFO.accountName} />
              <InfoRow label="رقم الحساب" value={BANK_TRANSFER_INFO.accountNumber} />
              <InfoRow label="آيبان (IBAN)" value={BANK_TRANSFER_INFO.iban} />
              <InfoRow label="المبلغ" value={`${amount.toLocaleString("ar-SA-u-nu-latn")} SAR`} />
            </div>
            <p className="mt-5 rounded-xl bg-white/5 p-4 text-xs leading-relaxed text-white/50">
              بعد إتمام التحويل، عبّئ النموذج المجاور برقم عملية التحويل أو صورة الإيصال. سيراجع
              فريقنا الطلب ويُفعّل اشتراكك خلال ساعات عمل.
            </p>
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--color-accent-500)]/10 p-4 text-xs leading-relaxed text-[var(--color-accent-400)]">
              <BadgePercent size={18} className="mt-0.5 shrink-0" />
              <span dir="ltr" className="font-bold">
                {NATIONAL_DAY_PROMO.code}
              </span>
              <span className="text-white/60">
                — أدخله بالنموذج المجاور لخصم إضافي {NATIONAL_DAY_PROMO.percentOff}% بمناسبة اليوم
                الوطني.
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <BankTransferForm csrfToken={csrfToken} planId={plan.id} billingCycle={cycle} baseAmount={amount} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
