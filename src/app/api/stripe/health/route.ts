import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function GET() {
  try {
    if (!stripe) {
      return NextResponse.json({ ok: false, error: "missing_stripe_secret_key" }, { status: 500 });
    }

    const balance = await stripe.balance.retrieve();

    return NextResponse.json({
      ok: true,
      livemode: balance.livemode,
      object: balance.object,
      available: balance.available?.length ?? 0,
      pending: balance.pending?.length ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "stripe_health_failed",
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
