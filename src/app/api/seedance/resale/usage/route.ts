import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);

    const limitParam = new URL(request.url).searchParams.get("limit") || "20";
    const limit = Math.min(100, Math.max(1, Number(limitParam) || 20));

    const supabase = getSupabaseAdminClient();
    const rows = await supabase
      .from("seedance_usage_ledger")
      .select("id, used_units, status, created_at, metadata")
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (rows?.error) {
      throw new Error(rows.error.message || "failed_to_load_seedance_usage");
    }

    return NextResponse.json({ ok: true, usage: rows.data || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_load_seedance_usage" }, { status: 400 });
  }
}
