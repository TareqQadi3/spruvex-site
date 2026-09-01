"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, LogOut, RefreshCcw, X } from "lucide-react";
import type { TrialSignupStatus } from "@/lib/repositories/trialSignups";
import { PLANS } from "@/lib/constants";

interface PaymentSubmission {
  id: number;
  restaurant_name: string;
  phone: string;
  plan_id: string;
  billing_cycle: string;
  amount_halalas: number;
  transfer_reference: string | null;
  receipt_file_id: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface TrialSignup {
  id: number;
  restaurant_name: string;
  phone: string;
  email: string;
  status: TrialSignupStatus;
  tenant_id: string | null;
  dashboard_url: string | null;
  created_at: string;
}

const trialStatusStyle: Record<TrialSignupStatus, string> = {
  new: "bg-slate-100 text-slate-600",
  provisioned: "bg-emerald-100 text-emerald-700",
  manual_review: "bg-amber-100 text-amber-700",
};

const trialStatusLabel: Record<TrialSignupStatus, string> = {
  new: "قيد المعالجة",
  provisioned: "تم التفعيل تلقائيًا",
  manual_review: "يحتاج مراجعة يدوية",
};

const planName = (id: string) => PLANS.find((p) => p.id === id)?.name ?? id;

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

export function SubmissionsDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"payments" | "trials">("payments");
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [trials, setTrials] = useState<TrialSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/submissions", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setPayments(data.paymentSubmissions);
      setTrials(data.trialSignups);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // تحميل البيانات عند فتح لوحة الإدارة لأول مرة
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function review(id: number, status: "approved" | "rejected") {
    setBusyId(id);
    await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setBusyId(null);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 rounded-full bg-black/5 p-1.5">
          <button
            onClick={() => setTab("payments")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "payments" ? "bg-white shadow text-[var(--color-navy-900)]" : "text-[var(--color-muted)]"
            }`}
          >
            طلبات التحويل البنكي
          </button>
          <button
            onClick={() => setTab("trials")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "trials" ? "bg-white shadow text-[var(--color-navy-900)]" : "text-[var(--color-muted)]"
            }`}
          >
            طلبات التجربة المجانية
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-sm font-bold text-[var(--color-navy-900)] hover:bg-black/5"
          >
            <RefreshCcw size={15} /> تحديث
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
          >
            <LogOut size={15} /> خروج
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--color-muted)]">جارِ التحميل...</p>
      ) : tab === "payments" ? (
        <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
          <table className="w-full min-w-[820px] text-start text-sm">
            <thead>
              <tr className="border-b border-black/5 text-[var(--color-muted)]">
                <th className="p-4 font-bold">المطعم</th>
                <th className="p-4 font-bold">الجوال</th>
                <th className="p-4 font-bold">الباقة</th>
                <th className="p-4 font-bold">المبلغ</th>
                <th className="p-4 font-bold">المرجع / الإيصال</th>
                <th className="p-4 font-bold">الحالة</th>
                <th className="p-4 font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--color-muted)]">
                    لا توجد طلبات بعد
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-black/5 last:border-0">
                  <td className="p-4 font-bold text-[var(--color-navy-900)]">{p.restaurant_name}</td>
                  <td dir="ltr" className="p-4 text-[var(--color-muted)]">{p.phone}</td>
                  <td className="p-4 text-[var(--color-muted)]">
                    {planName(p.plan_id)} · {p.billing_cycle}
                  </td>
                  <td className="p-4 font-bold text-[var(--color-navy-900)]">
                    {(p.amount_halalas / 100).toLocaleString("ar-SA-u-nu-latn")} ر.س
                  </td>
                  <td className="p-4 text-[var(--color-muted)]">
                    <div className="flex flex-col gap-1">
                      {p.transfer_reference && <span dir="ltr">{p.transfer_reference}</span>}
                      {p.receipt_file_id && (
                        <a
                          href={`/api/admin/receipt/${p.receipt_file_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--color-accent-600)] hover:underline"
                        >
                          عرض الإيصال <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[p.status]}`}>
                      {statusLabel[p.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          disabled={busyId === p.id}
                          onClick={() => review(p.id, "approved")}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                          aria-label="قبول"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          disabled={busyId === p.id}
                          onClick={() => review(p.id, "rejected")}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          aria-label="رفض"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead>
              <tr className="border-b border-black/5 text-[var(--color-muted)]">
                <th className="p-4 font-bold">المطعم</th>
                <th className="p-4 font-bold">الجوال</th>
                <th className="p-4 font-bold">البريد</th>
                <th className="p-4 font-bold">الحالة</th>
                <th className="p-4 font-bold">تاريخ الطلب</th>
              </tr>
            </thead>
            <tbody>
              {trials.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-muted)]">
                    لا توجد طلبات بعد
                  </td>
                </tr>
              )}
              {trials.map((t) => (
                <tr key={t.id} className="border-b border-black/5 last:border-0">
                  <td className="p-4 font-bold text-[var(--color-navy-900)]">{t.restaurant_name}</td>
                  <td dir="ltr" className="p-4 text-[var(--color-muted)]">{t.phone}</td>
                  <td dir="ltr" className="p-4 text-[var(--color-muted)]">{t.email}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${trialStatusStyle[t.status]}`}
                      >
                        {trialStatusLabel[t.status]}
                      </span>
                      {t.status === "provisioned" && t.dashboard_url && (
                        <a
                          href={t.dashboard_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-600)] hover:underline"
                        >
                          فتح لوحة المطعم <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--color-muted)]">
                    {new Date(t.created_at).toLocaleString("ar-SA-u-nu-latn")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
