import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSessionViaFetch } from "@/lib/stripe-rest";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { ensureClawRouterAccount } from "@/lib/clawrouter-topups";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: false, error: "missing_stripe_secret_key" }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json({ ok: false, error: "missing_site_url" }, { status: 500 });
    }

    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId, email } = await getAuthenticatedClawRouterUser(accessToken);
    await ensureClawRouterAccount({
      supabase: getSupabaseAdminClient(),
      accountId: userId,
      email,
    });

    const body = await request.json().catch(() => ({}));
    const amount = Number(body.amount || 0);
    const promoCode = typeof body.promoCode === "string" ? body.promoCode.trim() : "";

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
    }

    const unitAmount = Math.round(amount * 100);
    if (unitAmount < 100) {
      return NextResponse.json({ ok: false, error: "minimum_amount_is_1_usd" }, { status: 400 });
    }

    const isInventoryAccessPurchase = amount === 5;
    const kind = isInventoryAccessPurchase ? "clawrouter_access" : "clawrouter_topup";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const stripeSession = await createStripeCheckoutSessionViaFetch({
      secretKey: process.env.STRIPE_SECRET_KEY,
      fields: {
        mode: "payment",
        billing_address_collection: "auto",
        allow_promotion_codes: true,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": isInventoryAccessPurchase
          ? "ClawRouter Access – Inventory Key"
          : `ClawRouter Credits – $${amount}`,
        "line_items[0][price_data][product_data][description]": isInventoryAccessPurchase
          ? "Purchase one inventory API key with $10 upstream value."
          : promoCode
            ? `Promo code entered: ${promoCode}`
            : "Top up your ClawRouter account balance.",
        "line_items[0][price_data][unit_amount]": unitAmount,
        "line_items[0][quantity]": 1,
        customer_email: email || undefined,
        "metadata[kind]": kind,
        "metadata[delivery_mode]": isInventoryAccessPurchase ? "inventory_key" : "managed_topup",
        "metadata[account_id]": userId,
        "metadata[amount_usd]": String(amount),
        "metadata[promo_code]": promoCode,
        success_url: `${siteUrl}/clawrouter/dashboard?topup=success&amount=${encodeURIComponent(String(amount))}`,
        cancel_url: `${siteUrl}/clawrouter/dashboard/add-credits?topup=cancelled`,
      },
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: stripeSession.url,
      stripeSessionId: stripeSession.id,
      amount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "failed_to_create_topup_checkout",
        type: error?.type || null,
        code: error?.code || null,
        statusCode: error?.statusCode || null,
        requestId: error?.requestId || null,
        rawType: error?.raw?.type || null,
        rawCode: error?.raw?.code || null,
        rawMessage: error?.raw?.message || null,
      },
      { status: 500 },
    );
  }
}
