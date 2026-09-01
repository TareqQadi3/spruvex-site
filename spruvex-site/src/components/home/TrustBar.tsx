import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { TRUST_BAR_ITEMS } from "@/lib/constants";
import { Bike, CreditCard } from "lucide-react";

export function TrustBar() {
  return (
    <section className="border-y border-black/5 bg-white py-10">
      <Container>
        <Reveal className="mb-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]">
            تكاملات التوصيل والدفع{" "}
            <span className="rounded-full bg-[var(--color-accent-500)]/10 px-3 py-1 text-[var(--color-accent-600)]">
              قريبًا
            </span>
          </p>
        </Reveal>
      </Container>

      <Marquee
        items={TRUST_BAR_ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-[var(--color-bg)] px-5 py-3 text-[var(--color-navy-900)]/70"
          >
            {item.category === "توصيل" ? <Bike size={18} /> : <CreditCard size={18} />}
            <span className="text-sm font-bold">{item.name}</span>
          </div>
        ))}
      />
    </section>
  );
}
