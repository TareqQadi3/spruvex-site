"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { applyPromoDiscount, isValidPromoCode, type BillingCycle, type PlanId } from "@/lib/constants";

export function BankTransferForm({
  csrfToken,
  planId,
  billingCycle,
  baseAmount,
}: {
  csrfToken: string;
  planId: PlanId;
  billingCycle: BillingCycle;
  /** المبلغ بالريال قبل أي خصم كود — لعرض تقديري فقط؛ السيرفر يعيد الحساب دائمًا. */
  baseAmount: number;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");

  const codeValid = isValidPromoCode(discountCode);
  const discountedAmount = codeValid
    ? applyPromoDiscount(Math.round(baseAmount * 100), discountCode) / 100
    : baseAmount;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = new FormData(e.currentTarget);
    form.set("planId", planId);
    form.set("billingCycle", billingCycle);
    form.set("csrfToken", csrfToken);

    try {
      const res = await fetch("/api/payment-submission", { method: "POST", body: form });
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
          تم استلام طلبك، وهو الآن قيد المراجعة
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
          سيقوم فريقنا بمراجعة التحويل وتفعيل اشتراكك خلال ساعات عمل. سنتواصل معك على رقم الجوال
          المُدخل عند التفعيل.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white p-7 sm:p-8"
    >
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
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-500)]"
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
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-500)]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="transferReference" className="text-sm font-bold text-[var(--color-navy-900)]">
          رقم عملية التحويل (اختياري إن رفعت صورة الإيصال)
        </label>
        <input
          id="transferReference"
          name="transferReference"
          maxLength={120}
          dir="ltr"
          placeholder="مثال: TRX-102938"
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-500)]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="discountCode" className="text-sm font-bold text-[var(--color-navy-900)]">
          كود الخصم (اختياري)
        </label>
        <input
          id="discountCode"
          name="discountCode"
          dir="ltr"
          maxLength={40}
          placeholder="WATANI20"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm uppercase outline-none focus:border-[var(--color-accent-500)]"
        />
        {codeValid && (
          <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <BadgeCheck size={14} /> تم تطبيق الخصم — المبلغ بعد الخصم:{" "}
            {discountedAmount.toLocaleString("ar-SA-u-nu-latn")} ريال
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="receipt" className="text-sm font-bold text-[var(--color-navy-900)]">
          صورة إيصال التحويل (اختياري إن أدخلت رقم العملية)
        </label>
        <label
          htmlFor="receipt"
          className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-black/15 bg-[var(--color-bg)] px-4 py-4 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent-500)]"
        >
          <Upload size={18} />
          {fileName ?? "اختر صورة JPG/PNG أو ملف PDF — حتى 5 ميجابايت"}
        </label>
        <input
          id="receipt"
          name="receipt"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </div>

      {error && <p className="text-sm font-bold text-red-600">{error}</p>}

      <Button type="submit" disabled={status === "loading"} className="mt-2 w-full justify-center">
        {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : "أرسلت التحويل"}
      </Button>
    </form>
  );
}
