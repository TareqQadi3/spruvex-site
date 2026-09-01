import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { isAdminAuthenticated } from "@/lib/session";
import { getUploadedFile } from "@/lib/repositories/paymentSubmissions";
import { getUploadsDir } from "@/lib/db";

/**
 * يُخدّم ملف الإيصال فقط لمستخدم إدارة موثّق، وفقط عبر معرّف UUID غير قابل
 * للتخمين، وليس برابط عام ثابت تحت public/. لا صلاحية لأي زائر آخر.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { id } = await params;
  const file = getUploadedFile(id);
  if (!file) {
    return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
  }

  // stored_filename هو UUID مولّد داخليًا فقط — لا مسار خارج uploadsDir ممكن.
  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, file.stored_filename);
  if (!filePath.startsWith(uploadsDir)) {
    return NextResponse.json({ error: "مسار غير صالح" }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": file.mime_type,
        "Content-Disposition": `inline; filename="receipt-${id}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "تعذّر قراءة الملف" }, { status: 404 });
  }
}
