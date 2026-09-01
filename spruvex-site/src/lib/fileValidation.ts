/**
 * تحقق من نوع الملف الحقيقي عبر "التوقيع" (magic bytes) وليس امتداد الاسم،
 * لأن امتداد الاسم يمكن تزويره بسهولة (ملف .exe باسم receipt.jpg مثلاً).
 */

export const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const SIGNATURES: { mime: string; ext: string; check: (buf: Buffer) => boolean }[] = [
  {
    mime: "image/jpeg",
    ext: "jpg",
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    ext: "png",
    check: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    mime: "image/webp",
    ext: "webp",
    check: (b) =>
      b.length >= 12 &&
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP",
  },
  {
    mime: "application/pdf",
    ext: "pdf",
    check: (b) => b.length >= 4 && b.toString("ascii", 0, 4) === "%PDF",
  },
];

export interface DetectedFileType {
  mime: string;
  ext: string;
}

export function detectFileType(buffer: Buffer): DetectedFileType | null {
  for (const sig of SIGNATURES) {
    if (sig.check(buffer)) return { mime: sig.mime, ext: sig.ext };
  }
  return null;
}

export function isAllowedReceiptType(buffer: Buffer): DetectedFileType | null {
  const detected = detectFileType(buffer);
  if (!detected) return null;
  // إيصالات التحويل: صور فقط (أو PDF لكشف حساب) — لا ملفات تنفيذية أو HTML.
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  return allowed.includes(detected.mime) ? detected : null;
}
