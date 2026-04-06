import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { confirmSeedanceOrder } from "@/lib/seedance-resale";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.SEEDANCE_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ ok: false, error: "missing_seedance_webhook_secret" }, { status: 500 });
    }

    const signature = request.headers.get("x-seedance-signature");
    if (!signature || signature !== secret) {
      return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    }

    const event = await request.json().catch(() => null);
    if (!event || typeof event.event_type !== "string") {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    if (event.event_type === "payment_completed") {
      const orderId = event.order_id;
      const providerEventId = event.provider_event_id || `evt_${Date.now()}`;
      const order = await confirmSeedanceOrder(supabase, {
        orderId,
        providerEventId,
        providerStatus: event.payment_status || "completed",
        settleMetadata: {
          providerPayload: event,
        },
      });

      return NextResponse.json({ ok: true, orderId: order.id, status: order.status }, { status: 200 });
    }

    return NextResponse.json({ ok: true, ignored: true, event_type: event.event_type }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "seedance_webhook_failed" }, { status: 400 });
  }
}
