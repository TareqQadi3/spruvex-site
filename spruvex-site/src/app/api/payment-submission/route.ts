import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { paymentSubmissionSchema } from "@/lib/validation";
import { createPaymentSubmission, saveUploadedFile } from "@/lib/repositories/paymentSubmissions";
import { isCsrfTokenValid } from "@/lib/csrf";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { isAllowedReceiptType, MAX_RECEIPT_SIZE_BYTES } from "@/lib/fileValidation";
import { getUploadsDir } from "@/lib/db";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`payment-submission:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "طلبات كثيرة جدًا، حاول لاحقًا." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const raw = {
    restaurantName: formData.get("restaurantName")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    planId: formData.get("planId")?.toString() ?? "",
    billingCycle: formData.get("billingCycle")?.toString() ?? "",
    transferReference: formData.get("transferReference")?.toString() ?? "",
    discountCode: formData.get("discountCode")?.toString() ?? "",
    csrfToken: formData.get("csrfToken")?.toString() ?? "",
  };

  const parsed = paymentSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  if (!(await isCsrfTokenValid(parsed.data.csrfToken))) {
    return NextResponse.json({ error: "جلسة غير صالحة، أعد تحميل الصفحة" }, { status: 403 });
  }

  const file = formData.get("receipt");
  const hasReference = Boolean(parsed.data.transferReference);
  const hasFile = file instanceof File && file.size > 0;

  if (!hasReference && !hasFile) {
    return NextResponse.json(
      { error: "أدخل رقم عملية التحويل أو ارفع صورة الإيصال" },
      { status: 400 }
    );
  }

  let receiptFileId: string | null = null;

  if (hasFile) {
    const uploadedFile = file as File;
    if (uploadedFile.size > MAX_RECEIPT_SIZE_BYTES) {
      return NextResponse.json({ error: "حجم الملف أكبر من 5 ميجابايت" }, { status: 400 });
    }
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    const detected = isAllowedReceiptType(buffer);
    if (!detected) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم (صور JPG/PNG/WEBP أو PDF فقط)" },
        { status: 400 }
      );
    }

    // اسم ملف عشوائي غير قابل للتخمين، بلا امتداد قابل للتنفيذ، خارج مجلد public/
    const uploadsDir = getUploadsDir();
    await fs.mkdir(uploadsDir, { recursive: true });
    const storedFilename = `${crypto.randomUUID()}.${detected.ext}`;
    const storedPath = path.join(/* turbopackIgnore: true */ uploadsDir, storedFilename);
    await fs.writeFile(storedPath, buffer, { mode: 0o600 });

    const record = saveUploadedFile({
      originalName: uploadedFile.name.slice(0, 200),
      mimeType: detected.mime,
      sizeBytes: uploadedFile.size,
      storedFilename,
    });
    receiptFileId = record.id;
  }

  createPaymentSubmission({
    restaurantName: parsed.data.restaurantName,
    phone: parsed.data.phone,
    planId: parsed.data.planId,
    billingCycle: parsed.data.billingCycle,
    transferReference: parsed.data.transferReference || null,
    receiptFileId,
    discountCode: parsed.data.discountCode || null,
  });

  return NextResponse.json({ ok: true });
}
