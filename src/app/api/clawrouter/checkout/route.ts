import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createCheckoutSessionRecord, markCheckoutSessionPending } from "@/lib/clawrouter-checkout";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: "missing_stripe_secret_key" },
        { status: 500 },
      );
    }

    if (!process.env.STRIPE_CLAWROUTER_PRICE_ID) {
      return NextResponse.json(
        { ok: false, error: "missing_stripe_clawrouter_price_id" },
        { status: 500 },
      );
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { ok: false, error: "missing_site_url" },
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const supabase = getSupabaseAdminClient();
    const session = await createCheckoutSessionRecord({
      supabase,
      accountId: typeof body.accountId === "string" ? body.accountId : null,
      email: typeof body.email === "string" ? body.email : null,
      installerSetupToken: typeof body.installerSetupToken === "string" ? body.installerSetupToken : null,
      source: "web",
      metadata: {
        source: "web",
        entrypoint: "clawrouter_sales_page",
      },
    });

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_CLAWROUTER_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/clawrouter/checkout?session=${encodeURIComponent(session.id)}&stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/clawrouter/checkout?session=${encodeURIComponent(session.id)}&cancelled=1`,
      customer_email: typeof body.email === "string" ? body.email : undefined,
      metadata: {
        checkout_session_id: session.id,
        account_id: session.accountId,
        installer_setup_token: session.installerSetupToken || "",
        product: "clawrouter",
      },
    });

    const pendingSession = await markCheckoutSessionPending({
      supabase,
      sessionId: session.id,
      provider: "stripe",
      externalSessionId: stripeSession.id,
      checkoutUrl: stripeSession.url || session.checkoutUrl,
      metadata: {
        stripe: {
          checkout_session_id: stripeSession.id,
          mode: stripeSession.mode,
        },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        accountId: pendingSession.accountId,
        installerSetupToken: pendingSession.installerSetupToken,
        checkoutSessionId: pendingSession.id,
        stripeSessionId: stripeSession.id,
        checkoutUrl: pendingSession.checkoutUrl,
        status: pendingSession.status,
        purchaseState: pendingSession.purchaseState,
        session: pendingSession,
        persisted: true,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "failed_to_create_checkout" },
      { status: error?.message === "invalid_account_id" ? 400 : 500 },
    );
  }
}
