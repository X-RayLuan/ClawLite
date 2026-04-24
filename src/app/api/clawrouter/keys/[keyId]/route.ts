import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ keyId: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();
    const { keyId } = await params;

    // Find the account for this user
    const { data: account } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ ok: false, error: "account_not_found" }, { status: 404 });
    }

    // Verify the key belongs to this account
    const { data: key, error: keyError } = await supabase
      .from("api_keys")
      .select("id, account_id")
      .eq("id", keyId)
      .maybeSingle();

    if (keyError || !key) {
      return NextResponse.json({ ok: false, error: "key_not_found" }, { status: 404 });
    }

    if (key.account_id !== account.id) {
      return NextResponse.json({ ok: false, error: "key_not_found" }, { status: 404 });
    }

    // Delete the key
    const { error: deleteError } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", keyId);

    if (deleteError) {
      return NextResponse.json({ ok: false, error: deleteError.message || "failed_to_delete_key" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_delete_key" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();
    const { keyId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["revoke", "activate"].includes(action)) {
      return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
    }

    // Find the account for this user
    const { data: account } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ ok: false, error: "account_not_found" }, { status: 404 });
    }

    // Verify the key belongs to this account
    const { data: key, error: keyError } = await supabase
      .from("api_keys")
      .select("id, account_id, status")
      .eq("id", keyId)
      .maybeSingle();

    if (keyError || !key) {
      return NextResponse.json({ ok: false, error: "key_not_found" }, { status: 404 });
    }

    if (key.account_id !== account.id) {
      return NextResponse.json({ ok: false, error: "key_not_found" }, { status: 404 });
    }

    const newStatus = action === "revoke" ? "revoked" : "active";
    const updateData: Record<string, unknown> = { status: newStatus };
    if (action === "revoke") {
      updateData.revoked_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("api_keys")
      .update(updateData)
      .eq("id", keyId);

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message || "failed_to_update_key" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: newStatus }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_update_key" }, { status: 500 });
  }
}
