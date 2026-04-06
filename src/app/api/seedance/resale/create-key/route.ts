import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSeedanceSelfSignedLicense } from "@/lib/seedance-resale";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);

    const body = await request.json().catch(() => ({}));
    const orderId = body.orderId;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ ok: false, error: "missing_order_id" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const orderQuery = await supabase
      .from("seedance_sales_orders")
      .select("*")
      .eq("id", orderId)
      .eq("account_id", userId)
      .eq("status", "paid")
      .maybeSingle();

    if (orderQuery?.error) {
      throw new Error(orderQuery.error.message || "failed_to_lookup_order");
    }

    if (!orderQuery?.data) {
      return NextResponse.json({ ok: false, error: "order_not_found_or_not_paid" }, { status: 404 });
    }

    const license = await createSeedanceSelfSignedLicense(supabase, orderQuery.data);

    return NextResponse.json({ ok: true, license: { ...license, license: license.license } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_create_seedance_license" }, { status: 400 });
  }
}
