import { NextResponse } from "next/server";
import {
  getTestConfig,
  getVerifiedPlan,
  razorpayRequest,
  signSession,
  type Subscription,
} from "@/lib/razorpay-server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const config = getTestConfig();
  if (!config)
    return NextResponse.json(
      { error: "Test checkout is not configured." },
      { status: 503 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("guardianConsent" in body) ||
    body.guardianConsent !== true
  )
    return NextResponse.json(
      { error: "Guardian consent is required." },
      { status: 400 },
    );
  try {
    const plan = await getVerifiedPlan(config);
    const firstChargeAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    const subscription = await razorpayRequest<Subscription>(
      "/subscriptions",
      config,
      "POST",
      {
        plan_id: config.planId,
        total_count: config.totalCount,
        quantity: 1,
        customer_notify: true,
        start_at: firstChargeAt,
        addons: [
          {
            item: {
              name: "One-time access setup",
              amount: 100,
              currency: "INR",
            },
          },
        ],
      },
    );
    if (
      !/^sub_[A-Za-z0-9]{8,40}$/.test(subscription.id) ||
      subscription.plan_id !== config.planId
    )
      throw new Error("Unexpected subscription response");
    const response = NextResponse.json({
      keyId: config.keyId,
      subscriptionId: subscription.id,
      plan: {
        amountPaise: plan.item.amount,
        currency: plan.item.currency,
        period: plan.period,
        interval: plan.interval,
        totalCount: config.totalCount,
        firstChargeAt: subscription.start_at ?? firstChargeAt,
        upfrontAmountPaise: 100,
      },
    });
    response.cookies.set(
      "bloom_pending_subscription",
      signSession(subscription.id, config.cookieSecret),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      },
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not start Razorpay test checkout." },
      { status: 502 },
    );
  }
}
