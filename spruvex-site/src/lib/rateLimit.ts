import type { NextRequest } from "next/server";

/**
 * Rate limiting بسيط في الذاكرة (in-memory sliding window).
 *
 * ⚠️ محدودية معروفة: هذا يعمل فقط ضمن عملية Node.js واحدة. إذا نُشر الموقع
 * على عدة Instances/Serverless functions بالتوازي، كل واحدة تحتفظ بعدّادها
 * الخاص ولا تُشارك الحالة — الحد الفعلي يصبح (الحد × عدد الـ instances).
 * لحماية جادة في إنتاج موزّع: استبدل هذا بـ Redis/Upstash rate limiter.
 * هذا كافٍ حاليًا لمنع إغراق النموذج بطلبات وهمية من IP واحد على استضافة
 * Node.js تقليدية (VPS/Docker instance واحد).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// تنظيف دوري لمنع تسرّب الذاكرة
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * @param key معرّف فريد (مثال: `trial-signup:${ip}`)
 * @param limit عدد الطلبات المسموحة
 * @param windowMs مدة النافذة بالميلي ثانية
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}
