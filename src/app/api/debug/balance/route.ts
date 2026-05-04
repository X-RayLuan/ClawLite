import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    // Try finding by id
    const { data: accountById, error: errorById } = await supabase
      .from("accounts")
      .select("id, user_id, credit_balance_usd, frozen_balance_usd")
      .eq("id", userId)
      .maybeSingle();

    // Try finding by user_id
    const { data: accountByUserId, error: errorByUserId } = await supabase
      .from("accounts")
      .select("id, user_id, credit_balance_usd, frozen_balance_usd")
      .eq("user_id", userId)
      .maybeSingle();

    // Get recent balance_transactions
    const { data: recentTxs } = await supabase
      .from("balance_transactions")
      .select("*")
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      userId,
      byId: { data: accountById, error: errorById ? errorById.message : null },
      byUserId: { data: accountByUserId, error: errorByUserId ? errorByUserId.message : null },
      recentTxs: recentTxs || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 400 });
  }
}
