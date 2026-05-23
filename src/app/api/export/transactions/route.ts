import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/export/transactions - 导出交易记录为 CSV
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const typeFilter = searchParams.get("type") || "all";

    let query = supabase
      .from("balance_transactions")
      .select("*")
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (typeFilter !== "all") {
      query = query.eq("tx_type", typeFilter);
    }

    const { data: transactions, error } = await query;

    if (error) throw new Error(error.message);

    // Generate CSV
    const headers = ["Time", "Type", "Amount", "Balance Before", "Balance After", "Status", "Description"];
    const rows = (transactions || []).map((tx: any) => [
      tx.created_at,
      tx.tx_type,
      tx.amount_usd,
      tx.balance_before_usd,
      tx.balance_after_usd,
      tx.status,
      tx.metadata?.description || tx.description || "",
    ]);

    const escapeCSV = (str: string) => {
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => escapeCSV(String(cell ?? ""))).join(","))
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "export_failed" },
      { status: 400 }
    );
  }
}
