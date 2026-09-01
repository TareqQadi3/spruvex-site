import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * طبقة قاعدة بيانات بسيطة (SQLite) لهذه المرحلة فقط.
 *
 * ⚠️ ملاحظة نشر مهمة: SQLite هنا ملف محلي على القرص (data/spruvex-site.db).
 * هذا يعمل بشكل ممتاز على استضافة Node.js دائمة (VPS / Docker / Render Web
 * Service مع Persistent Disk) لكنه **لا يعمل بشكل موثوق على منصات Serverless
 * عديمة الحالة مثل Vercel** (نظام الملفات هناك مؤقت). عند الانتقال لإنتاج
 * فعلي على Serverless، استبدل هذا الملف باتصال Postgres (مثلاً عبر Prisma) —
 * الجداول والدوال هنا مصممة عمدًا بواجهة (repository functions) تسهّل هذا
 * الاستبدال دون تغيير الصفحات أو نقاط الـ API التي تستدعيها.
 *
 * المسار قابل للضبط عبر DATA_DIR (مطلوب على Render: يُضبط ليطابق mountPath
 * الخاص بالـ Persistent Disk في render.yaml بالضبط) — يرجع افتراضيًا لمجلد
 * data/ بجذر المشروع للتطوير المحلي.
 */

// ⚠️ لا أي I/O هنا على مستوى الوحدة (module scope) — Next.js يستورد ملفات
// الـ API routes وقت "Collecting page data" أثناء next build لفحصها، وليس
// فقط وقت الطلب الفعلي. أي كود يعمل هنا مباشرة (بدل داخل دالة) يُنفَّذ حتى
// أثناء البناء — حيث DATA_DIR (خصوصًا مسار قرص Render الدائم /var/data) قد
// لا يكون موجودًا أو قابلًا للكتابة بعد (القرص يُركَّب فقط على الخدمة الفعلية
// وقت التشغيل، وليس أثناء حاوية البناء). لهذا كل إنشاء مجلد/فتح اتصال مؤجَّل
// لدالة getDb() فقط، التي لا تُستدعى إلا من داخل معالجات الطلبات (route handlers).
function resolveDataDir(): string {
  return process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");
}

export function getUploadsDir(): string {
  return path.join(resolveDataDir(), "uploads");
}

declare global {
  var __spruvexDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const dataDir = resolveDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(path.join(dataDir, "uploads"), { recursive: true });

  const db = new Database(path.join(dataDir, "spruvex-site.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS trial_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      -- 'new' لحظة الإدخال المحلي فقط (تُستبدل بأحد التاليين بنفس الطلب):
      -- 'provisioned'    = نجح إنشاء Tenant فعلي في spruvex-r (tenant_id/dashboard_url معبّأة)
      -- 'manual_review'  = فشل استدعاء spruvex-r (شبكة/5xx/جوال مكرر) — يحتاج مراجعة يدوية من الفريق
      status TEXT NOT NULL DEFAULT 'new',
      -- معرّف Tenant الراجع من POST {SPRUVEX_R_API_URL}/api/v1/public/trial-signup — NULL إن لم يُنشأ بعد.
      tenant_id TEXT,
      -- رابط لوحة تحكم هذا المستأجر بـ spruvex-r — NULL إن لم يُنشأ بعد.
      dashboard_url TEXT,
      -- نوع النشاط (مطعم/كوفي/فود ترك/مقهى حلويات/أخرى) — للعرض والتصنيف محليًا فقط.
      business_type TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS uploaded_files (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      stored_filename TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      billing_cycle TEXT NOT NULL,
      amount_halalas INTEGER NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
      transfer_reference TEXT,
      provider_ref TEXT,
      receipt_file_id TEXT REFERENCES uploaded_files(id),
      -- كود الخصم المُدخَل (إن وُجد وصحيحًا) — للعرض بلوحة الإدارة فقط؛
      -- amount_halalas بالأعلى محسوب بالفعل بعد تطبيق الخصم من جانب السيرفر.
      discount_code TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      reviewed_at TEXT,
      reviewed_by TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_payment_submissions_status ON payment_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_trial_signups_created ON trial_signups(created_at);
  `);

  // ترقية بسيطة لقواعد بيانات محلية أُنشئت قبل إضافة عمودي tenant_id/dashboard_url —
  // لا أداة migrations رسمية بهذه المرحلة، فهذا فحص idempotent صغير بدلها.
  const trialSignupColumns = db
    .prepare("PRAGMA table_info(trial_signups)")
    .all() as { name: string }[];
  const existingColumns = new Set(trialSignupColumns.map((c) => c.name));
  if (!existingColumns.has("tenant_id")) {
    db.exec("ALTER TABLE trial_signups ADD COLUMN tenant_id TEXT");
  }
  if (!existingColumns.has("dashboard_url")) {
    db.exec("ALTER TABLE trial_signups ADD COLUMN dashboard_url TEXT");
  }
  if (!existingColumns.has("business_type")) {
    db.exec("ALTER TABLE trial_signups ADD COLUMN business_type TEXT");
  }

  const paymentSubmissionColumns = db
    .prepare("PRAGMA table_info(payment_submissions)")
    .all() as { name: string }[];
  if (!paymentSubmissionColumns.some((c) => c.name === "discount_code")) {
    db.exec("ALTER TABLE payment_submissions ADD COLUMN discount_code TEXT");
  }

  return db;
}

/** اتصال واحد مُعاد استخدامه (singleton) لتفادي فتح ملفات SQLite متعددة في dev/hot-reload. */
export function getDb(): Database.Database {
  if (!global.__spruvexDb) {
    global.__spruvexDb = createConnection();
  }
  return global.__spruvexDb;
}
