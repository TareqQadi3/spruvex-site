import { getDb } from "@/lib/db";
import type { TrialSignupInput } from "@/lib/validation";

export interface TrialSignupRow {
  id: number;
  restaurant_name: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
}

/**
 * يخزّن طلب التجربة المجانية محليًا فقط.
 *
 * TODO(integration): هذه *ليست* نقطة الحقيقة النهائية لإنشاء Tenant. الخطوة
 * التالية بعد جاهزية مشروع spruvex-r هي استدعاء نقطة نهاية آمنة هناك
 * (مثال: POST https://api.spruvex-r.com/internal/tenants من هذا الـ handler
 * أو عبر Webhook/Queue) لإنشاء المطعم فعليًا وإرسال بيانات الدخول. حاليًا
 * التفعيل يدوي بالكامل من فريق المبيعات بناءً على هذا الجدول.
 */
export function createTrialSignup(input: Omit<TrialSignupInput, "csrfToken">): TrialSignupRow {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO trial_signups (restaurant_name, phone, email, status, created_at)
     VALUES (@restaurantName, @phone, @email, 'new', @createdAt)`
  );
  const createdAt = new Date().toISOString();
  const result = stmt.run({ ...input, createdAt });
  return db
    .prepare("SELECT * FROM trial_signups WHERE id = ?")
    .get(result.lastInsertRowid) as TrialSignupRow;
}

export function listTrialSignups(limit = 100): TrialSignupRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM trial_signups ORDER BY created_at DESC LIMIT ?")
    .all(limit) as TrialSignupRow[];
}
