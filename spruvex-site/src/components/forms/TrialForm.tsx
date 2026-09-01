"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BUSINESS_TYPES, TRIAL_DAYS, type BusinessType } from "@/lib/constants";

type Phase =
  | "form"
  | "submitting"
  | "manual_review"
  | "already_registered"
  | "otp"
  | "verifying"
  | "redirecting"
  | "error";

const RESEND_COOLDOWN_SECONDS = 30;

export function TrialForm({ csrfToken }: { csrfToken: string }) {
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendSending, setResendSending] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = setTimeout(() => setCooldownLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownLeft]);

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
          businessType: form.get("businessType"),
          phone: form.get("phone"),
          email: submittedEmail,
          password: form.get("password"),
          confirmPassword: form.get("confirmPassword"),
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
      } else if (data.alreadyRegistered) {
        setPhase("already_registered");
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
    setResendSending(true);
    try {
      await fetch("/api/trial-signup/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, csrfToken }),
      });
    } finally {
      setResendSending(false);
      setCooldownLeft(RESEND_COOLDOWN_SECONDS);
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
          تم استلام طلبك
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
          واجهنا عطلًا مؤقتًا أثناء إنشاء حسابك تلقائيًا. فريقنا اطّلع على طلبك وسيتواصل معك
          لإكمال التفعيل.
        </p>
      </motion.div>
    );
  }

  if (phase === "already_registered") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-3xl border border-black/5 bg-white p-10 text-center"
      >
        <ShieldCheck className="text-[var(--color-accent-500)]" size={52} />
        <h3 className="text-xl font-extrabold text-[var(--color-navy-900)]">
          لديك حساب مسجّل بالفعل
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
          رقم الجوال أو البريد الإلكتروني المُدخل مرتبط بحساب SpruVex R موجود مسبقًا — التجربة
          المجانية مرة واحدة لكل مطعم. سجّل الدخول بحسابك الحالي، أو تواصل معنا إن كنت تحتاج
          مساعدة.
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
            disabled={resendSending || cooldownLeft > 0}
            className="text-center text-xs font-bold text-[var(--color-accent-600)] hover:underline disabled:cursor-not-allowed disabled:text-[var(--color-muted)] disabled:no-underline"
          >
            {resendSending
              ? "جارِ الإرسال..."
              : cooldownLeft > 0
                ? `أعد الإرسال خلال 00:${String(cooldownLeft).padStart(2, "0")}`
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
          اسم النشاط
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
        <label htmlFor="businessType" className="text-sm font-bold text-[var(--color-navy-900)]">
          نوع النشاط
        </label>
        <select
          id="businessType"
          name="businessType"
          required
          defaultValue=""
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent-500)]"
        >
          <option value="" disabled>
            اختر نوع النشاط
          </option>
          {BUSINESS_TYPES.map((t: { id: BusinessType; label: string }) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-bold text-[var(--color-navy-900)]">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            dir="ltr"
            placeholder="8 أحرف فأكثر، حرف ورقم"
            className="w-full rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 pl-11 text-sm outline-none transition-colors focus:border-[var(--color-accent-500)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="absolute inset-y-0 left-3 flex items-center text-[var(--color-muted)]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-bold text-[var(--color-navy-900)]">
          تأكيد كلمة المرور
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          dir="ltr"
          placeholder="أعد إدخال كلمة المرور"
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent-500)]"
        />
      </div>

      {error && <p className="text-sm font-bold text-red-600">{error}</p>}

      <p className="flex items-center gap-2 rounded-xl bg-[var(--color-bg)] p-3 text-xs leading-relaxed text-[var(--color-muted)]">
        <Lock className="shrink-0 text-[var(--color-accent-500)]" size={16} />
        <span>بياناتك مشفّرة ومحمية.</span>
      </p>

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
