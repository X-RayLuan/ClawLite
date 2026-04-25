import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getActiveEntitlementForAccount } from "@/lib/clawrouter-checkout";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";
import crypto from "crypto";

export const runtime = "nodejs";

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code, "utf8").digest("hex");
}

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
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!email || !email.includes("@") || !code) {
      return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
    }

    const normalizedCode = code.replace(/\D/g, "");
    if (normalizedCode.length !== 6) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const hashedCode = hashCode(normalizedCode);
    const now = new Date().toISOString();

    // First check if the code exists at all (wrong code)
    const anyRecord = await supabase
      .from("otp_codes")
      .select("id, expires_at")
      .eq("email", email)
      .eq("code_hash", hashedCode)
      .maybeSingle();

    if (!anyRecord?.data) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 401 });
    }

    // Check if expired
    if (new Date(anyRecord.data.expires_at) <= new Date(now)) {
      return NextResponse.json({ ok: false, error: "expired_code" }, { status: 401 });
    }

    // Check if already used
    const unusedRecord = await supabase
      .from("otp_codes")
      .select("id")
      .eq("email", email)
      .eq("code_hash", hashedCode)
      .eq("used", false)
      .maybeSingle();

    if (!unusedRecord?.data) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 401 });
    }

    // Mark OTP as used
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", unusedRecord.data.id);

    // Look up account by email
    const accountResult = await supabase
      .from("accounts")
      .select("id, email, credit_balance_usd")
      .eq("email", email)
      .maybeSingle();

    if (!accountResult?.data) {
      // No account yet — return ok: true but no account info
      return NextResponse.json({
        ok: true,
        accountId: null,
        email,
        isActive: false,
        balanceUsd: 0,
      });
    }

    const row = accountResult.data;
    const accountId = row.id;
    const balanceUsd = Number(row.credit_balance_usd || 0);
    const isActive = await isAccountActive(supabase, accountId);

    return NextResponse.json({
      ok: true,
      accountId,
      email: row.email,
      isActive,
      balanceUsd,
    });
  } catch (error: any) {
    console.error("[installer/auth/verify-otp] unexpected error:", error);
    return NextResponse.json({ ok: false, error: error?.message || "internal_error" }, { status: 500 });
  }
}
