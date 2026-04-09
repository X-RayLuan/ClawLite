import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("seedance_licenses")
      .select("id,key_name,max_uses,remaining_uses,status,model_scope,created_at,last_used_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const totalPurchased = (data || []).reduce((sum, row) => sum + Number(row.max_uses || 0), 0);
    const totalRemaining = (data || []).reduce((sum, row) => sum + Number(row.remaining_uses || 0), 0);
    const activeKeys = (data || []).filter((row) => row.status === "active").length;

    return NextResponse.json({
      ok: true,
      summary: {
        totalPurchased,
        totalRemaining,
        totalUsed: Math.max(0, totalPurchased - totalRemaining),
        activeKeys,
      },
      licenses: data || [],
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_fetch_seedance_balance" }, { status: 400 });
  }
}
