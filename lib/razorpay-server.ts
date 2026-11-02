import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.razorpay.com/v1";
const subscriptionPattern = /^sub_[A-Za-z0-9]{8,40}$/;
const planPattern = /^plan_[A-Za-z0-9]{8,40}$/;
const paymentPattern = /^pay_[A-Za-z0-9]{8,40}$/;

export function getTestConfig() {
  const {
    RAZORPAY_MODE,
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    RAZORPAY_PLAN_ID,
    RAZORPAY_TOTAL_COUNT,
    RAZORPAY_COOKIE_SECRET,
  } = process.env;
  const totalCount = Number(RAZORPAY_TOTAL_COUNT);
  if (
    RAZORPAY_MODE !== "test" ||
    !RAZORPAY_KEY_ID?.startsWith("rzp_test_") ||
    !RAZORPAY_KEY_SECRET ||
    !RAZORPAY_PLAN_ID ||
    !planPattern.test(RAZORPAY_PLAN_ID) ||
    totalCount !== 10 ||
    !RAZORPAY_COOKIE_SECRET ||
    RAZORPAY_COOKIE_SECRET.length < 32
  )
    return null;
  return {
    keyId: RAZORPAY_KEY_ID,
    keySecret: RAZORPAY_KEY_SECRET,
    planId: RAZORPAY_PLAN_ID,
    totalCount,
    cookieSecret: RAZORPAY_COOKIE_SECRET,
  };
}
export async function razorpayRequest<T>(
  path: string,
  config: NonNullable<ReturnType<typeof getTestConfig>>,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Razorpay API failed: ${response.status}`);
  return response.json() as Promise<T>;
}
export type Subscription = {
  id: string;
  plan_id: string;
  status: string;
  current_end: number | null;
  start_at: number | null;
  total_count: number;
};
export type Plan = {
  id: string;
  period: string;
  interval: number;
  item: { amount: number; currency: string; name: string };
};
export async function getVerifiedPlan(
  config: NonNullable<ReturnType<typeof getTestConfig>>,
) {
  const plan = await razorpayRequest<Plan>(`/plans/${config.planId}`, config);
  if (
    plan.id !== config.planId ||
    plan.item.currency !== "INR" ||
    plan.item.amount !== 69900 ||
    plan.period !== "quarterly" ||
    plan.interval !== 1
  )
    throw new Error("Plan must be INR 699 every three months");
  return plan;
}
export function signSession(subscriptionId: string, secret: string) {
  const value = `${subscriptionId}.${Date.now()}`;
  const mac = createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${mac}`;
}
export function readSession(value: string | undefined, secret: string) {
  if (!value) return null;
  const match = /^(sub_[A-Za-z0-9]{8,40})\.(\d{13})\.([a-f0-9]{64})$/.exec(
    value,
  );
  if (!match) return null;
  const body = `${match[1]}.${match[2]}`;
  const expected = createHmac("sha256", secret).update(body).digest();
  const supplied = Buffer.from(match[3], "hex");
  if (
    !timingSafeEqual(expected, supplied) ||
    Date.now() - Number(match[2]) > 30 * 24 * 60 * 60 * 1000
  )
    return null;
  return match[1];
}
export function verifyCheckoutSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string,
  secret: string,
) {
  if (
    !paymentPattern.test(paymentId) ||
    !subscriptionPattern.test(subscriptionId) ||
    !/^[a-f0-9]{64}$/i.test(signature)
  )
    return false;
  const expected = createHmac("sha256", secret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export function activeSubscription(s: Subscription, planId: string) {
  return (
    s.plan_id === planId &&
    ["authenticated", "active"].includes(s.status) &&
    (!s.current_end || s.current_end * 1000 > Date.now())
  );
}
