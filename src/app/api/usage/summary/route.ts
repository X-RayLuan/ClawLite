import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance } from "@/lib/balance";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    const searchParams = request.nextUrl.searchParams;
    const keyName = searchParams.get("keyName")?.trim() || null;

    // Get usage events for this account
    let query = supabase
      .from("usage_events")
      .select("created_at, tokens_in, tokens_out, cost", { count: "exact" })
      .eq("account_id", userId)
      .order("created_at", { ascending: false });

    if (keyName) {
      query = query.eq("key_name", keyName);
    }

    const { data: events, error: eventsError, count } = await query.limit(200);

    if (eventsError) throw new Error(eventsError.message || "failed_to_load_usage_events");

    const rows = events || [];
    const totalRequests = count || 0;
    const totalTokensIn = rows.reduce((sum: number, r: any) => sum + Number(r.tokens_in || 0), 0);
    const totalTokensOut = rows.reduce((sum: number, r: any) => sum + Number(r.tokens_out || 0), 0);
    const totalCost = rows.reduce((sum: number, r: any) => sum + Number(r.cost || 0), 0);
    const lastRequestAt = rows[0]?.created_at || null;

    const balance = await checkBalance(userId);

    return NextResponse.json(
      {
        ok: true,
        summary: {
          totalRequests,
          totalTokensIn,
          totalTokensOut,
          totalCost,
          lastRequestAt,
          keyName,
        },
        balance: {
          balanceUsd: balance.balanceUsd,
          frozenBalanceUsd: balance.frozenBalanceUsd,
          availableBalanceUsd: balance.availableBalanceUsd,
        },
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "failed_to_load_usage_summary" },
      { status: 400 },
    );
  }
}
