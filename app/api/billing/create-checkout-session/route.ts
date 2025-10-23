// app/api/billing/create-checkout-session/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const PRICE_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY!;
const PRICE_YEARLY  = process.env.STRIPE_PRICE_ID_YEARLY!;
const SUCCESS_URL   = process.env.NEXT_PUBLIC_CHECKOUT_SUCCESS_URL || "http://localhost:3000/shop/success";
const CANCEL_URL    = process.env.NEXT_PUBLIC_CHECKOUT_CANCEL_URL  || "http://localhost:3000/shop/cancel";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plan = body.plan as "monthly" | "yearly";
    const email = body.email as string | undefined;
    const coupon = body.coupon as string | undefined;
    const metadata = (body.metadata || {}) as Record<string, string>;

    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const price = plan === "monthly" ? PRICE_MONTHLY : PRICE_YEARLY;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer_email: email,
      allow_promotion_codes: true,
      line_items: [{ price, quantity: 1 }],
      discounts: coupon ? [{ coupon }] : undefined,
      success_url: `${SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: CANCEL_URL,
      subscription_data: { metadata },
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || "Stripe error" }, { status: 500 });
  }
}
