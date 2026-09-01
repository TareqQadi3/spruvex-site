import { NextResponse, type NextRequest } from "next/server";
import { trialSignupSchema } from "@/lib/validation";
import { createTrialSignup } from "@/lib/repositories/trialSignups";
import { isCsrfTokenValid } from "@/lib/csrf";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

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
  createTrialSignup({ restaurantName, phone, email });

  return NextResponse.json({ ok: true });
}
