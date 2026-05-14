import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getModels } from "@/lib/model-config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    // Get user's plan and entitlements
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, plan")
      .eq("id", userId)
      .maybeSingle();

    if (accountError || !account) {
      return NextResponse.json({ ok: false, error: "account_not_found" }, { status: 404 });
    }

    // Get active entitlement
    const { data: entitlement, error: entitlementError } = await supabase
      .from("entitlements")
      .select("monthly_request_limit, monthly_token_limit, model_allowlist, plan")
      .eq("account_id", account.id)
      .eq("status", "active")
      .maybeSingle();

    if (entitlementError) {
      return NextResponse.json({ ok: false, error: entitlementError.message || "failed_to_load_entitlements" }, { status: 500 });
    }

    const isFree = !entitlement || account.plan === "free";

    // Determine quota based on entitlement
    const quota = {
      monthlyRequests: entitlement?.monthly_request_limit ?? (isFree ? 100 : null),
      monthlyTokens: entitlement?.monthly_token_limit ?? (isFree ? 1000000 : null),
      rpmLimit: (entitlement as any)?.rpm_limit ?? (isFree ? 10 : null),
    };

    // Fetch dynamic model list from model-config (backed by ezrouter)
    const allModels = await getModels()
    const modelList = Object.values(allModels).map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.providerId,
      contextWindow: m.contextWindow,
      inputPer1M: m.inputPer1M,
      outputPer1M: m.outputPer1M,
    }))

    // Model allowlist: if set, only those models are allowed
    let models = modelList;
    if (entitlement?.model_allowlist && Array.isArray(entitlement.model_allowlist) && entitlement.model_allowlist.length > 0) {
      const allowlist = new Set(entitlement.model_allowlist as string[]);
      models = modelList.filter((m) => allowlist.has(m.id));
    }

    return NextResponse.json(
      {
        ok: true,
        models,
        quota,
        plan: entitlement?.plan || account.plan || "free",
      },
      { headers: { "Cache-Control": "no-store, max-age=3600" } },
    );
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_load_models" }, { status: 500 });
  }
}
