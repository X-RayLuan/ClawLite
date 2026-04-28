import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { resolveInstallerActivationState, getActiveEntitlementForAccount } from "@/lib/clawrouter-checkout";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const setupToken = request.nextUrl.searchParams.get("setupToken");
    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken query param is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    if (accountId) {
      const active = await isAccountActive(supabase, accountId);
      return NextResponse.json({
        purchaseState: active ? "completed" : "checkout_pending",
      });
    }

    const activation = await resolveInstallerActivationState(supabase, setupToken);

    if (activation.account.accountId) {
      const active = await isAccountActive(supabase, activation.account.accountId);
      if (active) {
        return NextResponse.json({ purchaseState: "completed" });
      }
    }

    const purchaseState = activation.latestCheckoutSession?.purchaseState || "not_started";
    return NextResponse.json({ purchaseState });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "purchase_state_failed" },
      { status: 500 },
    );
  }
}
