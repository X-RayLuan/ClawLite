import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getActiveEntitlementForAccount } from "@/lib/clawrouter-checkout";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";
import { ensureClawRouterApiKey, revealApiKey } from "@/lib/clawrouter-keys";
import crypto from "crypto";

export const runtime = "nodejs";

const CLAWLITE_BASE_URL = "https://clawlite.ai/api/openai";

function withCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin") || "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 204 });
  return withCors(request, response);
}

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
      return withCors(request, NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 }));
    }

    const normalizedCode = code.replace(/\D/g, "");
    if (normalizedCode.length !== 6) {
      return withCors(request, NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 }));
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
      return withCors(request, NextResponse.json({ ok: false, error: "invalid_code" }, { status: 401 }));
    }

    // Check if expired
    if (new Date(anyRecord.data.expires_at) <= new Date(now)) {
      return withCors(request, NextResponse.json({ ok: false, error: "expired_code" }, { status: 401 }));
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
      return withCors(request, NextResponse.json({ ok: false, error: "invalid_code" }, { status: 401 }));
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
      return withCors(request, NextResponse.json({
        ok: true,
        accountId: null,
        email,
        isActive: false,
        apiKey: null,
        balance: 0,
        currency: "USD",
      }));
    }

    const row = accountResult.data;
    const accountId = row.id;
    const balanceUsd = Number(row.credit_balance_usd || 0);
    const isActive = await isAccountActive(supabase, accountId);

    // Get or create API key, then decrypt to get plaintext
    let apiKey: string | null = null;
    try {
      const keyResult = await ensureClawRouterApiKey(supabase, accountId);
      const revealed = await revealApiKey(supabase, keyResult.key.id, accountId);
      apiKey = revealed.plaintextSecret;
    } catch (keyErr) {
      console.error("[installer/auth/verify-otp] failed to get API key:", keyErr);
    }

    return withCors(request, NextResponse.json({
      ok: true,
      accountId,
      email: row.email,
      isActive,
      // PRD: return plaintext API key directly (no encryption/decryption)
      apiKey,
      baseUrl: CLAWLITE_BASE_URL,
      balance: balanceUsd,
      currency: "USD",
    }));
  } catch (error: any) {
    console.error("[installer/auth/verify-otp] unexpected error:", error);
    return withCors(request, NextResponse.json({ ok: false, error: error?.message || "internal_error" }, { status: 500 }));
  }
}
