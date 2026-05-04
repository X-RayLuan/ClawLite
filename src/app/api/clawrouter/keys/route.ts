import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ensureClawRouterApiKey, listApiKeysForAccount } from "@/lib/clawrouter-keys";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { ensureManagedKeyDelivery } from "@/lib/clawrouter-delivery";
import { ensureClawRouterAccount } from "@/lib/clawrouter-topups";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    // Find account by id = userId first, then fall back to user_id
    // This ensures we find the correct clawrouter account regardless of
    // which flow was used to create it
    const { data: existingAccount } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    let accountId = existingAccount?.id;
    if (!accountId) {
      const { data: existingByUserId } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      accountId = existingByUserId?.id;
    }

    if (!accountId) {
      return NextResponse.json({ ok: true, keys: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    }

    const keys = await listApiKeysForAccount(supabase, accountId);
    return NextResponse.json({ ok: true, keys }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_list_keys" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId, email } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();
    const body = await request.json().catch(() => ({}));
    const { force } = body;

    // Ensure the account exists with id = userId (consistent with ensureClawRouterAccount)
    // This avoids creating a duplicate account with auto-generated id when
    // the account was previously created via a different flow (e.g., topup before key creation)
    let accountId: string;
    const { data: existingAccount } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existingAccount) {
      accountId = existingAccount.id;
    } else {
      // Also check by user_id to find accounts created with auto-generated id
      const { data: existingByUserId } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingByUserId) {
        accountId = existingByUserId.id;
      } else {
        // Create account with id = userId to ensure consistency
        await ensureClawRouterAccount({ supabase, accountId: userId, email });
        accountId = userId;
      }
    }

    // If force=true, delete all existing active keys first
    if (force) {
      await supabase
        .from("api_keys")
        .delete()
        .eq("account_id", accountId)
        .eq("status", "active");
    }

    const result = await ensureClawRouterApiKey(supabase, accountId);
    const delivery = await ensureManagedKeyDelivery({
      supabase,
      accountId,
      apiKey: result.key,
    });

    return NextResponse.json({
      ok: true,
      key: result.key,
      created: result.created,
      plaintextSecret: result.plaintextSecret ?? null,
      delivery,
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_create_key" }, { status: 500 });
  }
}
