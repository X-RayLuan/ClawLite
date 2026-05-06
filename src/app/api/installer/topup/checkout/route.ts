import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSessionViaFetch } from "@/lib/stripe-rest";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_AMOUNTS = [5, 10, 20];

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: false, error: "missing_stripe_secret_key" }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json({ ok: false, error: "missing_site_url" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const accountId = typeof body.accountId === "string" ? body.accountId.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const amount = Number(body.amount || 0);

    if (!accountId || !email || !ALLOWED_AMOUNTS.includes(amount)) {
      return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
    }

    // Verify accountId + email association
    const supabase = getSupabaseAdminClient();
    const accountResult = await supabase
      .from("accounts")
      .select("id, email")
      .eq("id", accountId)
      .eq("email", email)
      .maybeSingle();

    if (!accountResult?.data) {
      return NextResponse.json({ ok: false, error: "account_not_found" }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const unitAmount = Math.round(amount * 100);

    const stripeSession = await createStripeCheckoutSessionViaFetch({
      secretKey: process.env.STRIPE_SECRET_KEY,
      fields: {
        mode: "payment",
        billing_address_collection: "auto",
        allow_promotion_codes: true,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": `ClawRouter Credits – $${amount}`,
        "line_items[0][price_data][product_data][description]": "Top up your ClawRouter account balance.",
        "line_items[0][price_data][unit_amount]": String(unitAmount),
        "line_items[0][quantity]": "1",
        customer_email: email,
        "metadata[kind]": "clawrouter_topup",
        "metadata[delivery_mode]": "managed_topup",
        "metadata[account_id]": accountId,
        "metadata[amount_usd]": String(amount),
        "metadata[source]": "installer",
        success_url: `${siteUrl}/downloads?topup=success&email=${encodeURIComponent(email)}`,
        cancel_url: `${siteUrl}/downloads?topup=cancelled`,
      },
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: stripeSession.url,
      stripeSessionId: stripeSession.id,
      amount,
    });
  } catch (error: any) {
    console.error("[installer/topup/checkout] unexpected error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "failed_to_create_checkout",
        statusCode: error?.statusCode || null,
      },
      { status: 500 },
    );
  }
}
