import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { injectInstallerConfig } from "@/lib/clawrouter-checkout";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";
import { ensureClawRouterApiKey } from "@/lib/clawrouter-keys";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { setupToken, bindingId, targetConfigPath } = body;

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const injection = await injectInstallerConfig({
      supabase,
      setupToken,
      targetConfigPath,
    });

    if (injection.configInjectionState !== "written") {
      return NextResponse.json({
        configInjectionState: "failed",
        configTarget: targetConfigPath || null,
        patchPreview: null,
        error: "Entitlement is not active",
      }, { status: 400 });
    }

    // Resolve real API key for the config patch
    let credentialRef = injection.credentialRef;

    if (injection.accountId) {
      const deliveredKeys = await listDeliveredKeysForAccount(supabase, injection.accountId);
      const activeKey = deliveredKeys.find((k: any) => k.status === "active" && k.plaintextKey);
      if (activeKey?.plaintextKey) {
        credentialRef = activeKey.plaintextKey;
      } else {
        const keyResult = await ensureClawRouterApiKey(supabase, injection.accountId);
        if (keyResult.key.plaintextSecret) {
          credentialRef = keyResult.key.plaintextSecret;
        }
      }
    }

    return NextResponse.json({
      configInjectionState: "written",
      configTarget: injection.configTarget || targetConfigPath || "~/.openclaw/openclaw.json",
      patchPreview: {
        provider: "clawrouter",
        credentialRef: credentialRef || injection.credentialRef,
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
