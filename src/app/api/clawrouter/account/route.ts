import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { maybeReconcileClawRouterAccount, shouldForceClawRouterAccountReconcile } from "@/lib/clawrouter-account-reconcile";
import { ensureClawRouterAccount, reconcileTopupsFromStripe } from "@/lib/clawrouter-topups";
import { reconcileInventoryAccessFromStripe } from "@/lib/clawrouter-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getUserAccount(userId: string, email: string | null, supabase: ReturnType<typeof getSupabaseAdminClient>) {
  await ensureClawRouterAccount({ supabase, accountId: userId, email });
  return supabase
    .from("accounts")
    .select("id, email, plan, billing_status, credit_balance_usd")
    .eq("id", userId)
    .maybeSingle();
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId, email } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    // ensureClawRouterAccount returns the account record (matched by email if exists, otherwise created).
    // Use the returned account ID for all subsequent queries to ensure we work with the
    // correct record even when the Supabase Auth userId differs from the accounts.id
    // (e.g. when the same email was used in both installer and website flows).
    const accountRow = await ensureClawRouterAccount({
      supabase,
      accountId: userId,
      email,
    });

    await maybeReconcileClawRouterAccount({
      shouldReconcile: shouldForceClawRouterAccountReconcile(request.nextUrl.searchParams),
      supabase,
      accountId: accountRow.id,
      email,
      reconcileTopups: reconcileTopupsFromStripe,
      reconcileInventoryAccess: reconcileInventoryAccessFromStripe,
    });

    const account = await supabase
      .from("accounts")
      .select("id, email, plan, billing_status, credit_balance_usd")
      .eq("id", accountRow.id)
      .maybeSingle();

    if (account?.error && account.error.code !== "PGRST116") {
      throw new Error(account.error.message || "failed_to_load_account");
    }

    const keys = await supabase
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .eq("account_id", accountRow.id)
      .eq("status", "active");

    if (keys?.error) {
      throw new Error(keys.error.message || "failed_to_count_api_keys");
    }

    const topups = await supabase
      .from("topup_transactions")
      .select("id, amount_usd, status, created_at")
      .eq("account_id", accountRow.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (topups?.error) {
      throw new Error(topups.error.message || "failed_to_load_topups");
    }

    return NextResponse.json(
      {
        ok: true,
        account: {
          id: accountRow.id,
          email: account.data?.email || email,
          plan: account.data?.plan || "free",
          billingStatus: account.data?.billing_status || "inactive",
          creditBalanceUsd: Number(account.data?.credit_balance_usd || 0),
          activeApiKeys: keys.count || 0,
        },
        topups: topups.data || [],
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "failed_to_load_clawrouter_account" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId, email } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();
    const body = await request.json();
    const { display_name } = body;

    if (typeof display_name !== "string" || display_name.length > 255) {
      return NextResponse.json({ ok: false, error: "invalid_display_name" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("accounts")
      .update({ display_name, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message || "failed_to_update_account" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_update_account" }, { status: 500 });
  }
}
