import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ensureClawRouterAccount } from "@/lib/clawrouter-topups";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";
import { findEzRouterApiKeyByName, getEzRouterUsageStats } from "@/lib/ezrouter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId, email } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    await ensureClawRouterAccount({
      supabase,
      accountId: userId,
      email,
    });

    const searchParams = request.nextUrl.searchParams;
    const requestedKeyName = searchParams.get("keyName")?.trim() || null;

    const account = await supabase
      .from("accounts")
      .select("id, email, credit_balance_usd")
      .eq("id", userId)
      .maybeSingle();

    if (account?.error && account.error.code !== "PGRST116") {
      throw new Error(account.error.message || "failed_to_load_account");
    }

    const deliveredKeys = await listDeliveredKeysForAccount(supabase, userId);
    // 统一使用 managed_key，inventory_key 已移除
    const managedKeys = deliveredKeys.filter((key: (typeof deliveredKeys)[number]) => key.deliveryMode === "managed_key");

    let resolvedKeyName = requestedKeyName;
    if (!resolvedKeyName) {
      resolvedKeyName = managedKeys[0]?.displayName || null;
    }

    if (!resolvedKeyName) {
      throw new Error("missing_key_name_and_no_managed_key_found");
    }

    const ownedKey = managedKeys.find((key: (typeof managedKeys)[number]) => key.displayName === resolvedKeyName) || null;
    if (!ownedKey) {
      throw new Error("key_not_owned_by_account");
    }

    const ezrouterKey = await findEzRouterApiKeyByName(resolvedKeyName);
    if (!ezrouterKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "ezrouter_key_not_found",
          keyName: resolvedKeyName,
        },
        { status: 404 },
      );
    }

    const usage = await getEzRouterUsageStats(ezrouterKey.id);
    const creditedBalanceUsd = Number(account.data?.credit_balance_usd || 0);
    const remainingBalanceUsd = Math.max(0, creditedBalanceUsd - usage.totalCost);

    return NextResponse.json(
      {
        ok: true,
        key: {
          requestedName: requestedKeyName,
          resolvedName: resolvedKeyName,
          ezrouterId: ezrouterKey.id,
          keyPrefix: ezrouterKey.keyPrefix || ownedKey.keyPrefix,
          isActive: ezrouterKey.isActive,
          lastUsedTime: ezrouterKey.lastUsedTime || null,
          createTime: ezrouterKey.createTime || null,
        },
        usage,
        balance: {
          creditedBalanceUsd,
          usedCostUsd: usage.totalCost,
          remainingBalanceUsd,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "failed_to_load_ezrouter_key_usage",
      },
      { status: 400 },
    );
  }
}
