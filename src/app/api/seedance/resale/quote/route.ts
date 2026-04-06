import { NextRequest, NextResponse } from "next/server";
import { buildSeedanceQuote } from "@/lib/seedance-resale";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const quote = buildSeedanceQuote({
      userId: typeof body.userId === "string" ? body.userId : "",
      sku: typeof body.sku === "string" ? body.sku : undefined,
      requestedUnits: body.requestedUnits,
    });

    return NextResponse.json(
      {
        ok: true,
        currency: quote.currency,
        sku: quote.sku,
        requestedUnits: quote.requestedUnits,
        unitPriceUsd: quote.unitPriceUsd,
        subtotalUsd: quote.subtotalUsd,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_quote_seedance" }, { status: 400 });
  }
}
