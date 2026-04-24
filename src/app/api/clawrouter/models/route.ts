import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const SUPPORTED_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "openai", contextWindow: 128000 },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", contextWindow: 128000 },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "openai", contextWindow: 128000 },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "anthropic", contextWindow: 200000 },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", provider: "anthropic", contextWindow: 200000 },
  { id: "deepseek-chat", name: "DeepSeek Chat", provider: "deepseek", contextWindow: 128000 },
  { id: "deepseek-reasoner", name: "DeepSeek Reasoner", provider: "deepseek", contextWindow: 128000 },
  { id: "o3", name: "OpenAI o3", provider: "openai", contextWindow: 128000 },
  { id: "o4-mini", name: "OpenAI o4-mini", provider: "openai", contextWindow: 128000 },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", contextWindow: 1000000 },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", contextWindow: 128000 },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google", contextWindow: 2000000 },
];

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

    // Model allowlist: if set, only those models are allowed
    let models = SUPPORTED_MODELS;
    if (entitlement?.model_allowlist && Array.isArray(entitlement.model_allowlist) && entitlement.model_allowlist.length > 0) {
      const allowlist = new Set(entitlement.model_allowlist as string[]);
      models = SUPPORTED_MODELS.filter((m) => allowlist.has(m.id));
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
