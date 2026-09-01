import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { listPaymentSubmissions } from "@/lib/repositories/paymentSubmissions";
import { listTrialSignups } from "@/lib/repositories/trialSignups";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  return NextResponse.json({
    paymentSubmissions: listPaymentSubmissions(),
    trialSignups: listTrialSignups(),
  });
}
