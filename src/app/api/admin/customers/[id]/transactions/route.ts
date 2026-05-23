import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import type { Transaction } from "@/components/balance/TransactionTable";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/customers/[id]/transactions - 获取指定客户的流水记录
// Query params: limit, offset, type (recharge|charge|refund|freeze|all)
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id: customerId } = await params;
    const supabase = getSupabaseAdminClient();
    const { searchParams } = request.nextUrl;

    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const offset = Number(searchParams.get("offset")) || 0;
    const typeFilter = searchParams.get("type") || "all";

    // Verify customer exists
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, email")
      .eq("id", customerId)
      .maybeSingle();

    if (accountError) throw new Error(accountError.message);
    if (!account) return NextResponse.json({ ok: false, error: "customer_not_found" }, { status: 404 });

    // Build balance_transactions query
    let txQuery = supabase
      .from("balance_transactions")
      .select("*", { count: "exact" })
      .eq("account_id", customerId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (typeFilter !== "all") {
      txQuery = txQuery.eq("tx_type", typeFilter);
    }

    const { data: transactions, error: txError, count } = await txQuery;

    if (txError) throw new Error(txError.message);

    // Map to Transaction type
    const mappedTransactions: Transaction[] = (transactions || []).map((tx: any) => ({
      id: tx.id,
      txType: tx.tx_type,
      amount: Number(tx.amount_usd),
      balanceBefore: Number(tx.balance_before_usd),
      balanceAfter: Number(tx.balance_after_usd),
      status: tx.tx_type,
      description: tx.metadata?.description || null,
      eventId: tx.event_id,
      createdAt: tx.created_at,
    }));

    // Get usage_events for this customer
    let usageQuery = supabase
      .from("usage_events")
      .select("id, key_name, model, tokens_in, tokens_out, cost, status, created_at", { count: "exact" })
      .eq("account_id", customerId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: usageEvents, error: usageError, count: usageCount } = await usageQuery;

    if (usageError) throw new Error(usageError.message);

    return NextResponse.json({
      ok: true,
      customer: {
        id: account.id,
        email: account.email,
      },
      transactions: mappedTransactions,
      usageEvents: usageEvents || [],
      pagination: {
        limit,
        offset,
        totalTransactions: count || 0,
        totalUsageEvents: usageCount || 0,
      },
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_get_transactions" }, { status });
  }
}
