/**
 * عميل استدعاء spruvex-r — للاستخدام من جانب السيرفر فقط (Route Handlers).
 *
 * ⚠️ لا تستورد هذا الملف من أي مكوّن "use client" أبدًا: SPRUVEX_R_API_URL
 * و SPRUVEX_SITE_API_KEY يجب ألا يصلا لحزمة المتصفح إطلاقًا. لأننا لا نقرأهما
 * إلا عبر process.env هنا (وليس عبر NEXT_PUBLIC_*)، Next.js لا يضمّنهما في
 * الحزمة العميلة طالما هذا الملف لا يُستورد إلا من Route Handlers.
 */

const API_PREFIX = "/api/v1";
const REQUEST_TIMEOUT_MS = 10_000;

class SpruvexRConfigError extends Error {}

function getBaseUrl(): string {
  const url = process.env.SPRUVEX_R_API_URL;
  if (!url) throw new SpruvexRConfigError("SPRUVEX_R_API_URL غير مضبوط في متغيرات البيئة");
  return url.replace(/\/+$/, "");
}

function getSiteApiKey(): string {
  const key = process.env.SPRUVEX_SITE_API_KEY;
  if (!key) throw new SpruvexRConfigError("SPRUVEX_SITE_API_KEY غير مضبوط في متغيرات البيئة");
  return key;
}

type FetchOutcome =
  | { kind: "response"; status: number; body: Record<string, unknown> }
  | { kind: "config_error"; message: string }
  | { kind: "network_error"; message: string };

async function postJson(
  path: string,
  payload: unknown,
  headers: Record<string, string> = {}
): Promise<FetchOutcome> {
  let url: string;
  try {
    url = `${getBaseUrl()}${API_PREFIX}${path}`;
  } catch (err) {
    return { kind: "config_error", message: err instanceof Error ? err.message : String(err) };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    let body: Record<string, unknown> = {};
    try {
      body = (await res.json()) as Record<string, unknown>;
    } catch {
      // استجابة بلا JSON (مثلاً صفحة خطأ من بروكسي أمامي) — تُعامل كخطأ سيرفر عبر status فقط.
    }
    return { kind: "response", status: res.status, body };
  } catch (err) {
    return {
      kind: "network_error",
      message: err instanceof Error ? err.message : "unknown network error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function isRetryableOutcome(outcome: FetchOutcome): boolean {
  if (outcome.kind === "network_error") return true;
  if (outcome.kind === "response" && outcome.status >= 500) return true;
  return false;
}

export interface CreateSpruvexRTrialInput {
  restaurantName: string;
  phone: string;
  email: string;
}

export type CreateSpruvexRTrialResult =
  | {
      ok: true;
      tenantId: string;
      email: string;
      trialEndsAt: string;
      dashboardUrl: string;
      devOtp?: string;
    }
  | {
      ok: false;
      /** لأغراض تسجيل السبب فقط بالسجلات — لا يُعرض حرفيًا للمستخدم أبدًا. */
      reason: "duplicate_phone" | "invalid_config" | "network" | "server_error";
      status?: number;
      message?: string;
    };

const RETRYABLE_DELAYS_MS = [400, 900];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST /api/v1/public/trial-signup — ينشئ Tenant تجريبي فعلي بـ spruvex-r.
 *
 * يعيد المحاولة تلقائيًا (بحد أقصى محاولتين إضافيتين) فقط عند فشل عابر محتمل
 * (شبكة/انقطاع، أو خطأ 5xx من السيرفر) — وليس عند 401 (تهيئة خاطئة، إعادة
 * المحاولة لن تُصلحها) ولا 409 (جوال/بريد مسجّل مسبقًا، إعادة المحاولة تكرار
 * غير مجدٍ). الهدف: لا تُعرض رسالة "يحتاج مراجعة يدوية" للمستخدم إلا بعد فشل
 * حقيقي مؤكَّد، وليس عند أول عثرة شبكة مؤقتة.
 * إعادة المحاولة آمنة هنا تحديدًا لأن provisionTenant محمي بقيد تفرّد الجوال
 * بجانب spruvex-r: لو المحاولة الأولى نجحت فعلًا لكن الاستجابة ضاعت شبكيًا،
 * ستُرجع المحاولة الثانية 409 (duplicate_phone) بدل تكرار إنشاء Tenant.
 */
export async function createSpruvexRTrial(
  input: CreateSpruvexRTrialInput
): Promise<CreateSpruvexRTrialResult> {
  let outcome = await postJson("/public/trial-signup", input, {
    "x-spruvex-site-key": safeSiteApiKeyOrEmpty(),
  });

  for (const delay of RETRYABLE_DELAYS_MS) {
    if (!isRetryableOutcome(outcome)) break;
    await sleep(delay);
    outcome = await postJson("/public/trial-signup", input, {
      "x-spruvex-site-key": safeSiteApiKeyOrEmpty(),
    });
  }

  if (outcome.kind === "config_error") {
    return { ok: false, reason: "invalid_config", message: outcome.message };
  }
  if (outcome.kind === "network_error") {
    return { ok: false, reason: "network", message: outcome.message };
  }

  const { status, body } = outcome;
  if (status === 201) {
    return {
      ok: true,
      tenantId: String(body.tenantId),
      email: String(body.email),
      trialEndsAt: String(body.trialEndsAt),
      dashboardUrl: String(body.dashboardUrl),
      devOtp: typeof body.devOtp === "string" ? body.devOtp : undefined,
    };
  }
  if (status === 409) {
    return { ok: false, reason: "duplicate_phone", status, message: String(body.message ?? "") };
  }
  if (status === 401) {
    // مفتاح API غير صحيح/غير مطابق لما بجانب spruvex-r — خطأ تهيئة، ليس خطأ من المستخدم.
    return { ok: false, reason: "invalid_config", status, message: String(body.message ?? "") };
  }
  return { ok: false, reason: "server_error", status, message: String(body.message ?? "") };
}

export type VerifySpruvexRTrialOtpResult =
  | { ok: true }
  | {
      ok: false;
      reason: "invalid_code" | "invalid_config" | "network" | "server_error";
      status?: number;
      message?: string;
    };

/**
 * POST /api/v1/auth/register/verify — نفس نقطة التحقق التي يستخدمها أي
 * مستخدم يسجّل ذاتيًا بـ spruvex-r. لا تحتاج مفتاح API (مسار عام أصلاً هناك)،
 * لكن نستدعيها من السيرفر فقط حتى لا نُظهر SPRUVEX_R_API_URL بالمتصفح.
 */
export async function verifySpruvexRTrialOtp(input: {
  email: string;
  code: string;
}): Promise<VerifySpruvexRTrialOtpResult> {
  const outcome = await postJson("/auth/register/verify", input);

  if (outcome.kind === "config_error") {
    return { ok: false, reason: "invalid_config", message: outcome.message };
  }
  if (outcome.kind === "network_error") {
    return { ok: false, reason: "network", message: outcome.message };
  }

  const { status, body } = outcome;
  if (status === 200) return { ok: true };
  if (status === 400 || status === 401) {
    return { ok: false, reason: "invalid_code", status, message: String(body.message ?? "") };
  }
  return { ok: false, reason: "server_error", status, message: String(body.message ?? "") };
}

export type ResendSpruvexRTrialOtpResult =
  | { ok: true }
  | { ok: false; reason: "invalid_config" | "network" | "server_error"; message?: string };

/** POST /api/v1/auth/register/resend-otp — يرجع 200 دائمًا (لا يكشف وجود الحساب من عدمه). */
export async function resendSpruvexRTrialOtp(email: string): Promise<ResendSpruvexRTrialOtpResult> {
  const outcome = await postJson("/auth/register/resend-otp", { email });

  if (outcome.kind === "config_error") {
    return { ok: false, reason: "invalid_config", message: outcome.message };
  }
  if (outcome.kind === "network_error") {
    return { ok: false, reason: "network", message: outcome.message };
  }

  if (outcome.status === 200) return { ok: true };
  return { ok: false, reason: "server_error", message: String(outcome.body.message ?? "") };
}

/** لا نريد أن يفشل postJson بـ throw لو المفتاح غير مضبوط — نمرر قيمة فارغة ونترك fetch يفشل بوضوح (401) بدل تعقيد إضافي. */
function safeSiteApiKeyOrEmpty(): string {
  try {
    return getSiteApiKey();
  } catch {
    return "";
  }
}
