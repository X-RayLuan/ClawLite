import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ ok: false, error: "missing_stripe_secret_key" }, { status: 500 });
    }

    const auth = Buffer.from(`${key}:`).toString("base64");
    const response = await fetch("https://api.stripe.com/v1/balance", {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    });

    const text = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: parsed,
    }, { status: response.ok ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "stripe_fetch_health_failed",
        name: error?.name || null,
        cause: error?.cause || null,
      },
      { status: 500 },
    );
  }
}
