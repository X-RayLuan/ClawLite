import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getModels } from "@/lib/model-config";

function hashSecret(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

function getKeyPrefix(key: string): string {
  return key.slice(0, 16);
}

async function validateApiKey(
  supabase: ReturnType<typeof import("@/lib/supabase-admin").getSupabaseAdminClient>,
  key: string,
) {
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

export async function GET(request: NextRequest) {
  // NOTE: /v1/models is intentionally unauthenticated — it only returns model metadata,
  // not user-specific data. Actual chat completions require a valid API key via POST.
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const supabase = getSupabaseAdminClient();

  // If an API key is provided, validate it (but don't require it for this endpoint)
  let keyInfo: { keyId: string; accountId: string } | null = null;
  if (apiKey) {
    keyInfo = await validateApiKey(supabase, apiKey);
  }

  // 2. Fetch models dynamically from model-config (backed by ezrouter /api/model/list)
  const ezModels = await getModels();
  const createdAt = 1700000000;

  const data = Object.values(ezModels).map((m) => ({
    id: m.id,
    object: "model",
    created: createdAt,
    owned_by: `clawlite/${m.providerId}`,
    context_window: m.contextWindow,
    input: m.inputPer1M,
    output: m.outputPer1M,
  }));

  return NextResponse.json({ object: "list", data }, {
    headers: { "Cache-Control": "max-age=300" },
  });
}
