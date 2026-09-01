"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { cn } from "@/lib/cn";

const SCREENS = [
  { key: "pos", label: "نقطة البيع", src: "/screens/pos-screen.png" },
  { key: "menu", label: "المنيو الرقمي", src: "/screens/digital-menu.png" },
  { key: "kds", label: "شاشة المطبخ", src: "/screens/kds-screen.png" },
  { key: "tables", label: "جلسات الطاولات", src: "/screens/table-sessions-screen.png" },
  { key: "loyalty", label: "الولاء", src: "/screens/loyalty-screen.png" },
  { key: "branches", label: "مقارنة الفروع", src: "/screens/branch-comparison-report.png" },
  { key: "profitability", label: "ربحية القائمة", src: "/screens/menu-profitability-report.png" },
  { key: "settings", label: "الإعدادات", src: "/screens/settings-screen.png" },
] as const;

const AUTO_MS = 4000;

export function AppTour() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SCREENS.length);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const current = SCREENS[active];

  return (
    <section id="app-tour" className="overflow-hidden bg-[var(--color-navy-950)] py-24">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="جولة سريعة"
          title="شاهد التطبيق يعمل فعليًا"
          description="لقطات حقيقية من واجهات SpruVex R — من طلب العميل حتى تقارير الأداء."
          className="[&_h2]:text-white [&_p]:text-white/60"
        />

        <div
          className="relative mx-auto w-full max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-[var(--color-accent-500)]/15 via-transparent to-[var(--color-navy-600)]/25 blur-3xl" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <DeviceFrame src={current.src} alt={current.label} variant="tablet" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {SCREENS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setActive(i)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300",
                i === active
                  ? "bg-[var(--color-accent-500)] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              {s.label}
              {i === active && (
                <motion.span
                  layoutId="app-tour-dot"
                  className="absolute -bottom-2.5 start-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-accent-400)]"
                />
              )}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
