import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { resolveInstallerActivationState } from "@/lib/clawrouter-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/installer/activation/validate?setupToken=xxx
export async function GET(request: NextRequest) {
  try {
    const setupToken = request.nextUrl.searchParams.get("setupToken");

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const start = Date.now();

    // Check if the setup token resolves to a valid account with active entitlement
    const activation = await resolveInstallerActivationState(supabase, setupToken);
    const latencyMs = Date.now() - start;

    // Gateway reachability: try a simple DB ping
    let gatewayReachable = false;
    try {
      const { error } = await supabase.from("accounts").select("id").limit(1);
      gatewayReachable = !error;
    } catch {
      gatewayReachable = false;
    }

    // accountConfirmed: setup token must resolve to an account with active entitlement
    const accountConfirmed = activation.activationUnlocked && activation.account.accountId !== null;

    // All checks must pass for validation to be considered "passed"
    const validationPassed = gatewayReachable && accountConfirmed;

    return NextResponse.json({
      validationState: validationPassed ? "passed" : "failed",
      gatewayReachable,
      accountConfirmed,
      entitlementStatus: activation.entitlement.status,
      latencyMs,
      errors: !validationPassed
        ? [
            !gatewayReachable ? "gateway_unreachable" : null,
            !accountConfirmed ? "account_not_confirmed" : null,
          ].filter(Boolean)
        : [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        validationState: "failed",
        gatewayReachable: false,
        accountConfirmed: false,
        latencyMs: null,
        errors: ["validation_error", error?.message].filter(Boolean),
      },
      { status: 500 },
    );
  }
}
