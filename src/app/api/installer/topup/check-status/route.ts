import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getActiveEntitlementForAccount } from "@/lib/clawrouter-checkout";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";

export const runtime = "nodejs";

async function isAccountActive(supabase: any, accountId: string): Promise<boolean> {
  const entitlement = await getActiveEntitlementForAccount(supabase, accountId);
  if (entitlement) return true;

  const deliveredKeys = await listDeliveredKeysForAccount(supabase, accountId);
  if (deliveredKeys.some((k: any) => k.status === "active" && k.plaintextKey)) return true;

  const account = await supabase
    .from("accounts")
    .select("credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();
  if (account?.data && Number(account.data.credit_balance_usd || 0) > 0) return true;

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId") || "";

    if (!accountId) {
      return NextResponse.json({ ok: false, error: "missing_accountId" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const accountResult = await supabase
      .from("accounts")
      .select("credit_balance_usd")
      .eq("id", accountId)
      .maybeSingle();

    const balanceUsd = accountResult?.data
      ? Number(accountResult.data.credit_balance_usd || 0)
      : 0;
    const isActive = await isAccountActive(supabase, accountId);

    return NextResponse.json({ ok: true, isActive, balanceUsd });
  } catch (error: any) {
    console.error("[installer/topup/check-status] unexpected error:", error);
    return NextResponse.json({ ok: false, error: error?.message || "internal_error" }, { status: 500 });
  }
}
