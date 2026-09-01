"use client";

import { motion } from "framer-motion";
import {
  QrCode,
  ChefHat,
  ReceiptText,
  BarChart3,
  MessageCircle,
  Store,
  Users,
  Boxes,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";

const FEATURES = [
  {
    icon: Store,
    title: "نقطة بيع سريعة",
    desc: "واجهة كاشير بسيطة وسريعة، تعمل على أي تابلت أو متصفح بدون أجهزة خاصة.",
  },
  {
    icon: QrCode,
    title: "منيو رقمي وطلب QR",
    desc: "العميل يمسح، يطلب، ويخصص وجبته من جواله مباشرة — بدون تحميل تطبيق.",
  },
  {
    icon: ChefHat,
    title: "شاشة مطبخ لحظية",
    desc: "طلبات تصل المطبخ فور تأكيدها بترتيب زمني واضح ومؤقتات تنبيه.",
  },
  {
    icon: ReceiptText,
    title: "فوترة متوافقة مع ZATCA",
    desc: "فاتورة ضريبية مبسطة وQR سليم من اليوم الأول — جاهزية امتثال كاملة.",
  },
  {
    icon: MessageCircle,
    title: "فاتورة واتساب",
    desc: "أرسل فاتورة العميل مباشرة على واتساب بلمسة واحدة بعد الدفع.",
  },
  {
    icon: BarChart3,
    title: "تقارير تتكلم بوضوح",
    desc: "مبيعات، أرباح، ومقارنة فروع — كل ما يحتاجه صاحب المطعم من جواله.",
  },
  {
    icon: Users,
    title: "ولاء وتقييمات",
    desc: "برنامج ولاء وطلب جماعي يبقي عملاءك يرجعون لمطعمك مرارًا.",
  },
  {
    icon: Boxes,
    title: "مخزون ومشتريات",
    desc: "تتبّع المخزون بين الفروع مع تنبيهات استباقية قبل النفاد.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-[var(--color-bg)] py-24">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="كل ما يحتاجه مطعمك"
          title={
            <>
              نظام{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-l from-[var(--color-accent-400)] to-[var(--color-accent-600)] bg-clip-text text-transparent">
                  واحد
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                  style={{ transformOrigin: "right" }}
                  className="absolute inset-x-0 -bottom-1 -z-0 h-3 rounded-full bg-[var(--color-accent-500)]/25"
                />
              </span>{" "}
              بدل{" "}
              <span className="text-[var(--color-muted)] line-through decoration-red-400 decoration-2">
                خمسة أنظمة متفرقة
              </span>
            </>
          }
          description="من أول طلب حتى آخر تقرير، SpruVex R يغطي رحلة مطعمك كاملة بواجهة عربية أنيقة وسريعة."
        />

        <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Reveal key={f.title} delay={0} className="group">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-full flex-col gap-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-navy-900/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent-500)]/15 to-[var(--color-navy-600)]/10 text-[var(--color-accent-600)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <f.icon size={24} strokeWidth={2.2} />
                </div>
                <h3 className="font-extrabold text-[var(--color-navy-900)]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">{f.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
