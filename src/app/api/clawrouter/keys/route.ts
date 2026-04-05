import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ensureClawRouterApiKey, listApiKeysForAccount } from "@/lib/clawrouter-keys";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId");
    const keys = await listApiKeysForAccount(getSupabaseAdminClient(), accountId);
    return NextResponse.json({ ok: true, keys });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_list_keys" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await ensureClawRouterApiKey(
      getSupabaseAdminClient(),
      typeof body.accountId === "string" ? body.accountId : null,
    );

    return NextResponse.json({
      ok: true,
      key: result.key,
      created: result.created,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_create_key" }, { status: 500 });
  }
}
