"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TRIAL_DAYS } from "@/lib/constants";

export function TrialForm({ csrfToken }: { csrfToken: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/trial-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: form.get("restaurantName"),
          phone: form.get("phone"),
          email: form.get("email"),
          csrfToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ، حاول مرة أخرى");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("تعذّر الاتصال بالخادم، تحقق من الإنترنت وحاول مجددًا");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-3xl border border-black/5 bg-white p-10 text-center"
      >
        <CheckCircle2 className="text-[var(--color-accent-500)]" size={52} />
        <h3 className="text-xl font-extrabold text-[var(--color-navy-900)]">
          تم استلام طلبك بنجاح!
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
          سيتم تفعيل حسابك خلال ساعات من فريقنا، وسنتواصل معك على رقم الجوال أو البريد المُدخل
          لإرسال بيانات الدخول.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white p-7 sm:p-8">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="restaurantName" className="text-sm font-bold text-[var(--color-navy-900)]">
          اسم المطعم
        </label>
        <input
          id="restaurantName"
          name="restaurantName"
          required
          minLength={2}
          maxLength={120}
          placeholder="مثال: مطعم الأصيل"
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent-500)]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-bold text-[var(--color-navy-900)]">
          رقم الجوال
        </label>
        <input
          id="phone"
          name="phone"
          required
          dir="ltr"
          placeholder="05xxxxxxxx"
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent-500)]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-bold text-[var(--color-navy-900)]">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          dir="ltr"
          placeholder="name@restaurant.com"
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent-500)]"
        />
      </div>

      {error && <p className="text-sm font-bold text-red-600">{error}</p>}

      <Button type="submit" disabled={status === "loading"} className="mt-2 w-full justify-center">
        {status === "loading" ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          `ابدأ تجربتك المجانية ${TRIAL_DAYS} يومًا`
        )}
      </Button>
      <p className="text-center text-xs text-[var(--color-muted)]">
        بدون بطاقة ائتمان — التفعيل يدوي حاليًا خلال ساعات من فريقنا.
      </p>
    </form>
  );
}
