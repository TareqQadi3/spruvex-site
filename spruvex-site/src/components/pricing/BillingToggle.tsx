"use client";

import { motion } from "framer-motion";
import { BILLING_CYCLES, type BillingCycle } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function BillingToggle({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}) {
  return (
    <div className="relative mx-auto flex w-full max-w-md items-center rounded-full bg-[var(--color-navy-900)]/5 p-1.5">
      {BILLING_CYCLES.map((cycle) => (
        <button
          key={cycle.id}
          onClick={() => onChange(cycle.id)}
          className="relative flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors duration-200"
        >
          {value === cycle.id && (
            <motion.span
              layoutId="billing-toggle-pill"
              className="absolute inset-0 rounded-full bg-[var(--color-navy-900)] shadow-md"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span
            className={cn(
              "relative z-10",
              value === cycle.id ? "text-white" : "text-[var(--color-navy-900)]/60"
            )}
          >
            {cycle.label}
            {cycle.id === "yearly" && (
              <span className="mr-1.5 rounded-full bg-[var(--color-accent-500)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent-600)]">
                وطني
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
