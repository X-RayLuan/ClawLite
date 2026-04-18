import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET /api/admin/customers - 客户列表（分页、搜索）
// 返回：id, email, balance, created_at, last_active
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const supabase = getSupabaseAdminClient();
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") || "20")));
    const search = searchParams.get("search")?.trim() || "";
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("accounts")
      .select("id, email, credit_balance_usd, created_at, updated_at as last_active, plan, billing_status", { count: "exact" });

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    query = query.order("created_at", { ascending: false }).range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    const customers = (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      balance: Number(row.credit_balance_usd || 0),
      created_at: row.created_at,
      last_active: row.last_active,
      plan: row.plan,
      billing_status: row.billing_status,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        customers,
        pagination: {
          page,
          page_size: pageSize,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / pageSize),
        },
      },
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_list_customers" }, { status });
  }
}
