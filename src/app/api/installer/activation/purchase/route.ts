import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  createCheckoutSessionRecord,
  markCheckoutSessionPending,
  resolveInstallerActivationState,
} from "@/lib/clawrouter-checkout";
import { createStripeCheckoutSessionViaFetch } from "@/lib/stripe-rest";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveAccountIdFromInput(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  accountIdInput: unknown,
): Promise<string | null> {
  if (typeof accountIdInput !== "string") {
    return null;
  }

  const value = accountIdInput.trim();
  if (!value) return null;
  if (UUID_RE.test(value)) return value;
  if (!value.includes("@")) return null;

  const accountRow = await supabase
    .from("accounts")
    .select("id")
    .eq("email", value)
    .maybeSingle();

  return accountRow?.data?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { setupToken, intent, accountId } = body;

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    let resolvedAccountId = await resolveAccountIdFromInput(supabase, accountId);
    if (!resolvedAccountId) {
      const activation = await resolveInstallerActivationState(supabase, setupToken);
      resolvedAccountId = activation.account.accountId || null;
    }

    if (!resolvedAccountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const session = await createCheckoutSessionRecord({
      supabase,
      accountId: resolvedAccountId,
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
