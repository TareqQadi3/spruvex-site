import { getDb } from "@/lib/db";
import type { TrialSignupInput } from "@/lib/validation";

export type TrialSignupStatus = "new" | "provisioned" | "manual_review" | "duplicate";

export interface TrialSignupRow {
  id: number;
  restaurant_name: string;
  phone: string;
  email: string;
  status: TrialSignupStatus;
  tenant_id: string | null;
  dashboard_url: string | null;
  created_at: string;
}

/**
 * يخزّن طلب التجربة المجانية محليًا أولاً (سجل احتياطي/متابعة مبيعات يبقى
 * دائمًا بغض النظر عن نجاح أو فشل الخطوة التالية). استدعاء spruvex-r الفعلي
 * لإنشاء Tenant يحدث بعد هذا في src/app/api/trial-signup/route.ts، والنتيجة
 * تُسجَّل عبر markTrialSignupProvisioned/markTrialSignupManualReview أدناه.
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

/** نجح استدعاء spruvex-r فعليًا — يربط السجل المحلي بالـ Tenant الحقيقي. */
export function markTrialSignupProvisioned(
  id: number,
  data: { tenantId: string; dashboardUrl: string }
): void {
  const db = getDb();
  db.prepare(
    `UPDATE trial_signups
     SET status = 'provisioned', tenant_id = @tenantId, dashboard_url = @dashboardUrl
     WHERE id = @id`
  ).run({ id, ...data });
}

/**
 * فشل استدعاء spruvex-r (شبكة/5xx/جوال مكرر 409) — السجل يبقى موجودًا،
 * فقط يُعلَّم لمراجعة يدوية بدل أن يضيع الطلب أو تفشل تجربة المستخدم.
 */
export function markTrialSignupManualReview(id: number): void {
  const db = getDb();
  db.prepare("UPDATE trial_signups SET status = 'manual_review' WHERE id = ?").run(id);
}

/**
 * فشل استدعاء spruvex-r بسبب جوال/بريد مسجّل مسبقًا (409) — هذه ليست حالة
 * "فشل يحتاج مراجعة يدوية"، بل تعني أن صاحب الطلب لديه حساب فعلاً، فتُعلَّم
 * بحالة مختلفة حتى تُعرض له رسالة دقيقة بدل رسالة "سيتم التفعيل خلال ساعات"
 * المُضلِّلة في هذه الحالة تحديدًا.
 */
export function markTrialSignupDuplicate(id: number): void {
  const db = getDb();
  db.prepare("UPDATE trial_signups SET status = 'duplicate' WHERE id = ?").run(id);
}

/**
 * أحدث سجل بنفس البريد إن وُجد — يُستخدم للتحقق المحلي من التكرار قبل حتى
 * استدعاء spruvex-r (بدل الاعتماد فقط على رفض spruvex-r لتكرار الجوال)،
 * ولإيجاد dashboard_url المخزَّن محليًا عند إرسال بريد الترحيب بعد التحقق.
 */
export function findTrialSignupByEmail(email: string): TrialSignupRow | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM trial_signups WHERE email = ? ORDER BY created_at DESC LIMIT 1")
    .get(email) as TrialSignupRow | undefined;
}

export function listTrialSignups(limit = 100): TrialSignupRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM trial_signups ORDER BY created_at DESC LIMIT ?")
    .all(limit) as TrialSignupRow[];
}
