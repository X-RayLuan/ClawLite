import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { revealApiKey, ensureClawRouterApiKey } from "@/lib/clawrouter-keys";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    // Find the account for this user
    const { data: account } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!account) {
      return NextResponse.json(
        { ok: false, error: "account_not_found" },
        { status: 404 }
      );
    }

    let result;
    try {
      result = await revealApiKey(supabase, params.keyId, account.id);
    } catch (revealErr: any) {
      const msg = revealErr?.message || "";
      if (msg === "key_not_found" || msg === "key_not_recoverable") {
        return NextResponse.json({ ok: false, error: msg }, { status: msg === "key_not_found" ? 404 : 410 });
      }
      // Decryption failed — old key was encrypted with a different secret.
      // Delete it and create a fresh one.
      console.error("[keys/reveal] key decryption failed, regenerating:", revealErr);
      await supabase
        .from("api_keys")
        .delete()
        .eq("account_id", account.id)
        .eq("status", "active");
      const newKeyResult = await ensureClawRouterApiKey(supabase, account.id);
      result = await revealApiKey(supabase, newKeyResult.key.id, account.id);
    }

    return NextResponse.json(
      { ok: true, plaintextSecret: result.plaintextSecret },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    const message = error?.message || "unknown_error";
    if (message === "key_not_found") {
      return NextResponse.json({ ok: false, error: message }, { status: 404 });
    }
    if (message === "key_not_recoverable") {
      return NextResponse.json(
        { ok: false, error: "key_not_recoverable", detail: "This key was created before the reveal feature was enabled. Please regenerate the key." },
        { status: 410 }
      );
    }
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
