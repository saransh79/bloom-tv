import { NextRequest, NextResponse } from "next/server";
import {
  activeSubscription,
  getTestConfig,
  razorpayRequest,
  readSession,
  verifyCheckoutSignature,
  type Subscription,
} from "@/lib/razorpay-server";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const config = getTestConfig();
  if (!config)
    return NextResponse.json(
      { error: "Test checkout is not configured." },
      { status: 503 },
    );
  const pending = readSession(
    request.cookies.get("bloom_pending_subscription")?.value,
    config.cookieSecret,
  );
  if (!pending)
    return NextResponse.json(
      { error: "Checkout session expired." },
      { status: 401 },
    );
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const paymentId = body.razorpay_payment_id,
    subscriptionId = body.razorpay_subscription_id,
    signature = body.razorpay_signature;
  if (
    typeof paymentId !== "string" ||
    typeof subscriptionId !== "string" ||
    typeof signature !== "string" ||
    subscriptionId !== pending ||
    !verifyCheckoutSignature(paymentId, pending, signature, config.keySecret)
  )
    return NextResponse.json(
      { error: "Checkout verification failed." },
      { status: 400 },
    );
  try {
    const subscription = await razorpayRequest<Subscription>(
      `/subscriptions/${pending}`,
      config,
    );
    if (!activeSubscription(subscription, config.planId))
      return NextResponse.json(
        {
          error: "Subscription is not active yet. Please check again shortly.",
        },
        { status: 409 },
      );
    const response = NextResponse.json({ active: true });
    response.cookies.set(
      "bloom_verified_subscription",
      request.cookies.get("bloom_pending_subscription")!.value,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      },
    );
    response.cookies.delete("bloom_pending_subscription");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not verify subscription status." },
      { status: 502 },
    );
  }
}
