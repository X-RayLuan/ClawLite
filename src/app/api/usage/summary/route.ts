import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance } from "@/lib/balance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    const searchParams = request.nextUrl.searchParams;
    const keyName = searchParams.get("keyName")?.trim() || null;

    // Get all-time usage events for this account
    let query = supabase
      .from("usage_events")
      .select("created_at, tokens_in, tokens_out, cost_estimate", { count: "exact" })
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
    const totalCost = rows.reduce((sum: number, r: any) => sum + Number(r.cost_estimate || 0), 0);
    const lastRequestAt = rows[0]?.created_at || null;

    // Calculate today's cost (from midnight today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCost = rows
      .filter((r: any) => new Date(r.created_at) >= todayStart)
      .reduce((sum: number, r: any) => sum + Number(r.cost_estimate || 0), 0);

    const balance = await checkBalance(userId);

    return NextResponse.json(
      {
        ok: true,
        summary: {
          totalRequests,
          totalTokensIn,
          totalTokensOut,
          totalCost,
          todayCost,
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
    const errorMessage = error?.message || "failed_to_load_usage_summary";
    if (
      errorMessage === "missing_access_token" ||
      errorMessage === "invalid_access_token" ||
      errorMessage.includes("JWT")
    ) {
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 400 },
    );
  }
}
