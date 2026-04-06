import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { provisionInstallerActivation } from "@/lib/clawrouter-checkout";
import { ensureClawRouterApiKey } from "@/lib/clawrouter-keys";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { setupToken, deviceLabel, platform } = body;

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const provisioning = await provisionInstallerActivation({
      supabase,
      setupToken,
      platform,
    });

    if (provisioning.provisioningState !== "provisioned" || !provisioning.accountId) {
      return NextResponse.json({
        provisioningState: "failed",
        bindingId: null,
        credentialRef: null,
        provider: "clawrouter",
        model: "clawrouter/auto",
        error: "Entitlement is not active",
      }, { status: 400 });
    }

    // Try to get a real API key for this account
    let plaintextKey: string | null = null;

    // First check delivered keys (inventory keys from purchase)
    const deliveredKeys = await listDeliveredKeysForAccount(supabase, provisioning.accountId);
    const activeDelivered = deliveredKeys.find((k: any) => k.status === "active" && k.plaintextKey);
    if (activeDelivered?.plaintextKey) {
      plaintextKey = activeDelivered.plaintextKey;
    }

    // Fallback: ensure a managed API key exists
    if (!plaintextKey) {
      const keyResult = await ensureClawRouterApiKey(supabase, provisioning.accountId);
      if (keyResult.key.plaintextSecret) {
        plaintextKey = keyResult.key.plaintextSecret;
      }
    }

    return NextResponse.json({
      provisioningState: "bound",
      bindingId: provisioning.bindingId,
      credentialRef: plaintextKey || provisioning.credentialRef,
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
