import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { resolveInstallerActivationState } from "@/lib/clawrouter-checkout";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const setupToken = request.nextUrl.searchParams.get("setupToken");

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken query param is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const activation = await resolveInstallerActivationState(supabase, setupToken);

    const purchaseState = activation.entitlement.status === "active"
      ? "completed"
      : activation.latestCheckoutSession?.purchaseState || "not_started";

    return NextResponse.json({ purchaseState });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "purchase_state_failed" },
      { status: 500 },
    );
  }
}
