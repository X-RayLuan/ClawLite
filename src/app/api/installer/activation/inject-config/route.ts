import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  listDeliveredKeysForAccount,
  ensureManagedKeyDelivery,
  assignInventoryKeyToAccount,
} from "@/lib/clawrouter-delivery";
import { ensureClawRouterApiKey } from "@/lib/clawrouter-keys";

export const runtime = "nodejs";

async function rotateAndCreateKey(supabase: any, accountId: string): Promise<string | null> {
  await supabase
    .from("api_keys")
    .update({ status: "inactive" })
    .eq("account_id", accountId)
    .eq("status", "active");

  const keyResult = await ensureClawRouterApiKey(supabase, accountId);
  if (!keyResult.key.plaintextSecret) return null;

  await ensureManagedKeyDelivery({ supabase, accountId, apiKey: keyResult.key });
  return keyResult.key.plaintextSecret;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { setupToken, accountId, targetConfigPath } = body;

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }
    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const deliveredKeys = await listDeliveredKeysForAccount(supabase, accountId);
    // Prefer inventory_key (real upstream) over managed_key
    const inventoryKey = deliveredKeys.find(
      (k: any) => k.status === "active" && k.plaintextKey && k.deliveryMode === "inventory_key"
    );
    const managedKey = deliveredKeys.find(
      (k: any) => k.status === "active" && k.plaintextKey && k.deliveryMode === "managed_key"
    );
    let credentialRef: string | null = inventoryKey?.plaintextKey || managedKey?.plaintextKey || null;

    if (!credentialRef) {
      // Try assigning a real inventory key first
      const inventoryAssignment = await assignInventoryKeyToAccount({ supabase, accountId });
      if (inventoryAssignment.delivery?.plaintextKey) {
        credentialRef = inventoryAssignment.delivery.plaintextKey;
      } else {
        const keyResult = await ensureClawRouterApiKey(supabase, accountId);
        if (keyResult.key.plaintextSecret) {
          credentialRef = keyResult.key.plaintextSecret;
          await ensureManagedKeyDelivery({ supabase, accountId, apiKey: keyResult.key });
        } else {
          credentialRef = await rotateAndCreateKey(supabase, accountId);
        }
      }
    }

    if (!credentialRef) {
      return NextResponse.json({
        configInjectionState: "failed",
        configTarget: targetConfigPath || null,
        patchPreview: null,
        error: "Failed to resolve API key",
      }, { status: 400 });
    }

    return NextResponse.json({
      configInjectionState: "written",
      configTarget: targetConfigPath || "~/.openclaw/openclaw.json",
      patchPreview: {
        provider: "clawrouter",
        credentialRef,
        model: "clawrouter/auto",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "inject_config_failed" },
      { status: 500 },
    );
  }
}
