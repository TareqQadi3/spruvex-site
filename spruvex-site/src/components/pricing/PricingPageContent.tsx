"use client";

import { useState } from "react";
import { Check, Minus, BadgePercent } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PricingCard } from "@/components/pricing/PricingCard";
import { ADDONS, FEATURE_ROWS, NATIONAL_DAY_PROMO, PLANS, type BillingCycle } from "@/lib/constants";

export function PricingPageContent() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <>
      <section className="bg-[var(--color-navy-950)] py-20">
        <Container className="flex flex-col items-center gap-10">
          <SectionHeading
            eyebrow="الأسعار"
            title="أسعار واضحة، بلا مفاجآت"
            description="اختر الباقة والدورة المناسبة لمطعمك — يمكنك الترقية أو التغيير في أي وقت."
            className="[&_h2]:text-white [&_p]:text-white/60"
          />
          <Reveal>
            <BillingToggle value={cycle} onChange={setCycle} />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/15">
              <BadgePercent size={16} className="text-[var(--color-accent-400)]" />
              استخدم الكود{" "}
              <span dir="ltr" className="text-[var(--color-accent-400)]">
                {NATIONAL_DAY_PROMO.code}
              </span>{" "}
              عند الدفع لخصم إضافي {NATIONAL_DAY_PROMO.percentOff}%
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-[var(--color-bg)] py-20">
        <Container className="flex flex-col gap-20">
          <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <Reveal key={plan.id}>
                <PricingCard plan={plan} cycle={cycle} />
              </Reveal>
            ))}
          </RevealGroup>

          <div className="flex flex-col gap-8">
            <SectionHeading title="مقارنة كاملة بين الباقات" align="start" />
            <Reveal className="overflow-x-auto rounded-3xl border border-black/5 bg-white">
              <table className="w-full min-w-[640px] text-start text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-[var(--color-muted)]">
                    <th className="p-4 font-bold">الميزة</th>
                    {PLANS.map((p) => (
                      <th key={p.id} className="p-4 text-center font-bold text-[var(--color-navy-900)]">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black/5">
                    <td className="p-4 font-bold text-[var(--color-navy-900)]">الفروع</td>
                    {PLANS.map((p) => (
                      <td key={p.id} className="p-4 text-center text-[var(--color-muted)]">
                        {p.branches}
                      </td>
                    ))}
                  </tr>
                  {FEATURE_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-black/5 last:border-0">
                      <td className="p-4 font-medium text-[var(--color-navy-900)]">{row.label}</td>
                      {PLANS.map((p) => (
                        <td key={p.id} className="p-4 text-center">
                          {row[p.id] ? (
                            <Check size={18} className="mx-auto text-[var(--color-accent-500)]" />
                          ) : (
                            <Minus size={18} className="mx-auto text-black/20" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>

          <div className="flex flex-col gap-8">
            <SectionHeading
              title="إضافات اختيارية"
              description="وسّع أي باقة بإضافات مستقلة تدفع فقط لما تحتاجه."
              align="start"
            />
            <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ADDONS.map((addon) => (
                <Reveal key={addon.id}>
                  <div className="flex h-full flex-col gap-3 rounded-2xl border border-black/5 bg-white p-6">
                    <h4 className="font-extrabold text-[var(--color-navy-900)]">{addon.name}</h4>
                    <p className="flex-1 text-sm text-[var(--color-muted)]">{addon.description}</p>
                    <p className="text-lg font-extrabold text-[var(--color-accent-600)]">
                      {addon.monthlyPrice} ريال
                      <span className="text-xs font-medium text-[var(--color-muted)]"> / شهريًا</span>
                    </p>
                  </div>
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </Container>
      </section>
    </>
  );
}
