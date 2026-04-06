import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);

    const searchParams = new URL(request.url).searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "missing_order_id" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const row = await supabase
      .from("seedance_sales_orders")
      .select("id, status, units, amount_usd, metadata, updated_at")
      .eq("id", orderId)
      .eq("account_id", userId)
      .maybeSingle();

    if (row?.error && row.error.code !== "PGRST116") {
      throw new Error(row.error.message || "failed_to_load_order_status");
    }

    if (!row?.data) {
      return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, order: row.data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_get_seedance_order_status" }, { status: 400 });
  }
}

