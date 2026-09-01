import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * طبقة قاعدة بيانات بسيطة (SQLite) لهذه المرحلة فقط.
 *
 * ⚠️ ملاحظة نشر مهمة: SQLite هنا ملف محلي على القرص (data/spruvex-site.db).
 * هذا يعمل بشكل ممتاز على استضافة Node.js دائمة (VPS / Docker) مع Volume دائم،
 * لكنه **لا يعمل بشكل موثوق على منصات Serverless عديمة الحالة مثل Vercel**
 * (نظام الملفات مؤقت هناك). عند الانتقال لإنتاج فعلي على Serverless، استبدل
 * هذا الملف باتصال Postgres (مثلاً عبر Prisma) — الجداول والدوال هنا مصممة
 * عمدًا بواجهة (repository functions) تسهّل هذا الاستبدال دون تغيير الصفحات
 * أو نقاط الـ API التي تستدعيها.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "spruvex-site.db");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

declare global {
  var __spruvexDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS trial_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
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
      status TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      reviewed_at TEXT,
      reviewed_by TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_payment_submissions_status ON payment_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_trial_signups_created ON trial_signups(created_at);
  `);
  return db;
}

/** اتصال واحد مُعاد استخدامه (singleton) لتفادي فتح ملفات SQLite متعددة في dev/hot-reload. */
export function getDb(): Database.Database {
  if (!global.__spruvexDb) {
    global.__spruvexDb = createConnection();
  }
  return global.__spruvexDb;
}
