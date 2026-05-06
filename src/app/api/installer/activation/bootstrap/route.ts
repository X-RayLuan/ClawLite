import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { resolveInstallerActivationState, getActiveEntitlementForAccount } from "@/lib/clawrouter-checkout";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAccountActive(supabase: any, accountId: string): Promise<boolean> {
  const entitlement = await getActiveEntitlementForAccount(supabase, accountId);
  if (entitlement) return true;

  const deliveredKeys = await listDeliveredKeysForAccount(supabase, accountId);
  if (deliveredKeys.some((k: any) => k.status === "active" && k.plaintextKey)) return true;

  const account = await supabase
    .from("accounts")
    .select("credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();
  if (account?.data && Number(account.data.credit_balance_usd || 0) > 0) return true;

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { downloadSessionId, accountId, installerInstanceId, platform, appVersion } = body;

    if (!installerInstanceId) {
      return NextResponse.json({ error: "installerInstanceId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const setupToken = downloadSessionId || `stp_${crypto.randomUUID()}`;

    // If accountId is provided, check entitlement directly
    let entitlementStatus: "active" | "inactive" = "inactive";
    let resolvedAccountId: string | null = accountId || null;
    let resolvedEmail: string | null = null;

    if (accountId) {
      // Support both UUID accountId and email
      const isEmail = accountId.includes("@");
      let lookupAccountId = accountId;

      if (isEmail) {
        const accountRow = await supabase
          .from("accounts")
          .select("id, email")
          .eq("email", accountId)
          .maybeSingle();

        if (accountRow?.data) {
          lookupAccountId = accountRow.data.id;
          resolvedAccountId = accountRow.data.id;
          resolvedEmail = accountRow.data.email || null;
        } else {
          // Email not found — fall through with inactive
          resolvedAccountId = null;
          resolvedEmail = accountId;
        }
      } else {
        const accountRow = await supabase
          .from("accounts")
          .select("id, email")
          .eq("id", accountId)
          .maybeSingle();

        if (accountRow?.data) {
          resolvedEmail = accountRow.data.email || null;
        }
      }

      if (resolvedAccountId) {
        const active = await isAccountActive(supabase, resolvedAccountId);
        if (active) {
          entitlementStatus = "active";
        }
        // Also resolve activation state so a checkout session is created/linked
        // for the existing account — this ensures the purchase API can find it
        await resolveInstallerActivationState(supabase, setupToken, resolvedAccountId);
      }
    } else {
      const activation = await resolveInstallerActivationState(supabase, setupToken);
      resolvedAccountId = activation.account.accountId || null;
      resolvedEmail = activation.account.email || null;
      if (resolvedAccountId) {
        const active = await isAccountActive(supabase, resolvedAccountId);
        entitlementStatus = active ? "active" : "inactive";
      } else {
        entitlementStatus = activation.entitlement.status === "active" ? "active" : "inactive";
      }
    }

    const allowedPaths = entitlementStatus === "active"
      ? ["connect_now", "buy_and_connect", "use_own_key"]
      : ["buy_and_connect", "use_own_key"];
    const recommendedPath = entitlementStatus === "active" ? "connect_now" : "buy_and_connect";

    return NextResponse.json({
      setupToken,
      setupTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      account: {
        accountId: resolvedAccountId,
        emailMasked: resolvedEmail
          ? resolvedEmail.replace(/^(.{2}).*(@.*)$/, "$1***$2")
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
