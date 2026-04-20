import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { BalanceTransaction } from "@/lib/balance";

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
    const startDate = searchParams.get("startDate")?.trim() || null;
    const endDate = searchParams.get("endDate")?.trim() || null;
    const typeFilter = searchParams.get("type")?.trim() || "all";

    // Build balance_transactions query with filters
    let txQuery = supabase
      .from("balance_transactions")
      .select("*", { count: "exact" })
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) {
      txQuery = txQuery.gte("created_at", startDate);
    }
    if (endDate) {
      txQuery = txQuery.lte("created_at", endDate);
    }
    if (typeFilter !== "all") {
      txQuery = txQuery.eq("tx_type", typeFilter);
    }

    const { data: txData, error: txError, count: txCount } = await txQuery;

    if (txError) throw new Error(txError.message || "failed_to_load_transactions");

    const transactions: BalanceTransaction[] = (txData || []).map((tx: any) => ({
      id: tx.id,
      accountId: tx.account_id,
      eventId: tx.event_id || null,
      txType: tx.tx_type,
      amount: Number(tx.amount),
      balanceBefore: Number(tx.balance_before),
      balanceAfter: Number(tx.balance_after),
      status: tx.status,
      description: tx.description || null,
      metadata: tx.metadata || {},
      createdAt: tx.created_at,
    }));

    // Build usage_events query with filters
    let eventsQuery = supabase
      .from("usage_events")
      .select("id, key_name, model, tokens_in, tokens_out, cost, duration_ms, status, created_at", { count: "exact" })
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (keyName) {
      eventsQuery = eventsQuery.eq("key_name", keyName);
    }
    if (startDate) {
      eventsQuery = eventsQuery.gte("created_at", startDate);
    }
    if (endDate) {
      eventsQuery = eventsQuery.lte("created_at", endDate);
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
          totalTransactions: txCount || 0,
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
