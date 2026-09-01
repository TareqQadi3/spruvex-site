import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { submissionReviewSchema } from "@/lib/validation";
import { reviewPaymentSubmission } from "@/lib/repositories/paymentSubmissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = submissionReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const updated = reviewPaymentSubmission(
    numericId,
    parsed.data.status,
    "platform-owner",
    parsed.data.notes
  );

  if (!updated) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ submission: updated });
}
