import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  listDeliveredKeysForAccount,
  ensureManagedKeyDelivery,
} from "@/lib/clawrouter-delivery";
import { ensureClawRouterApiKey, revealApiKey } from "@/lib/clawrouter-keys";

export const runtime = "nodejs";

const CLAWLITE_BASE_URL = "https://clawlite.ai/api/openai";

async function rotateAndCreateKey(supabase: any, accountId: string): Promise<string | null> {
  await supabase
    .from("api_keys")
    .update({ status: "inactive" })
    .eq("account_id", accountId)
    .eq("status", "active");

  const keyResult = await ensureClawRouterApiKey(supabase, accountId);
  const revealed = await revealApiKey(supabase, keyResult.key.id, accountId);
  await ensureManagedKeyDelivery({ supabase, accountId, apiKey: { ...keyResult.key, plaintextSecret: revealed.plaintextSecret } });
  return revealed.plaintextSecret;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { setupToken, accountId, targetConfigPath, baseUrl } = body;

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }
    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Look for an existing active managed_key delivery
    const deliveredKeys = await listDeliveredKeysForAccount(supabase, accountId);
    const managedKey = deliveredKeys.find(
      (k: any) =>
        k.status === "active" &&
        k.deliveryMode === "managed_key" &&
        k.plaintextKey,
    );
    let plaintextKey: string | null = managedKey?.plaintextKey || null;

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
        configInjectionState: "failed",
        configTarget: targetConfigPath || null,
        patchPreview: null,
        error: "Failed to resolve API key",
      }, { status: 400 });
    }

    // Per PRD: write clawlite provider config with baseUrl
    const resolvedBaseUrl = (typeof baseUrl === "string" && baseUrl.trim() !== "")
      ? baseUrl.trim()
      : CLAWLITE_BASE_URL;

    return NextResponse.json({
      configInjectionState: "written",
      configTarget: targetConfigPath || "~/.openclaw/openclaw.json",
      patchPreview: {
        provider: "clawlite",
        baseUrl: resolvedBaseUrl,
        apiKey: plaintextKey,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "inject_config_failed" },
      { status: 500 },
    );
  }
}
