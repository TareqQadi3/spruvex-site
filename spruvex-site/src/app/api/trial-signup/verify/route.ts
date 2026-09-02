import { NextResponse, type NextRequest } from "next/server";
import { trialOtpVerifySchema } from "@/lib/validation";
import { isCsrfTokenValid } from "@/lib/csrf";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { verifySpruvexRTrialOtp } from "@/lib/spruvexR";
import { findTrialSignupByEmail } from "@/lib/repositories/trialSignups";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * وسيط (proxy) من جانب السيرفر فقط لنقطة التحقق الحقيقية بـ spruvex-r
 * (POST /api/v1/auth/register/verify) — نفس المسار الذي يستخدمه أي مستخدم
 * يسجّل ذاتيًا هناك. لا يُستدعى spruvex-r مباشرة من المتصفح أبدًا.
 *
 * عند نجاح التحقق: يستهلك كوكي spruvex_handoff (رمز دخول لمرة واحدة أصدره
 * spruvex-r مع التسجيل) ويمرره للوحة عبر hash الرابط (#handoff=...) —
 * hash لا يُرسل للسيرفرات أبدًا فلا يتسرب بسجلات/بروكسي، وتستهلكه صفحة
 * /auth/callback هناك مرة واحدة ثم تحذفه من الرابط فورًا.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // أشد قليلاً من trial-signup نفسها لأنها الخطوة الحرجة الثانية بنفس التدفق،
  // لكن تسمح بعدة محاولات معقولة لخطأ كتابة بالرمز — spruvex-r نفسه يقفل
  // الرمز بعد 5 محاولات خاطئة كطبقة حماية إضافية.
  const limit = rateLimit(`trial-signup-verify:${ip}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "محاولات كثيرة جدًا، حاول لاحقًا." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = trialOtpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  if (!(await isCsrfTokenValid(parsed.data.csrfToken))) {
    return NextResponse.json({ error: "جلسة غير صالحة، أعد تحميل الصفحة" }, { status: 403 });
  }

  const result = await verifySpruvexRTrialOtp({
    email: parsed.data.email,
    code: parsed.data.code,
  });

  if (result.ok) {
    // بريد الترحيب "best-effort": فشل إرساله لا يُفشل تسجيل الدخول — المستخدم
    // تحقق فعليًا وله dashboardUrl من استجابة التسجيل الأصلية بالفعل.
    const record = findTrialSignupByEmail(parsed.data.email);
    if (record?.dashboard_url) {
      const emailResult = await sendWelcomeEmail({
        to: parsed.data.email,
        restaurantName: record.restaurant_name,
        dashboardUrl: record.dashboard_url,
      });
      if (!emailResult.ok) {
        console.error(
          `[trial-signup/verify] welcome email failed for ${parsed.data.email}: ${emailResult.message}`
        );
      }
    } else {
      console.error(
        `[trial-signup/verify] no local record/dashboard_url found for ${parsed.data.email} — welcome email skipped`
      );
    }

    // الدخول التلقائي: الكوكي httpOnly يحمل رمز handoff من خطوة التسجيل —
    // نمرره للوحة عبر hash الرابط (لا يُرسل hash عبر الشبكة أبدًا)، ونحذف
    // الكوكي هنا فورًا (استُهلك). لو غاب الكوكي (تسجيل قديم قبل الميزة) نرجع
    // للرابط العام كما كان — لا كسر للأثرية.
    const handoffToken = req.cookies.get("spruvex_handoff")?.value;
    const baseDashboardUrl = record?.dashboard_url ?? "https://spruvex-r-dashboard.onrender.com";
    const redirectUrl = handoffToken
      ? `${baseDashboardUrl}/auth/callback#handoff=${encodeURIComponent(handoffToken)}`
      : `${baseDashboardUrl}/login`;

    const res = NextResponse.json({ ok: true, redirectUrl });
    if (handoffToken) {
      res.cookies.delete("spruvex_handoff");
    }
    return res;
  }

  if (result.reason === "invalid_code") {
    return NextResponse.json({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" }, { status: 400 });
  }

  // لا نكشف تفاصيل تقنية (شبكة/تهيئة/خطأ سيرفر) للمستخدم — رسالة عامة فقط،
  // والتفاصيل الحقيقية بالسجلات لمتابعة الفريق.
  console.error(
    `[trial-signup/verify] spruvex-r verify failed for ${parsed.data.email}: ` +
      `reason=${result.reason} status=${result.status ?? "-"} message=${result.message ?? "-"}`
  );
  return NextResponse.json(
    { error: "تعذّر التحقق حاليًا، حاول مرة أخرى بعد قليل" },
    { status: 502 }
  );
}
