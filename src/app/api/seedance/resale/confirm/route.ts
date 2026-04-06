import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { confirmSeedanceOrder } from "@/lib/seedance-resale";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);

    const body = await request.json().catch(() => ({}));

    if (!body.orderId || typeof body.orderId !== "string") {
      return NextResponse.json({ ok: false, error: "missing_order_id" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const order = await confirmSeedanceOrder(supabase, {
      orderId: body.orderId,
      providerEventId: body.providerEventId || `evt_${Math.random().toString(36).slice(2)}`,
      providerStatus: body.providerStatus,
      settleMetadata: { requesterId: userId },
    });

    if (order.account_id !== userId) {
      return NextResponse.json({ ok: false, error: "not_authorized_for_order" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_confirm_seedance_order" }, { status: 400 });
  }
}
