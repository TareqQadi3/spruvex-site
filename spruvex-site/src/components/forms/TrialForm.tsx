"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TRIAL_DAYS } from "@/lib/constants";

type Phase =
  | "form"
  | "submitting"
  | "manual_review"
  | "otp"
  | "verifying"
  | "redirecting"
  | "error";

export function TrialForm({ csrfToken }: { csrfToken: string }) {
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPhase("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const submittedEmail = String(form.get("email") ?? "");

    try {
      const res = await fetch("/api/trial-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: form.get("restaurantName"),
          phone: form.get("phone"),
          email: submittedEmail,
          csrfToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ، حاول مرة أخرى");
        setPhase("error");
        return;
      }

      if (data.provisioned) {
        setEmail(data.email ?? submittedEmail);
        setDashboardUrl(data.dashboardUrl ?? "");
        setPhase("otp");
      } else {
        setPhase("manual_review");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم، تحقق من الإنترنت وحاول مجددًا");
      setPhase("error");
    }
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPhase("verifying");
    setOtpError(null);

    try {
      const res = await fetch("/api/trial-signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, csrfToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error ?? "رمز التحقق غير صحيح، حاول مرة أخرى");
        setPhase("otp");
        return;
      }

      setPhase("redirecting");
      window.location.href = dashboardUrl;
    } catch {
      setOtpError("تعذّر الاتصال بالخادم، حاول مرة أخرى");
      setPhase("otp");
    }
  }

  async function handleResend() {
    setResendState("sending");
    try {
      await fetch("/api/trial-signup/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, csrfToken }),
      });
    } finally {
      setResendState("sent");
      setTimeout(() => setResendState("idle"), 30_000);
    }
  }

  if (phase === "manual_review") {
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

  if (phase === "otp" || phase === "verifying" || phase === "redirecting") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-5 rounded-3xl border border-black/5 bg-white p-7 sm:p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldCheck className="text-[var(--color-accent-500)]" size={44} />
          <h3 className="text-lg font-extrabold text-[var(--color-navy-900)]">
            تم إنشاء حسابك التجريبي!
          </h3>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
            أرسلنا رمز تحقق مكوّنًا من 6 أرقام إلى <span dir="ltr" className="font-bold">{email}</span>{" "}
            — أدخله هنا لتسجيل الدخول مباشرة إلى لوحة تحكم مطعمك.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-center text-2xl font-extrabold tracking-[0.5em] outline-none transition-colors focus:border-[var(--color-accent-500)]"
          />

          {otpError && <p className="text-center text-sm font-bold text-red-600">{otpError}</p>}

          <Button
            type="submit"
            disabled={phase === "verifying" || phase === "redirecting" || code.length !== 6}
            className="w-full justify-center"
          >
            {phase === "verifying" || phase === "redirecting" ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "تحقق وادخل للوحة التحكم"
            )}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendState !== "idle"}
            className="text-center text-xs font-bold text-[var(--color-accent-600)] hover:underline disabled:cursor-not-allowed disabled:text-[var(--color-muted)] disabled:no-underline"
          >
            {resendState === "sending"
              ? "جارِ الإرسال..."
              : resendState === "sent"
                ? "تم إرسال رمز جديد ✓"
                : "لم يصلك الرمز؟ أعد الإرسال"}
          </button>
        </form>
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

      <Button type="submit" disabled={phase === "submitting"} className="mt-2 w-full justify-center">
        {phase === "submitting" ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          `ابدأ تجربتك المجانية ${TRIAL_DAYS} يومًا`
        )}
      </Button>
      <p className="text-center text-xs text-[var(--color-muted)]">
        بدون بطاقة ائتمان — تفعيل فوري في أغلب الحالات.
      </p>
    </form>
  );
}
