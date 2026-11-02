export type CheckoutResult = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

/** Razorpay can report an authorized subscription shortly after checkout closes. */
export async function verifyCheckoutWithPolling(result: CheckoutResult) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const response = await fetch("/api/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    if (response.ok) return true;
    if (response.status !== 409 && response.status !== 502) return false;
    if (attempt < 9) await delay(2000);
  }
  return false;
}
