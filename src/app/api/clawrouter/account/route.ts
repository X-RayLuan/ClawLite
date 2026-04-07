import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ensureClawRouterAccount } from "@/lib/clawrouter-topups";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId, email } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    await ensureClawRouterAccount({
      supabase,
      accountId: userId,
      email,
    });

    const account = await supabase
      .from("accounts")
      .select("id, email, plan, billing_status, credit_balance_usd")
      .eq("id", userId)
      .maybeSingle();

    if (account?.error && account.error.code !== "PGRST116") {
      throw new Error(account.error.message || "failed_to_load_account");
    }

    const keys = await supabase
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .eq("account_id", userId)
      .eq("status", "active");

    if (keys?.error) {
      throw new Error(keys.error.message || "failed_to_count_api_keys");
    }

    const topups = await supabase
      .from("topup_transactions")
      .select("id, amount_usd, status, created_at")
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (topups?.error) {
      throw new Error(topups.error.message || "failed_to_load_topups");
    }

    const deliveredKeys = await listDeliveredKeysForAccount(supabase, userId);

    return NextResponse.json(
      {
        ok: true,
        account: {
          id: userId,
          email: account.data?.email || email,
          plan: account.data?.plan || "free",
          billingStatus: account.data?.billing_status || "inactive",
          creditBalanceUsd: Number(account.data?.credit_balance_usd || 0),
          activeApiKeys: keys.count || 0,
        },
        topups: topups.data || [],
        deliveredKeys,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "failed_to_load_clawrouter_account" },
      { status: 400 },
    );
  }
}
