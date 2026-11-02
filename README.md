# Bloom video site

Mobile-first English/Hindi catalog with Razorpay Subscriptions **test checkout**. Live payments and premium video playback are intentionally disabled. The current videos are public YouTube samples.

## Local setup

1. Run `npm install`.
2. In Razorpay **Test Mode**, create a subscription plan with amount **₹699**, period **quarterly**, interval **1**. Razorpay plans cannot be edited after creation.
3. Copy `.env.example` to `.env.local`. Add your **test** Key ID, Key Secret, plan ID, the approved **10 quarterly charges**, and a random cookie secret of at least 32 characters. Keep `.env.local` private; it is Git ignored. Do not use `NEXT_PUBLIC_` for secrets.
4. Run `npm run dev`. The checkout button stays disabled until all settings are valid and the Razorpay plan fetched by the server matches ₹699 every three months.
5. Use Razorpay test checkout to test success, failure, cancellation, and pending authorization. No real money moves in Test Mode.

The server creates a subscription with a **₹1 one-time upfront item** and a start date **one day after setup**. Its plan is ₹699 every three months for 10 quarterly charges. The browser receives a subscription ID and the public Key ID only. The server verifies the checkout signature using its own subscription ID and secret, then fetches subscription status from Razorpay. Verified status is stored in a signed HTTP-only cookie and checked against Razorpay again on later visits. The UI never trusts `sessionStorage` as payment proof.

## Before live payments or Instagram ads

- Show the 10-charge limit in the disclosure and confirm the exact end date in Razorpay checkout. Confirm with Razorpay that the ₹1 upfront item and one-day start date behave as intended for every payment method you will accept; provider checkout is the final schedule shown to the customer.
- Add your support email in `SUPPORT_EMAIL`, refund policy, privacy notice, and a merchant-side cancellation option. UPI AutoPay mandates can be cancelled in a UPI app, but other payment methods can have different paths.
- Replace public YouTube samples with owned or licensed video hosting that supports **server-issued, expiring playback URLs**. A public or reusable video link is not a paywall. Add a server playback endpoint that checks the subscription before issuing each URL.
- Add a durable customer/subscription store, access recovery, signed and deduplicated webhook processing, renewal/failure handling, and rate limits. Keep webhook and API secrets on the server.
- Once those steps and test-mode acceptance checks pass, add an explicit live-mode enablement path. The current code rejects live keys to prevent accidental charges from an incomplete service.

The intended pricing is ₹1 once, then ₹699 every three months starting one day later. Payment wording is addressed to a parent or guardian. The trial page treats the Start Trial tap as consent after showing the terms. Hindi copy needs native-speaker review before launch.

The user-provided `youtu.be/VX9gMj51Y4w` URL is included as a Hindi family-story entry in the Videos catalog. It remains public and can only be used for preview/sample content. It cannot be protected by this checkout. The local `public/videos/video1.mp4` is also listed in the catalog with a generated thumbnail and the same 30-second in-site preview. Files under `public` are directly accessible by URL, so the local video is not protected paid content either.

## Preview behavior

The in-site YouTube player previews the first 30 seconds, then pauses and shows the subscription action. After a verified test subscription, the in-site player starts from 30 seconds. This is a user-interface preview limit only: the original public YouTube URL remains accessible outside the site and cannot be secured by JavaScript or embed parameters. For real paid access, use private media with short-lived, server-issued playback tokens.

## Instagram reel link

Point the reel’s **Watch more** destination to `/trial`. Visitors see the trial offer and the exact AutoPay steps in the site theme, then tap **Start Trial** to open Razorpay test checkout. Razorpay handles any UPI mandate authorization; this site does not require a separate mobile-number or OTP screen. After checkout, the client retries server verification for up to 20 seconds while Razorpay activates the subscription. A verified visitor is sent to `/videos`, where the status route checks the subscription again before unlocking the in-site full player. The 30-second overlay on any video card also opens `/trial` and carries that video's ID through checkout, returning the viewer to the same card after verification.
