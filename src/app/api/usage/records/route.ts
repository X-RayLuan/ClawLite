import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { BalanceTransaction } from "@/lib/balance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    const searchParams = request.nextUrl.searchParams;

    // Pagination: frontend sends page (1-based) + pageSize; API computes offset
    const pageSize = Math.min(Number(searchParams.get("pageSize")) || 20, 200);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const offset = (page - 1) * pageSize;

    const keyName = searchParams.get("keyName")?.trim() || null;
    // Accept both start/startDate and end/endDate (frontend uses start/end)
    const startDate = searchParams.get("start")?.trim() || searchParams.get("startDate")?.trim() || null;
    const endDate = searchParams.get("end")?.trim() || searchParams.get("endDate")?.trim() || null;
    const typeFilter = searchParams.get("type")?.trim() || "all";

    // Build balance_transactions query with filters
    let txQuery = supabase
      .from("balance_transactions")
      .select("*", { count: "exact" })
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

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
      referenceId: tx.reference_id || null,
      txType: tx.tx_type,
      amount: Number(tx.amount_usd),
      balanceBefore: Number(tx.balance_before_usd),
      balanceAfter: Number(tx.balance_after_usd),
      status: tx.tx_type,
      description: tx.metadata?.description || null,
      metadata: tx.metadata || {},
      createdAt: tx.created_at,
    }));

    // Build usage_events query with filters
    let eventsQuery = supabase
      .from("usage_events")
      .select("id, api_key_id, model, tokens_in, tokens_out, cost_estimate, status, error_code, created_at", { count: "exact" })
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (keyName) {
      // Filter by key name requires a subquery or join - skip for now
    }
    if (startDate) {
      eventsQuery = eventsQuery.gte("created_at", startDate);
    }
    if (endDate) {
      eventsQuery = eventsQuery.lte("created_at", endDate);
    }

    const { data: events, error: eventsError, count: totalEvents } = await eventsQuery;

    if (eventsError) throw new Error(eventsError.message || "failed_to_load_usage_records");

    // Fetch key names for the events (api_key_id -> name via api_keys join)
    const apiKeyIds = [...new Set((events || []).map((e: any) => e.api_key_id).filter(Boolean))];
    let keyNameMap: Record<string, string> = {};
    if (apiKeyIds.length > 0) {
      const { data: keysData } = await supabase
        .from("api_keys")
        .select("id, name")
        .in("id", apiKeyIds);
      if (keysData) {
        keyNameMap = Object.fromEntries(keysData.map((k: any) => [k.id, k.name]));
      }
    }

    return NextResponse.json(
      {
        ok: true,
        transactions,
        usageEvents: (events || []).map((e: any) => ({
          ...e,
          cost: e.cost_estimate,
          key_name: e.api_key_id ? (keyNameMap[e.api_key_id] || null) : null,
        })),
        pagination: {
          page,
          pageSize,
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
    const errorMessage = error?.message || "failed_to_load_usage_records";
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
