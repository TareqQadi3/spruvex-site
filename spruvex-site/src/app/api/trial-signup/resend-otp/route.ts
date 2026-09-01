import { NextResponse, type NextRequest } from "next/server";
import { trialOtpResendSchema } from "@/lib/validation";
import { isCsrfTokenValid } from "@/lib/csrf";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { resendSpruvexRTrialOtp } from "@/lib/spruvexR";

/** وسيط سيرفر فقط لـ POST /api/v1/auth/register/resend-otp بـ spruvex-r. */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`trial-signup-resend-otp:${ip}`, 5, 10 * 60 * 1000);
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

  const parsed = trialOtpResendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  if (!(await isCsrfTokenValid(parsed.data.csrfToken))) {
    return NextResponse.json({ error: "جلسة غير صالحة، أعد تحميل الصفحة" }, { status: 403 });
  }

  const result = await resendSpruvexRTrialOtp(parsed.data.email);
  if (!result.ok) {
    console.error(
      `[trial-signup/resend-otp] spruvex-r resend failed for ${parsed.data.email}: ` +
        `reason=${result.reason} message=${result.message ?? "-"}`
    );
  }

  // نُرجع نجاحًا دائمًا بغض النظر عن الحالة — نفس مبدأ عدم كشف وجود الحساب
  // من عدمه المتّبع أصلاً بنقطة resend-otp نفسها في spruvex-r.
  return NextResponse.json({ ok: true });
}
