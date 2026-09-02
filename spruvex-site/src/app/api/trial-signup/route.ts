import { NextResponse, type NextRequest } from "next/server";
import { trialSignupSchema } from "@/lib/validation";
import {
  createTrialSignup,
  findTrialSignupByEmail,
  markTrialSignupDuplicate,
  markTrialSignupManualReview,
  markTrialSignupProvisioned,
} from "@/lib/repositories/trialSignups";
import { isCsrfTokenValid } from "@/lib/csrf";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { createSpruvexRTrial } from "@/lib/spruvexR";
import { sendAdminSignupAlertEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`trial-signup:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "طلبات كثيرة جدًا، حاول لاحقًا." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = trialSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  if (!(await isCsrfTokenValid(parsed.data.csrfToken))) {
    return NextResponse.json({ error: "جلسة غير صالحة، أعد تحميل الصفحة" }, { status: 403 });
  }

  const { restaurantName, businessType, phone, email, password } = parsed.data;

  async function notifyAdmin(status: "provisioned" | "manual_review" | "duplicate") {
    const result = await sendAdminSignupAlertEmail({ restaurantName, phone, email, status });
    if (!result.ok) {
      console.error(`[trial-signup] admin alert email failed for ${email}: ${result.message}`);
    }
  }

  // فحص تكرار محلي قبل حتى استدعاء spruvex-r: لو هذا البريد لديه بالفعل حساب
  // فعلي (provisioned) من طلب سابق، لا داعي لجولة شبكة جديدة ولا لسجل محلي
  // مكرر — ولا تناسب هنا رسالة "سيتم التفعيل خلال ساعات" المُضلِّلة لأن
  // الحساب موجود فعلًا. هذا فحص إضافي محلي، وليس بديلاً عن قيد تفرّد الجوال
  // الحقيقي بجانب spruvex-r (الذي يبقى المرجع الحاسم ضد أي تلاعب/سباق).
  const existing = findTrialSignupByEmail(email);
  if (existing?.status === "provisioned") {
    await notifyAdmin("duplicate");
    return NextResponse.json({ ok: true, provisioned: false, alreadyRegistered: true });
  }

  // سجل احتياطي/متابعة مبيعات محلي — يبقى دائمًا بغض النظر عن نجاح الخطوة
  // التالية. لا كلمة مرور هنا عمدًا — createTrialSignup لا يقبلها أصلًا.
  const localRecord = createTrialSignup({ restaurantName, phone, email, businessType });

  const provisioning = await createSpruvexRTrial({ restaurantName, phone, email, password, businessType });

  if (provisioning.ok) {
    markTrialSignupProvisioned(localRecord.id, {
      tenantId: provisioning.tenantId,
      dashboardUrl: provisioning.dashboardUrl,
    });
    await notifyAdmin("provisioned");

    // رمز الدخول لمرة واحدة (auto sign-in بعد التحقق) — يُخزَّن بكوكي
    // httpOnly قصير العمر بدل إرساله بجسم الاستجابة (هو مؤهّل دخول كامل):
    // المتصفح لا يستطيع قراءته، ولا يصل للوحة إلا عبر تمرير الكوكي نفسه
    // لنقطة التحقق أدناه التي تنقله مرة واحدة للوحة التحكم ثم تُلغيه هنا.
    if (provisioning.handoffToken) {
      const res = NextResponse.json({
        ok: true,
        provisioned: true,
        email: provisioning.email,
        dashboardUrl: provisioning.dashboardUrl,
      });
      res.cookies.set("spruvex_handoff", provisioning.handoffToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });
      return res;
    }

    return NextResponse.json({
      ok: true,
      provisioned: true,
      email: provisioning.email,
      dashboardUrl: provisioning.dashboardUrl,
    });
  }

  // 409 من spruvex-r (بعد استنفاد إعادة المحاولات للأخطاء العابرة أعلاه) يعني
  // جوال أو بريد مسجّل مسبقًا فعليًا — ليست حالة "تحتاج مراجعة يدوية"، بل
  // "لديك حساب بالفعل". تُعلَّم بحالة مختلفة وتُعرض رسالة دقيقة للمستخدم.
  if (provisioning.reason === "duplicate_phone") {
    markTrialSignupDuplicate(localRecord.id);
    await notifyAdmin("duplicate");
    return NextResponse.json({ ok: true, provisioned: false, alreadyRegistered: true });
  }

  // أي فشل حقيقي آخر من spruvex-r (شبكة/تهيئة/5xx) بعد استنفاد المحاولات —
  // لا يُفشل تجربة المستخدم. السجل المحلي يبقى، فقط يُعلَّم لمراجعة يدوية،
  // ويُسجَّل الخطأ بوضوح بالسجلات (server logs) لمتابعته من الفريق.
  markTrialSignupManualReview(localRecord.id);
  console.error(
    `[trial-signup] spruvex-r provisioning failed for signup #${localRecord.id} (${email}): ` +
      `reason=${provisioning.reason} status=${provisioning.status ?? "-"} message=${provisioning.message ?? "-"}`
  );
  await notifyAdmin("manual_review");

  return NextResponse.json({ ok: true, provisioned: false });
}
