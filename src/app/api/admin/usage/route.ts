import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET /api/admin/usage - 全局消费统计
// 返回：总请求数、总Token、总费用、按客户统计TOP10
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const supabase = getSupabaseAdminClient();

    // Total usage across all accounts
    const { data: allUsage, error: usageError } = await supabase
      .from("usage_events")
      .select("account_id, tokens_in, tokens_out, cost_estimate");

    if (usageError) throw new Error(usageError.message);

    const totalRequests = allUsage?.length || 0;
    const totalTokensIn = allUsage?.reduce((s: number, r: any) => s + Number(r.tokens_in || 0), 0) || 0;
    const totalTokensOut = allUsage?.reduce((s: number, r: any) => s + Number(r.tokens_out || 0), 0) || 0;
    const totalCost = allUsage?.reduce((s: number, r: any) => s + Number(r.cost_estimate || 0), 0) || 0;

    // Top 10 accounts by total cost
    const accountCostMap: Record<string, number> = {};
    for (const row of allUsage || []) {
      const aid = row.account_id;
      accountCostMap[aid] = (accountCostMap[aid] || 0) + Number(row.cost_estimate || 0);
    }

    const topAccountIds = Object.entries(accountCostMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => id);

    let topAccounts: any[] = [];
    if (topAccountIds.length > 0) {
      const { data: accounts } = await supabase
        .from("accounts")
        .select("id, email")
        .in("id", topAccountIds);

      topAccounts = topAccountIds.map((id) => {
        const acc = accounts?.find((a: any) => a.id === id);
        return {
          account_id: id,
          email: acc?.email || null,
          total_cost: accountCostMap[id] || 0,
        };
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        total_requests: totalRequests,
        total_tokens_in: totalTokensIn,
        total_tokens_out: totalTokensOut,
        total_cost: totalCost,
        top_accounts: topAccounts,
      },
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_get_usage" }, { status });
  }
}
