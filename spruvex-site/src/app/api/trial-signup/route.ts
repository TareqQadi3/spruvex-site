import { NextResponse, type NextRequest } from "next/server";
import { trialSignupSchema } from "@/lib/validation";
import {
  createTrialSignup,
  markTrialSignupManualReview,
  markTrialSignupProvisioned,
} from "@/lib/repositories/trialSignups";
import { isCsrfTokenValid } from "@/lib/csrf";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { createSpruvexRTrial } from "@/lib/spruvexR";

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

  const { restaurantName, phone, email } = parsed.data;

  // سجل احتياطي/متابعة مبيعات محلي — يبقى دائمًا بغض النظر عن نجاح الخطوة التالية.
  const localRecord = createTrialSignup({ restaurantName, phone, email });

  const provisioning = await createSpruvexRTrial({ restaurantName, phone, email });

  if (provisioning.ok) {
    markTrialSignupProvisioned(localRecord.id, {
      tenantId: provisioning.tenantId,
      dashboardUrl: provisioning.dashboardUrl,
    });
    return NextResponse.json({
      ok: true,
      provisioned: true,
      email: provisioning.email,
      dashboardUrl: provisioning.dashboardUrl,
    });
  }

  // أي فشل من spruvex-r (شبكة/تهيئة/5xx/جوال مكرر 409) لا يُفشل تجربة
  // المستخدم — السجل المحلي يبقى، فقط يُعلَّم لمراجعة يدوية، ويُسجَّل الخطأ
  // بوضوح بالسجلات (server logs) لمتابعته من الفريق.
  markTrialSignupManualReview(localRecord.id);
  console.error(
    `[trial-signup] spruvex-r provisioning failed for signup #${localRecord.id} (${email}): ` +
      `reason=${provisioning.reason} status=${provisioning.status ?? "-"} message=${provisioning.message ?? "-"}`
  );

  return NextResponse.json({ ok: true, provisioned: false });
}
