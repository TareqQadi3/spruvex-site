import { getDb } from "@/lib/db";
import { getPlan, priceForCycle, type BillingCycle, type PlanId } from "@/lib/constants";
import crypto from "node:crypto";

export interface UploadedFileRow {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  stored_filename: string;
  created_at: string;
}

export interface PaymentSubmissionRow {
  id: number;
  restaurant_name: string;
  phone: string;
  plan_id: PlanId;
  billing_cycle: BillingCycle;
  amount_halalas: number;
  payment_method: string;
  transfer_reference: string | null;
  provider_ref: string | null;
  receipt_file_id: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function saveUploadedFile(meta: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storedFilename: string;
}): UploadedFileRow {
  const db = getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO uploaded_files (id, original_name, mime_type, size_bytes, stored_filename, created_at)
     VALUES (@id, @originalName, @mimeType, @sizeBytes, @storedFilename, @createdAt)`
  ).run({ id, createdAt, ...meta });
  return db.prepare("SELECT * FROM uploaded_files WHERE id = ?").get(id) as UploadedFileRow;
}

/**
 * يسجّل طلب "أرسلت التحويل" بحالة قيد المراجعة.
 *
 * تصميم الحقول (payment_method / provider_ref / status) متوافق مسبقًا مع
 * استبدال التحويل اليدوي ببوابة دفع فعلية (مثل Moyasar) لاحقًا: يكفي عندها
 * إدراج سجلات بـ payment_method='moyasar' و provider_ref = معرّف العملية من
 * البوابة، مع تحديث status تلقائيًا من الـ Webhook بدل المراجعة اليدوية —
 * دون أي تغيير على شكل الجدول أو الصفحات التي تقرأ منه.
 */
export function createPaymentSubmission(input: {
  restaurantName: string;
  phone: string;
  planId: PlanId;
  billingCycle: BillingCycle;
  transferReference: string | null;
  receiptFileId: string | null;
}): PaymentSubmissionRow {
  const db = getDb();
  const plan = getPlan(input.planId);
  if (!plan) throw new Error("خطة غير معروفة");
  const amountHalalas = Math.round(priceForCycle(plan, input.billingCycle) * 100);
  const createdAt = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO payment_submissions
        (restaurant_name, phone, plan_id, billing_cycle, amount_halalas, payment_method,
         transfer_reference, receipt_file_id, status, created_at)
       VALUES
        (@restaurantName, @phone, @planId, @billingCycle, @amountHalalas, 'bank_transfer',
         @transferReference, @receiptFileId, 'pending', @createdAt)`
    )
    .run({ ...input, amountHalalas, createdAt });

  return db
    .prepare("SELECT * FROM payment_submissions WHERE id = ?")
    .get(result.lastInsertRowid) as PaymentSubmissionRow;
}

export function listPaymentSubmissions(status?: "pending" | "approved" | "rejected"): PaymentSubmissionRow[] {
  const db = getDb();
  if (status) {
    return db
      .prepare("SELECT * FROM payment_submissions WHERE status = ? ORDER BY created_at DESC")
      .all(status) as PaymentSubmissionRow[];
  }
  return db
    .prepare("SELECT * FROM payment_submissions ORDER BY created_at DESC")
    .all() as PaymentSubmissionRow[];
}

export function getPaymentSubmission(id: number): PaymentSubmissionRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM payment_submissions WHERE id = ?").get(id) as
    | PaymentSubmissionRow
    | undefined;
}

export function getUploadedFile(id: string): UploadedFileRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM uploaded_files WHERE id = ?").get(id) as
    | UploadedFileRow
    | undefined;
}

export function reviewPaymentSubmission(
  id: number,
  status: "approved" | "rejected",
  reviewedBy: string,
  notes?: string
): PaymentSubmissionRow | undefined {
  const db = getDb();
  db.prepare(
    `UPDATE payment_submissions
     SET status = @status, admin_notes = @notes, reviewed_at = @reviewedAt, reviewed_by = @reviewedBy
     WHERE id = @id`
  ).run({
    id,
    status,
    notes: notes ?? null,
    reviewedAt: new Date().toISOString(),
    reviewedBy,
  });
  return getPaymentSubmission(id);
}
