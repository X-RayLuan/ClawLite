import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/admin/customers/:id/balance - 手动调整余额
// body: { amount: number, reason: string }
// 生成 balance_transactions 记录
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    requireAdmin(request);
    const { id } = await params;
    const supabase = getSupabaseAdminClient();
    const body = await request.json();

    const { amount, reason } = body;

    if (typeof amount !== "number" || !reason) {
      return NextResponse.json({ ok: false, error: "amount (number) and reason (string) are required" }, { status: 400 });
    }

    // Get current account
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, credit_balance_usd")
      .eq("id", id)
      .maybeSingle();

    if (accountError) throw new Error(accountError.message);
    if (!account) return NextResponse.json({ ok: false, error: "customer_not_found" }, { status: 404 });

    const currentBalance = Number(account.credit_balance_usd || 0);
    const newBalance = Number((currentBalance + amount).toFixed(2));

    if (newBalance < 0) {
      return NextResponse.json({ ok: false, error: "adjustment would result in negative balance" }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Update account balance
    const { error: updateError } = await supabase
      .from("accounts")
      .update({ credit_balance_usd: newBalance, updated_at: now })
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);

    // Create transaction record
    const txType = amount >= 0 ? "manual_add" : "manual_deduct";
    const { data: tx, error: txError } = await supabase
      .from("balance_transactions")
      .insert({
        account_id: id,
        tx_type: txType,
        amount,
        balance_before: currentBalance,
        balance_after: newBalance,
        status: "completed",
        description: reason,
      })
      .select("*")
      .single();

    if (txError) throw new Error(txError.message);

    return NextResponse.json({
      ok: true,
      data: {
        account_id: id,
        previous_balance: currentBalance,
        new_balance: newBalance,
        adjustment: amount,
        transaction: tx,
      },
    });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_adjust_balance" }, { status });
  }
}
