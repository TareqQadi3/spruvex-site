import { getDb } from "@/lib/db";
import type { TrialSignupInput } from "@/lib/validation";

export type TrialSignupStatus = "new" | "provisioned" | "manual_review";

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

export function listTrialSignups(limit = 100): TrialSignupRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM trial_signups ORDER BY created_at DESC LIMIT ?")
    .all(limit) as TrialSignupRow[];
}
