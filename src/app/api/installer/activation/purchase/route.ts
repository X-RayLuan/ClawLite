import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { createCheckoutSessionRecord, markCheckoutSessionPending } from "@/lib/clawrouter-checkout";
import { createStripeCheckoutSessionViaFetch } from "@/lib/stripe-rest";

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

    let checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://clawlite.ai"}/clawrouter/dashboard/add-credits`;

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_CLAWROUTER_PRICE_ID) {
      try {
        const stripeSession = await createStripeCheckoutSessionViaFetch({
          secretKey: process.env.STRIPE_SECRET_KEY,
          fields: {
            mode: "payment",
            "line_items[0][price]": process.env.STRIPE_CLAWROUTER_PRICE_ID,
            "line_items[0][quantity]": 1,
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://clawlite.ai"}/clawrouter/checkout?session=${encodeURIComponent(session.id)}&stripe_session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://clawlite.ai"}/clawrouter/checkout?session=${encodeURIComponent(session.id)}&cancelled=1`,
            "metadata[checkout_session_id]": session.id,
            "metadata[account_id]": session.accountId,
            "metadata[installer_setup_token]": setupToken,
            "metadata[product]": "clawrouter",
            "metadata[delivery_mode]": "inventory_key",
          },
        });

        await markCheckoutSessionPending({
          supabase,
          sessionId: session.id,
          provider: "stripe",
          externalSessionId: stripeSession.id,
          checkoutUrl: stripeSession.url || checkoutUrl,
        });

        checkoutUrl = stripeSession.url || checkoutUrl;
      } catch {
        // Fall back to dashboard URL if Stripe fails
      }
    }

    return NextResponse.json({
      purchaseState: "checkout_pending",
      checkoutUrl,
      pollAfterMs: 2500,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "purchase_failed" },
      { status: 500 },
    );
  }
}
