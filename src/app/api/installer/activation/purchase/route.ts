import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { createCheckoutSessionRecord, markCheckoutSessionPending } from "@/lib/clawrouter-checkout";
import { createStripeCheckoutSessionViaFetch } from "@/lib/stripe-rest";
import { buildInstallerStripeCheckoutConfig } from "@/lib/installer-activation-purchase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { setupToken, intent } = body;

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const session = await createCheckoutSessionRecord({
      supabase,
      installerSetupToken: setupToken,
      source: "installer",
      metadata: {
        source: "installer",
        entrypoint: "activation_purchase",
        intent: intent || "buy_and_connect",
      },
    });

    const stripeConfig = buildInstallerStripeCheckoutConfig({
      secretKey: process.env.STRIPE_SECRET_KEY,
      priceId: process.env.STRIPE_CLAWROUTER_PRICE_ID,
    });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawlite.ai";

    const stripeSession = await createStripeCheckoutSessionViaFetch({
      secretKey: stripeConfig.secretKey,
      fields: {
        mode: "payment",
        "line_items[0][price]": stripeConfig.priceId,
        "line_items[0][quantity]": 1,
        success_url: `${siteUrl}/clawrouter/checkout?session=${encodeURIComponent(session.id)}&stripe_session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/clawrouter/checkout?session=${encodeURIComponent(session.id)}&cancelled=1`,
        "metadata[checkout_session_id]": session.id,
        "metadata[account_id]": session.accountId,
        "metadata[installer_setup_token]": setupToken,
        "metadata[product]": "clawrouter",
        "metadata[delivery_mode]": "managed_topup",
      },
    });

    if (!stripeSession.url) {
      throw new Error("stripe_checkout_url_missing");
    }

    await markCheckoutSessionPending({
      supabase,
      sessionId: session.id,
      provider: "stripe",
      externalSessionId: stripeSession.id,
      checkoutUrl: stripeSession.url,
    });

    return NextResponse.json({
      purchaseState: "checkout_pending",
      checkoutUrl: stripeSession.url,
      pollAfterMs: 2500,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "purchase_failed" },
      { status: 500 },
    );
  }
}
