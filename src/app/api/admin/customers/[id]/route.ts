import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/customers/:id - 客户详情
// 返回：基本信息 + 余额 + 消费统计
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    requireAdmin(request);
    const { id } = await params;
    const supabase = getSupabaseAdminClient();

    // Fetch account
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (accountError) throw new Error(accountError.message);
    if (!account) return NextResponse.json({ ok: false, error: "customer_not_found" }, { status: 404 });

    // Fetch usage stats
    const { data: usageRows, error: usageError } = await supabase
      .from("usage_events")
      .select("tokens_in, tokens_out, cost_estimate")
      .eq("account_id", id);

    if (usageError) throw new Error(usageError.message);

    const totalRequests = usageRows?.length || 0;
    const totalTokensIn = usageRows?.reduce((s: number, r: any) => s + Number(r.tokens_in || 0), 0) || 0;
    const totalTokensOut = usageRows?.reduce((s: number, r: any) => s + Number(r.tokens_out || 0), 0) || 0;
    const totalCost = usageRows?.reduce((s: number, r: any) => s + Number(r.cost_estimate || 0), 0) || 0;

    // Fetch recent transactions
    const { data: transactions } = await supabase
      .from("balance_transactions")
      .select("*")
      .eq("account_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      ok: true,
      data: {
        customer: {
          id: account.id,
          email: account.email,
          plan: account.plan,
          billing_status: account.billing_status,
          created_at: account.created_at,
        },
        balance: {
          balance_usd: Number(account.credit_balance_usd || 0),
        },
        usage_stats: {
          total_requests: totalRequests,
          total_tokens_in: totalTokensIn,
          total_tokens_out: totalTokensOut,
          total_cost: totalCost,
        },
        recent_transactions: transactions || [],
      },
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_get_customer" }, { status });
  }
}
