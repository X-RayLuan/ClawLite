import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET /api/admin/recharge-orders - 充值订单列表（分页、状态筛选）
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const supabase = getSupabaseAdminClient();
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") || "20")));
    const status = searchParams.get("status")?.trim() || null;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("recharge_orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return NextResponse.json({
      ok: true,
      data: {
        orders: data || [],
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
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_list_orders" }, { status });
  }
}
