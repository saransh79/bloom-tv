"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  verifyCheckoutWithPolling,
  type CheckoutResult,
} from "@/lib/verify-checkout";

type Offer = { configured: boolean; totalCount?: number };
type Checkout = {
  open: () => void;
  on: (event: string, handler: () => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => Checkout;
  }
}

function loadCheckout() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Checkout unavailable"));
    document.head.appendChild(script);
  });
}

export default function TrialLanding() {
  const [offer, setOffer] = useState<Offer>({ configured: false });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/razorpay/offer")
      .then((response) => response.json())
      .then(setOffer)
      .catch(() => setOffer({ configured: false }));
  }, []);

  async function startTrial() {
    if (!offer.configured || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/razorpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guardianConsent: true }),
      });
      if (!response.ok) throw new Error("Could not start checkout");
      const { keyId, subscriptionId } = await response.json();
      await loadCheckout();
      if (!window.Razorpay) throw new Error("Checkout unavailable");

      const checkout = new window.Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: "bloom.tv",
        description: "1-day trial, then ₹699 every 3 months",
        theme: { color: "#793450" },
        handler: async (result: CheckoutResult) => {
          setBusy(true);
          setMessage("Confirming your trial…");
          try {
            if (await verifyCheckoutWithPolling(result)) {
              const videoId = new URLSearchParams(window.location.search).get(
                "video",
              );
              const returnPath =
                videoId && /^v[0-9]+$/.test(videoId)
                  ? `/videos?play=${encodeURIComponent(videoId)}`
                  : "/videos";
              window.location.assign(returnPath);
              return;
            }
            setMessage(
              "Payment is pending or could not be verified. Please check again shortly.",
            );
          } catch {
            setMessage(
              "Could not check the payment status. Please try again shortly.",
            );
          } finally {
            setBusy(false);
          }
        },
      });
      checkout.on("payment.failed", () => {
        setMessage("Payment did not complete. Please try again.");
        setBusy(false);
      });
      checkout.open();
      setBusy(false);
    } catch {
      setMessage("Checkout is unavailable right now. Please try again later.");
      setBusy(false);
    }
  }

  return (
    <main className="trial-page">
      <header className="trial-header">
        <Link className="trial-logo" href="/" aria-label="bloom.tv home">
          ✿ bloom.tv
        </Link>
        <span>Stories worth staying for</span>
      </header>

      <div className="trial-shell">
        <div className="trial-story">
          <span className="trial-kicker">Your story continues here</span>
          <h1>The next episode is waiting.</h1>
          <p>
            Start with a one-day trial. Unlock all dramas and keep watching
            where the reel left off.
          </p>
          <div className="trial-preview" aria-hidden="true">
            <div className="trial-preview-mark">✿</div>
            <div>
              <span>Bloom originals</span>
              <strong>One more episode?</strong>
            </div>
            <span className="trial-play">▶</span>
          </div>
        </div>

        <section className="autopay-card" aria-labelledby="trial-details-title">
          <span className="autopay-label">Trial plan</span>
          <h2 id="trial-details-title">Start your trial</h2>
          <div className="autopay-rupee">₹1</div>
          <p className="autopay-subtitle">Cancel the plan anytime</p>

          <div className="autopay-timeline">
            <div>
              <span className="timeline-icon">↗</span>
              <p>
                <strong>Start your Trial Plan</strong>
                <small>Pay ₹1 and unlock all dramas</small>
              </p>
            </div>
            <div>
              <span className="timeline-icon">▶</span>
              <p>
                <strong>Watch new dramas for 1 day</strong>
                <small>Romance, revenge and much more</small>
              </p>
            </div>
            <div>
              <span className="timeline-icon">✓</span>
              <p>
                <strong>Notified before autopay</strong>
                <small>Pay ₹699/3 months after 1 day</small>
              </p>
            </div>
          </div>

          <p className="autopay-disclosure">
            AutoPay renews every 3 months after the trial. You can cancel the
            mandate in your UPI app. Razorpay shows the exact payment schedule
            before you approve it.
            {offer.totalCount
              ? ` This test mandate is limited to ${offer.totalCount} recurring charges.`
              : ""}
          </p>
          <button
            className="trial-cta"
            onClick={startTrial}
            disabled={!offer.configured || busy}
          >
            {busy ? "Opening checkout…" : "Start Trial"}{" "}
            <span aria-hidden="true">→</span>
          </button>
          {!offer.configured && (
            <p className="trial-status">
              Razorpay test checkout is not configured yet.
            </p>
          )}
          {message && (
            <p className="trial-status" role="status">
              {message}
            </p>
          )}
          <p className="trial-fineprint">
            Razorpay test mode · No real money will be charged. By continuing,
            you confirm you are a parent or guardian and agree to these AutoPay
            terms.
          </p>
        </section>
      </div>
    </main>
  );
}
