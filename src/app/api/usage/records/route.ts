import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getTransactionHistory } from "@/lib/balance";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const offset = Number(searchParams.get("offset")) || 0;
    const keyName = searchParams.get("keyName")?.trim() || null;

    // Fetch balance transactions (type: freeze, charge, refund)
    const transactions = await getTransactionHistory(userId, limit, offset);

    // Fetch usage events
    let eventsQuery = supabase
      .from("usage_events")
      .select("id, key_name, model, tokens_in, tokens_out, cost, duration_ms, created_at", { count: "exact" })
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (keyName) {
      eventsQuery = eventsQuery.eq("key_name", keyName);
    }

    const { data: events, error: eventsError, count: totalEvents } = await eventsQuery;

    if (eventsError) throw new Error(eventsError.message || "failed_to_load_usage_records");

    return NextResponse.json(
      {
        ok: true,
        transactions,
        usageEvents: events || [],
        pagination: {
          limit,
          offset,
          totalTransactions: transactions.length,
          totalEvents: totalEvents || 0,
        },
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "failed_to_load_usage_records" },
      { status: 400 },
    );
  }
}
