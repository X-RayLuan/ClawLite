import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ensureClawRouterApiKey } from "@/lib/clawrouter-keys";
import {
  listDeliveredKeysForAccount,
  ensureManagedKeyDelivery,
} from "@/lib/clawrouter-delivery";
import { getActiveEntitlementForAccount } from "@/lib/clawrouter-checkout";

export const runtime = "nodejs";

async function rotateAndCreateKey(supabase: any, accountId: string): Promise<string | null> {
  // Mark all existing active api_keys as inactive so ensureClawRouterApiKey creates a new one
  await supabase
    .from("api_keys")
    .update({ status: "inactive" })
    .eq("account_id", accountId)
    .eq("status", "active");

  const keyResult = await ensureClawRouterApiKey(supabase, accountId);
  if (!keyResult.key.plaintextSecret) return null;

  // Persist plaintext to deliveries table for future retrieval
  await ensureManagedKeyDelivery({
    supabase,
    accountId,
    apiKey: keyResult.key,
  });

  return keyResult.key.plaintextSecret;
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

    // Verify account is active by checking entitlement status
    const entitlement = await getActiveEntitlementForAccount(supabase, accountId);
    if (!entitlement) {
      return NextResponse.json({
        provisioningState: "failed",
        bindingId: null,
        credentialRef: null,
        provider: "clawrouter",
        model: "clawrouter/auto",
        error: "Account is not active (no entitlement found)",
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
      if (keyResult.key.plaintextSecret) {
        plaintextKey = keyResult.key.plaintextSecret;
        await ensureManagedKeyDelivery({ supabase, accountId, apiKey: keyResult.key });
      } else {
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
