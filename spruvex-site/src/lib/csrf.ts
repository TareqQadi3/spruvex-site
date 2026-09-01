import crypto from "node:crypto";
import { cookies } from "next/headers";
import { CSRF_COOKIE } from "./csrfConstants";

export { CSRF_COOKIE };
export { generateCsrfToken } from "./csrfEdge";

/**
 * حماية CSRF بنمط double-submit عبر كوكي httpOnly:
 * middleware.ts يولّد قيمة عشوائية ويضعها في كوكي httpOnly عند أول زيارة.
 * الصفحات (Server Components) تقرأ نفس القيمة وتحقنها في حقل مخفي بالنموذج.
 * عند الإرسال، نقارن الحقل المخفي بقيمة الكوكي — طلب مزوّر من موقع آخر لا
 * يملك وصولاً لقراءة الكوكي فلا يقدر يعبّئ الحقل بالقيمة الصحيحة.
 */
export async function getCsrfTokenForForm(): Promise<string> {
  const store = await cookies();
  return store.get(CSRF_COOKIE)?.value ?? "";
}

export async function isCsrfTokenValid(submitted: string | undefined | null): Promise<boolean> {
  if (!submitted) return false;
  const store = await cookies();
  const cookieValue = store.get(CSRF_COOKIE)?.value;
  if (!cookieValue) return false;
  const a = Buffer.from(submitted);
  const b = Buffer.from(cookieValue);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
