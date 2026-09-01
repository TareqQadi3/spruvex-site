"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LoginForm({ csrfToken, nextPath }: { csrfToken: string; nextPath: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.get("password"), csrfToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ");
        setStatus("error");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-black/5 bg-white p-8"
    >
      <div className="flex flex-col items-center gap-2 pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-navy-900)] text-white">
          <Lock size={22} />
        </div>
        <h1 className="text-lg font-extrabold text-[var(--color-navy-900)]">دخول لوحة الإدارة</h1>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-bold text-[var(--color-navy-900)]">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          dir="ltr"
          autoFocus
          className="rounded-xl border border-black/10 bg-[var(--color-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-500)]"
        />
      </div>

      {error && <p className="text-sm font-bold text-red-600">{error}</p>}

      <Button type="submit" disabled={status === "loading"} className="w-full justify-center">
        {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : "دخول"}
      </Button>
    </form>
  );
}
