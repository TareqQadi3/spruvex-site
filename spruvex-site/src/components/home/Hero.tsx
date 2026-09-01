"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { ChevronDown, Sparkles } from "lucide-react";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], [-6, -2]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[var(--color-navy-950)]">
      <motion.div
        style={{ y: bgY }}
        className="bg-noise pointer-events-none absolute inset-0 opacity-90"
      />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[var(--color-accent-500)]/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-[var(--color-navy-600)]/40 blur-[100px]" />

      <Container className="relative grid items-center gap-14 py-20 md:grid-cols-2 md:py-28">
        <motion.div style={{ opacity: fade }} className="flex flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-[var(--color-accent-400)] ring-1 ring-white/10"
          >
            <Sparkles size={16} />
            تجربة مجانية 14 يومًا — بدون بطاقة ائتمان
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-balance text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl md:text-6xl"
          >
            نظام مطعمك الذكي، من الطاولة إلى{" "}
            <span className="bg-gradient-to-l from-[var(--color-accent-400)] to-[var(--color-accent-600)] bg-clip-text text-transparent">
              التقرير
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-lg text-balance text-lg leading-relaxed text-white/70"
          >
            نقطة بيع، منيو رقمي بـ QR، شاشة مطبخ لحظية، وفوترة متوافقة مع ZATCA — كل ما يحتاجه
            مطعمك في منصة واحدة عربية أولاً، بدون تعقيد وبدون أجهزة خاصة.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <ButtonLink href="/contact" size="lg">
              ابدأ تجربتك المجانية
            </ButtonLink>
            <ButtonLink href="/pricing" variant="outline" size="lg" className="!border-white/20 !bg-white/5 !text-white hover:!border-[var(--color-accent-400)] hover:!text-[var(--color-accent-400)]">
              شاهد الأسعار
            </ButtonLink>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: cardY, rotate: cardRotate }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto"
        >
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-[var(--color-accent-500)]/25 via-transparent to-[var(--color-navy-600)]/30 blur-2xl" />
          <DeviceFrame src="/screens/pos-screen.png" alt="شاشة نقطة البيع في SpruVex R" variant="tablet" priority />
        </motion.div>
      </Container>

      <motion.div
        style={{ opacity: fade }}
        className="relative z-10 flex justify-center pb-10"
      >
        <div className="flex flex-col items-center gap-1 text-white/40">
          <span className="text-xs font-medium">مرّر لتكتشف المزيد</span>
          <ChevronDown className="animate-scroll-indicator" size={20} />
        </div>
      </motion.div>
    </section>
  );
}
