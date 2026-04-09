import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { createStripeCheckoutSessionViaFetch } from "@/lib/stripe-rest";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSeedanceOrder } from "@/lib/seedance-resale";

export const runtime = "nodejs";

const PRICE_MAP: Record<string, { usd: number; units: number; label: string }> = {
  seedance_fast_20: { usd: 5, units: 20, label: "Seedance 2 Fast · 20 credits" },
  seedance_fast_40: { usd: 10, units: 40, label: "Seedance 2 Fast · 40 credits" },
  seedance_pro_15: { usd: 5, units: 15, label: "Seedance 2.0 · 15 credits" },
  seedance_pro_30: { usd: 10, units: 30, label: "Seedance 2.0 · 30 credits" },
};

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
    const body = await request.json().catch(() => ({}));
    const sku = typeof body.sku === "string" ? body.sku : "seedance_fast_20";

    const plan = PRICE_MAP[sku];
    if (!plan) {
      return NextResponse.json({ ok: false, error: "invalid_seedance_sku" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const order = await createSeedanceOrder(supabase, {
      userId,
      sku,
      units: plan.units,
      amountUsd: plan.usd,
      metadata: { label: plan.label },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const stripeSession = await createStripeCheckoutSessionViaFetch({
      secretKey: process.env.STRIPE_SECRET_KEY,
      fields: {
        mode: "payment",
        billing_address_collection: "auto",
        allow_promotion_codes: true,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": plan.label,
        "line_items[0][price_data][product_data][description]": "Independent video credits for Seedance 2.0 / Seedance 2.0 Fast. 1 credit = 1 second at 720p text-to-video (no video input).",
        "line_items[0][price_data][unit_amount]": Math.round(plan.usd * 100),
        "line_items[0][quantity]": 1,
        customer_email: email || undefined,
        "metadata[kind]": "seedance_video_credits",
        "metadata[orderId]": order.id,
        "metadata[accountId]": userId,
        "metadata[sku]": sku,
        "metadata[units]": String(plan.units),
        success_url: `${siteUrl}/clawrouter/dashboard?videoTopup=success&orderId=${order.id}`,
        cancel_url: `${siteUrl}/clawrouter/dashboard/video/add-credits?canceled=1`,
      },
    });

    return NextResponse.json({ ok: true, checkoutUrl: stripeSession.url, orderId: order.id });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "failed_to_create_seedance_checkout",
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
