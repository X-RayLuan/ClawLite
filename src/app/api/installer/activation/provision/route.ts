import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ensureClawRouterApiKey, revealApiKey } from "@/lib/clawrouter-keys";
import {
  listDeliveredKeysForAccount,
  ensureManagedKeyDelivery,
} from "@/lib/clawrouter-delivery";
import { getActiveEntitlementForAccount } from "@/lib/clawrouter-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function rotateAndCreateKey(supabase: any, accountId: string): Promise<string | null> {
  await supabase
    .from("api_keys")
    .update({ status: "inactive" })
    .eq("account_id", accountId)
    .eq("status", "active");

  const keyResult = await ensureClawRouterApiKey(supabase, accountId);
  const revealed = await revealApiKey(supabase, keyResult.key.id, accountId);
  await ensureManagedKeyDelivery({
    supabase,
    accountId,
    apiKey: { ...keyResult.key, plaintextSecret: revealed.plaintextSecret },
  });

  return revealed.plaintextSecret;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { setupToken, accountId } = body;

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }
    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Verify account is active by checking entitlement OR balance
    // (matches bootstrap's isAccountActive logic)
    const entitlement = await getActiveEntitlementForAccount(supabase, accountId);
    const hasEntitlement = !!entitlement;

    // Also check credit balance as fallback (allows topup-without-entitlement users to provision)
    const accountBalance = await supabase
      .from("accounts")
      .select("credit_balance_usd")
      .eq("id", accountId)
      .maybeSingle();
    const hasBalance = !!(accountBalance?.data && Number(accountBalance.data.credit_balance_usd || 0) > 0);

    if (!hasEntitlement && !hasBalance) {
      return NextResponse.json({
        provisioningState: "failed",
        bindingId: null,
        credentialRef: null,
        provider: "clawrouter",
        model: "clawrouter/auto",
        error: "Account has no entitlement and no balance",
      }, { status: 400 });
    }

    // Look for an existing active managed_key delivery
    const deliveredKeys = await listDeliveredKeysForAccount(supabase, accountId);
    const managedDelivered = deliveredKeys.find(
      (k: any) =>
        k.status === "active" &&
        k.deliveryMode === "managed_key" &&
        k.plaintextKey,
    );

    let plaintextKey: string | null = managedDelivered?.plaintextKey || null;

    if (!plaintextKey) {
      // No existing managed delivery — create one
      const keyResult = await ensureClawRouterApiKey(supabase, accountId);
      try {
        const revealed = await revealApiKey(supabase, keyResult.key.id, accountId);
        plaintextKey = revealed.plaintextSecret;
        await ensureManagedKeyDelivery({ supabase, accountId, apiKey: { ...keyResult.key, plaintextSecret: revealed.plaintextSecret } });
      } catch {
        plaintextKey = await rotateAndCreateKey(supabase, accountId);
      }
    }

    if (!plaintextKey) {
      return NextResponse.json({
        provisioningState: "failed",
        bindingId: null,
        credentialRef: null,
        provider: "clawrouter",
        model: "clawrouter/auto",
        error: "Failed to resolve API key",
      }, { status: 500 });
    }

    return NextResponse.json({
      provisioningState: "bound",
      bindingId: `clawrouter-account:${accountId}`,
      credentialRef: plaintextKey,
      provider: "clawrouter",
      model: "clawrouter/auto",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "provision_failed" },
      { status: 500 },
    );
  }
}
