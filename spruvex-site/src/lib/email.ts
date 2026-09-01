import { Resend } from "resend";

/**
 * إرسال بريد عبر Resend — للاستخدام من جانب السيرفر فقط (Route Handlers).
 *
 * ⚠️ لا تستورد هذا الملف من أي مكوّن "use client": RESEND_API_KEY لا يُقرأ
 * إلا عبر process.env هنا، فلا يصل لحزمة المتصفح طالما هذا الملف لا يُستورد
 * إلا من Route Handlers. القراءة داخل الدوال فقط (وليس بمستوى الوحدة) حتى لا
 * يفشل أي شيء وقت "Collecting page data" ببناء Next.js لو المتغير غير مضبوط.
 *
 * كل دوال الإرسال هنا "best-effort": فشل إرسال بريد (مفتاح غير مضبوط، خطأ
 * شبكة، رفض من Resend) يُسجَّل بوضوح بالسجلات ولا يُفشل أبدًا تجربة المستخدم
 * أو تدفق التسجيل/التحقق — نفس المبدأ المتّبع مع فشل استدعاء spruvex-r.
 */

class EmailConfigError extends Error {}

function getClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new EmailConfigError("RESEND_API_KEY غير مضبوط في متغيرات البيئة");
  return new Resend(key);
}

function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new EmailConfigError("RESEND_FROM_EMAIL غير مضبوط في متغيرات البيئة");
  return from;
}

function getAdminAlertAddress(): string {
  const to = process.env.ADMIN_ALERT_EMAIL;
  if (!to) throw new EmailConfigError("ADMIN_ALERT_EMAIL غير مضبوط في متغيرات البيئة");
  return to;
}

async function send(params: { to: string; subject: string; html: string }): Promise<void> {
  const client = getClient();
  const from = getFromAddress();
  const { error } = await client.emails.send({ from, to: params.to, subject: params.subject, html: params.html });
  if (error) {
    throw new Error(`Resend rejected the email: ${error.name} — ${error.message}`);
  }
}

/**
 * بريد ترحيب بعد نجاح التحقق فعليًا من رمز OTP — يحتوي رابط لوحة التحكم.
 * لا يحمل أي رمز تحقق (المستخدم تحقق بالفعل قبل وصول هذا البريد).
 */
export async function sendWelcomeEmail(input: {
  to: string;
  restaurantName: string;
  dashboardUrl: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await send({
      to: input.to,
      subject: "أهلًا بك في SpruVex R — حسابك جاهز",
      html: `
        <div dir="rtl" style="font-family:sans-serif;line-height:1.7">
          <h2>أهلًا بك، ${escapeHtml(input.restaurantName)}!</h2>
          <p>تم تفعيل حسابك التجريبي بنجاح. يمكنك الآن الدخول إلى لوحة تحكم مطعمك مباشرة:</p>
          <p>
            <a href="${escapeHtml(input.dashboardUrl)}"
               style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none">
              فتح لوحة التحكم
            </a>
          </p>
          <p style="color:#64748b;font-size:13px">إن لم يعمل الزر، انسخ هذا الرابط: ${escapeHtml(input.dashboardUrl)}</p>
        </div>`,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

/** بريد تنبيه لمالك المنصة عند أي محاولة تسجيل تجربة مجانية جديدة (أي نتيجة). */
export async function sendAdminSignupAlertEmail(input: {
  restaurantName: string;
  phone: string;
  email: string;
  status: "provisioned" | "manual_review" | "duplicate";
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const statusLabel: Record<typeof input.status, string> = {
    provisioned: "تم التفعيل تلقائيًا",
    manual_review: "فشل التفعيل التلقائي — يحتاج مراجعة",
    duplicate: "بريد/جوال مسجّل مسبقًا",
  };
  try {
    await send({
      to: getAdminAlertAddress(),
      subject: `تسجيل تجربة مجانية جديد: ${input.restaurantName} (${statusLabel[input.status]})`,
      html: `
        <div dir="rtl" style="font-family:sans-serif;line-height:1.7">
          <h3>طلب تجربة مجانية جديد</h3>
          <ul>
            <li><strong>المطعم:</strong> ${escapeHtml(input.restaurantName)}</li>
            <li><strong>الجوال:</strong> ${escapeHtml(input.phone)}</li>
            <li><strong>البريد:</strong> ${escapeHtml(input.email)}</li>
            <li><strong>الحالة:</strong> ${escapeHtml(statusLabel[input.status])}</li>
          </ul>
        </div>`,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
