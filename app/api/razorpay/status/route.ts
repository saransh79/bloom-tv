import { NextRequest, NextResponse } from "next/server";
import {
  activeSubscription,
  getTestConfig,
  razorpayRequest,
  readSession,
  type Subscription,
} from "@/lib/razorpay-server";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const config = getTestConfig();
  if (!config) return NextResponse.json({ configured: false, active: false });
  const id = readSession(
    request.cookies.get("bloom_verified_subscription")?.value,
    config.cookieSecret,
  );
  if (!id) return NextResponse.json({ configured: true, active: false });
  try {
    const subscription = await razorpayRequest<Subscription>(
      `/subscriptions/${id}`,
      config,
    );
    return NextResponse.json({
      configured: true,
      active: activeSubscription(subscription, config.planId),
    });
  } catch {
    return NextResponse.json(
      { configured: true, active: false },
      { status: 503 },
    );
  }
}
