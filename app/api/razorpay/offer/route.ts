import { NextResponse } from "next/server";
import { getTestConfig, getVerifiedPlan } from "@/lib/razorpay-server";
export const runtime = "nodejs";
export async function GET() {
  const config = getTestConfig();
  if (!config) return NextResponse.json({ configured: false });
  try {
    const plan = await getVerifiedPlan(config);
    return NextResponse.json({
      configured: true,
      mode: "test",
      setupAmountPaise: 100,
      recurringAmountPaise: plan.item.amount,
      currency: plan.item.currency,
      cadence: "quarterly",
      firstChargeDelayDays: 1,
      totalCount: config.totalCount,
    });
  } catch {
    return NextResponse.json(
      {
        configured: false,
        error:
          "The configured Razorpay plan does not match ₹699 every three months.",
      },
      { status: 503 },
    );
  }
}
