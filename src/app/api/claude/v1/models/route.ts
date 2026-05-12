import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

// Model pricing – mirrors the list in ../route.ts
// Used as the fallback source of truth when ezrouter has no /v1/models endpoint.
const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  "gpt-5.4": { inputPer1M: 2.5, outputPer1M: 10 },
  "gpt-5.4-mini": { inputPer1M: 0.15, outputPer1M: 0.6 },
  "gpt-5.4-pro": { inputPer1M: 3.5, outputPer1M: 15 },
  "claude-sonnet-4-6": { inputPer1M: 3, outputPer1M: 15 },
  "claude-3-5-sonnet-20241022": { inputPer1M: 3, outputPer1M: 15 },
  "claude-3-5-sonnet-20250320": { inputPer1M: 3, outputPer1M: 15 },
  "claude-haiku-4-5": { inputPer1M: 0.8, outputPer1M: 4 },
  "claude-3-5-haiku-20241022": { inputPer1M: 0.8, outputPer1M: 4 },
  "claude-opus-4-7": { inputPer1M: 15, outputPer1M: 75 },
  "claude-sonnet-4-5": { inputPer1M: 3, outputPer1M: 15 },
};

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
  const supabase = getSupabaseAdminClient();

  // 1. Parse and validate API Key
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }
  const apiKey = authHeader.slice(7);
  if (!apiKey) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }

  const keyInfo = await validateApiKey(supabase, apiKey);
  if (!keyInfo) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
  }

  // 2. Try to fetch models from ezrouter using the server-side EZROUTER_AUTH_TOKEN
  const ezrouterBaseUrl = (process.env.EZROUTER_BASE_URL || "https://openrouter.ezsite.ai").replace(/\/$/, "");
  const ezrouterToken = process.env.EZROUTER_AUTH_TOKEN;

  if (ezrouterToken) {
    try {
      const ezrouterRes = await fetch(`${ezrouterBaseUrl}/api/openai/v1/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ezrouterToken}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (ezrouterRes.ok) {
        const ezrouterData = await ezrouterRes.json();
        // Transform ezrouter response to OpenAI-compatible format if needed
        if (ezrouterData?.data && Array.isArray(ezrouterData.data)) {
          return NextResponse.json(
            {
              object: "list",
              data: ezrouterData.data.map((model: any) => ({
                id: model.id,
                object: "model",
                created: model.created ?? 1700000000,
                owned_by: model.owned_by ?? "clawlite",
              })),
            },
            {
              headers: {
                "Cache-Control": "max-age=300", // cache 5 minutes
              },
            },
          );
        }
      }
    } catch (err) {
      // ezrouter unavailable or timeout — fall through to hardcoded list
      console.warn("[claude/v1/models] ezrouter fetch failed, using hardcoded list:", err);
    }
  }

  // 3. Fallback: build model list from MODEL_PRICING
  const createdAt = 1700000000; // 2023-11-14 – matching OpenAI's convention
  const models = Object.keys(MODEL_PRICING).map((id) => ({
    id,
    object: "model",
    created: createdAt,
    owned_by: "clawlite",
  }));

  return NextResponse.json(
    {
      object: "list",
      data: models,
    },
    {
      headers: {
        "Cache-Control": "max-age=300",
      },
    },
  );
}
