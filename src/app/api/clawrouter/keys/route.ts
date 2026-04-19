import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ensureClawRouterApiKey, listApiKeysForAccount } from "@/lib/clawrouter-keys";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { ensureManagedKeyDelivery } from "@/lib/clawrouter-delivery";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    // Find or create account for this auth user
    const { data: existingAccount } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingAccount) {
      return NextResponse.json({ ok: true, keys: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    }

    const keys = await listApiKeysForAccount(supabase, existingAccount.id);
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

    // Find or create account for this auth user
    const { data: existingAccount } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let accountId = existingAccount?.id;
    if (!accountId) {
      const { data: newAccount, error: accountError } = await supabase
        .from("accounts")
        .insert({ user_id: userId, email: email || null })
        .select("id")
        .single();

      if (accountError || !newAccount) {
        return NextResponse.json({ ok: false, error: "failed_to_create_account" }, { status: 500 });
      }
      accountId = newAccount.id;
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
      delivery,
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_create_key" }, { status: 500 });
  }
}
