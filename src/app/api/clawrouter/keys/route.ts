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
    const keys = await listApiKeysForAccount(getSupabaseAdminClient(), userId);
    return NextResponse.json({ ok: true, keys }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_list_keys" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();
    const result = await ensureClawRouterApiKey(supabase, userId);
    const delivery = await ensureManagedKeyDelivery({
      supabase,
      accountId: userId,
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
