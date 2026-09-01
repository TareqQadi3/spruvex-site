"use client";

import { Flag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useCountdown } from "@/hooks/useCountdown";
import { nextNationalDay } from "@/lib/constants";

const TARGET = nextNationalDay();

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex w-16 flex-col items-center gap-1 rounded-2xl bg-white/10 py-3 backdrop-blur-sm sm:w-20">
      <span className="text-2xl font-extrabold text-white sm:text-3xl tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[11px] font-medium text-white/60">{label}</span>
    </div>
  );
}

export function NationalDayBanner() {
  const { days, hours, minutes, seconds } = useCountdown(TARGET) ?? {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-l from-[var(--color-maroon-700)] via-[var(--color-maroon-600)] to-[var(--color-accent-600)] py-16">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-40" />
      <Container className="relative flex flex-col items-center gap-8 text-center">
        <Reveal className="animate-soft-glow flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white ring-1 ring-white/20">
          <Flag size={16} />
          عرض اليوم الوطني السعودي
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl">
            اشترك سنويًا الآن ووفّر أكثر
          </h2>
        </Reveal>

        <Reveal delay={0.16} className="flex items-center gap-2.5 sm:gap-4">
          <TimeBox value={days} label="يوم" />
          <TimeBox value={hours} label="ساعة" />
          <TimeBox value={minutes} label="دقيقة" />
          <TimeBox value={seconds} label="ثانية" />
        </Reveal>

        <Reveal delay={0.24}>
          <ButtonLink href="/pricing" variant="secondary" size="lg" className="!bg-white !text-[var(--color-maroon-700)] hover:!bg-white/90">
            شاهد عرض اليوم الوطني
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
