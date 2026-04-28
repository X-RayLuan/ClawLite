import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance } from "@/lib/balance";

function hashSecret(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

function getKeyPrefix(key: string): string {
  return key.slice(0, 16);
}

async function validateApiKey(supabase: ReturnType<typeof import("@/lib/supabase-admin").getSupabaseAdminClient>, key: string) {
  const prefix = getKeyPrefix(key);
  const hash = hashSecret(key);

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, account_id, status, secret_hash")
    .eq("key_prefix", prefix)
    .eq("status", "active")
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  const row = data[0];
  if (row.secret_hash !== hash) {
    return null;
  }

  return { keyId: row.id, accountId: row.account_id };
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/claude/balance
// PRD: { balance: number, currency: string }
export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdminClient();

  // Parse API Key
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }
  const apiKey = authHeader.slice(7);
  if (!apiKey) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }

  // Validate API Key
  const keyInfo = await validateApiKey(supabase, apiKey);
  if (!keyInfo) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
  }

  // Get balance
  try {
    const balance = await checkBalance(keyInfo.accountId);

    // PRD response format: { balance: number, currency: string }
    return NextResponse.json({
      balance: Number(balance.availableBalanceUsd.toFixed(8)),
      currency: "USD",
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    if (err.message === "account_not_found") {
      return NextResponse.json({ error: "account_not_found" }, { status: 401 });
    }
    return NextResponse.json({ error: "balance_check_failed" }, { status: 500 });
  }
}
