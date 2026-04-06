import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { buildSeedanceQuote, createSeedanceOrder, createSeedanceSelfSignedLicense } from "@/lib/seedance-resale";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);

    const body = await request.json().catch(() => ({}));

    const quote = buildSeedanceQuote({
      userId,
      sku: typeof body.sku === "string" ? body.sku : undefined,
      requestedUnits: body.units,
    });

    const supabase = getSupabaseAdminClient();
    const order = await createSeedanceOrder(supabase, {
      userId,
      sku: quote.sku,
      units: quote.requestedUnits,
      amountUsd: quote.subtotalUsd,
      providerCheckoutSessionId: typeof body.providerCheckoutSessionId === "string" ? body.providerCheckoutSessionId : null,
      metadata: {
        source: "api",
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_create_seedance_order" }, { status: 400 });
  }
}
