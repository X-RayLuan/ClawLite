import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSessionRecord, markCheckoutSessionPending } from "@/lib/clawrouter-checkout";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { createStripeCheckoutSessionViaFetch } from "@/lib/stripe-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
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

    const deliveryMode = typeof body.deliveryMode === "string" ? body.deliveryMode : "managed_topup";

    const stripeSession = await createStripeCheckoutSessionViaFetch({
      secretKey: process.env.STRIPE_SECRET_KEY,
      fields: {
        mode: "payment",
        "line_items[0][price]": process.env.STRIPE_CLAWROUTER_PRICE_ID,
        "line_items[0][quantity]": 1,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/clawrouter/checkout?session=${encodeURIComponent(session.id)}&stripe_session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/clawrouter/checkout?session=${encodeURIComponent(session.id)}&cancelled=1`,
        customer_email: typeof body.email === "string" ? body.email : undefined,
        "metadata[checkout_session_id]": session.id,
        "metadata[account_id]": session.accountId,
        "metadata[installer_setup_token]": session.installerSetupToken || "",
        "metadata[product]": "clawrouter",
        "metadata[delivery_mode]": deliveryMode,
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
          mode: stripeSession.raw?.mode || "payment",
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
      {
        ok: false,
        error: error?.message || "failed_to_create_checkout",
        type: error?.type || null,
        code: error?.code || null,
        statusCode: error?.statusCode || null,
        requestId: error?.requestId || null,
        rawType: error?.raw?.type || null,
        rawCode: error?.raw?.code || null,
        rawMessage: error?.raw?.message || null,
      },
      { status: error?.message === "invalid_account_id" ? 400 : 500 },
    );
  }
}
