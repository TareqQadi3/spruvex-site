"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  FEATURE_ROWS,
  PERMANENT_DISCOUNT_PERCENT,
  priceForCycle,
  yearlySavings,
  type BillingCycle,
  type Plan,
} from "@/lib/constants";

export function PricingCard({
  plan,
  cycle,
  compact = false,
}: {
  plan: Plan;
  cycle: BillingCycle;
  compact?: boolean;
}) {
  const price = priceForCycle(plan, cycle);
  const cycleMonths = cycle === "monthly" ? 1 : cycle === "semiannual" ? 6 : 12;
  const monthlyEquivalent = Math.round(price / cycleMonths);
  const savings = cycle === "yearly" ? yearlySavings(plan) : 0;
  const listPrice = plan.prices.listMonthly * cycleMonths;

  const featuresToShow = compact ? FEATURE_ROWS.slice(0, 4) : FEATURE_ROWS;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "relative flex h-full flex-col gap-6 rounded-3xl border p-7 shadow-sm transition-shadow duration-300 hover:shadow-2xl",
        plan.highlighted
          ? "border-[var(--color-accent-500)]/30 bg-[var(--color-navy-950)] text-white shadow-lg shadow-orange-950/10"
          : "border-black/5 bg-white"
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rounded-full bg-gradient-to-l from-[var(--color-accent-600)] to-[var(--color-accent-500)] px-4 py-1 text-xs font-bold text-white shadow-md">
          الأكثر طلبًا
        </span>
      )}

      <div>
        <h3 className={cn("text-xl font-extrabold", plan.highlighted ? "text-white" : "text-[var(--color-navy-900)]")}>
          {plan.name}
        </h3>
        <p className={cn("mt-1 text-sm", plan.highlighted ? "text-white/60" : "text-[var(--color-muted)]")}>
          {plan.description}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span
            dir="ltr"
            className={cn(
              "text-sm font-bold line-through decoration-2",
              plan.highlighted ? "text-white/35 decoration-white/35" : "text-[var(--color-muted)] decoration-red-400/70"
            )}
          >
            {listPrice.toLocaleString("ar-SA-u-nu-latn")} ريال
          </span>
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-500">
            خصم {PERMANENT_DISCOUNT_PERCENT}%
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-4xl font-extrabold", plan.highlighted ? "text-white" : "text-[var(--color-navy-900)]")}>
            {price.toLocaleString("ar-SA-u-nu-latn")}
          </span>
          <span className={cn("text-sm font-bold", plan.highlighted ? "text-white/60" : "text-[var(--color-muted)]")}>
            ريال / {cycle === "monthly" ? "شهريًا" : cycle === "semiannual" ? "6 أشهر" : "سنويًا"}
          </span>
        </div>
        {cycle !== "monthly" && (
          <p className={cn("mt-1 text-xs", plan.highlighted ? "text-white/50" : "text-[var(--color-muted)]")}>
            ما يعادل {monthlyEquivalent.toLocaleString("ar-SA-u-nu-latn")} ريال شهريًا
          </p>
        )}
        {cycle === "yearly" && savings > 0 && (
          <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-500)]/15 px-2.5 py-1 text-xs font-bold text-[var(--color-accent-500)]">
            وفّر {savings.toLocaleString("ar-SA-u-nu-latn")} ريال مقارنة بالاشتراك الشهري
          </p>
        )}
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold",
          plan.highlighted ? "bg-white/5 text-white/80" : "bg-[var(--color-bg)] text-[var(--color-navy-900)]"
        )}
      >
        {plan.branches}
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {featuresToShow.map((row) => {
          const included = row[plan.id];
          return (
            <li key={row.label} className="flex items-start gap-2.5 text-sm">
              {included ? (
                <Check size={18} className="mt-0.5 shrink-0 text-[var(--color-accent-500)]" />
              ) : (
                <Minus size={18} className={cn("mt-0.5 shrink-0", plan.highlighted ? "text-white/25" : "text-black/20")} />
              )}
              <span
                className={cn(
                  included
                    ? plan.highlighted
                      ? "text-white/90"
                      : "text-[var(--color-navy-900)]"
                    : plan.highlighted
                      ? "text-white/35 line-through"
                      : "text-[var(--color-muted)] line-through"
                )}
              >
                {row.label}
              </span>
            </li>
          );
        })}
      </ul>

      <ButtonLink
        href={`/pay/${plan.id}?cycle=${cycle}`}
        variant={plan.highlighted ? "primary" : "outline"}
        className={cn("justify-center", plan.highlighted && "!border-none")}
      >
        اشترك الآن
      </ButtonLink>
    </motion.div>
  );
}
