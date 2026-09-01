"use client";

import { Container } from "@/components/ui/Container";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { useCountUp } from "@/hooks/useCountUp";

const STATS = [
  { value: 14, suffix: " يوم", label: "تجربة مجانية كاملة الميزات" },
  { value: 60, suffix: " دقيقة", label: "لتجهيز مطعمك بالكامل وأول طلب" },
  { value: 15, suffix: "%", label: "ضريبة قيمة مضافة تُحسب تلقائيًا" },
  { value: 3, suffix: " باقات", label: "مرنة تناسب أي حجم مطعم" },
];

function Stat({ value, suffix, label }: (typeof STATS)[number]) {
  const { ref, value: current } = useCountUp(value);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="flex flex-col items-center gap-2 text-center">
      <span className="text-4xl font-extrabold text-white sm:text-5xl">
        {current}
        <span className="text-[var(--color-accent-400)]">{suffix}</span>
      </span>
      <span className="max-w-[10rem] text-sm font-medium text-white/60">{label}</span>
    </div>
  );
}

export function StatsCounter() {
  return (
    <section className="bg-[var(--color-navy-900)] py-16">
      <Container>
        <RevealGroup className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <Reveal key={s.label}>
              <Stat {...s} />
            </Reveal>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
