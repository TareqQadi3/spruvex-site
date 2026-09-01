import { CSRF_COOKIE } from "./csrfConstants";

/**
 * نسخة متوافقة مع Edge Runtime (middleware.ts) — تستخدم Web Crypto API
 * العالمية بدل وحدة "node:crypto" غير المتوفرة هناك.
 */
export function generateCsrfToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export { CSRF_COOKIE };
