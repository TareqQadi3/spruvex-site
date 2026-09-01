"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-l from-[var(--color-accent-600)] to-[var(--color-accent-500)] text-white shadow-lg shadow-orange-900/20 hover:shadow-xl hover:shadow-orange-900/30",
  secondary: "bg-[var(--color-navy-900)] text-white hover:bg-[var(--color-navy-800)]",
  outline:
    "border-2 border-[var(--color-navy-900)]/15 text-[var(--color-navy-900)] hover:border-[var(--color-accent-500)] hover:text-[var(--color-accent-600)] bg-white",
  ghost: "text-[var(--color-navy-900)] hover:bg-black/5",
};

const sizeClasses: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

/** framer-motion يعيد تعريف أحداث الحركة/السحب بتوقيع مختلف عن DOM القياسي. */
type SafeButtonAttributes = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & SafeButtonAttributes) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="inline-block"
    >
      <Link href={href} className={cn(base, variantClasses[variant], sizeClasses[size], className)}>
        {children}
      </Link>
    </motion.div>
  );
}
