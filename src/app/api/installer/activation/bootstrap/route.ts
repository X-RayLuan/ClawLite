import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { resolveInstallerActivationState } from "@/lib/clawrouter-checkout";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { downloadSessionId, installerInstanceId, platform, appVersion } = body;

    if (!installerInstanceId) {
      return NextResponse.json({ error: "installerInstanceId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const setupToken = downloadSessionId || `stp_${crypto.randomUUID()}`;

    const activation = await resolveInstallerActivationState(supabase, setupToken);

    const entitlementStatus = activation.entitlement.status;
    const allowedPaths = entitlementStatus === "active"
      ? ["connect_existing_purchase", "buy_and_connect", "use_own_key"]
      : ["buy_and_connect", "use_own_key"];
    const recommendedPath = entitlementStatus === "active" ? "connect_existing_purchase" : "buy_and_connect";

    return NextResponse.json({
      setupToken,
      setupTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      account: {
        accountId: activation.account.accountId || null,
        emailMasked: activation.account.email
          ? activation.account.email.replace(/^(.{2}).*(@.*)$/, "$1***$2")
          : null,
      },
      entitlement: {
        status: entitlementStatus,
        plan: "clawrouter",
      },
      allowedPaths,
      recommendedPath,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "bootstrap_failed" },
      { status: 500 },
    );
  }
}
