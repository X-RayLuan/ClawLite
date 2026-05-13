import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance, freezeBalance, chargeBalance } from "@/lib/balance";

// Model pricing – USD per 1M tokens
const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  "gpt-5.4": { inputPer1M: 2.5, outputPer1M: 10 },
  "gpt-5.4-mini": { inputPer1M: 0.15, outputPer1M: 0.6 },
  "gpt-5.4-pro": { inputPer1M: 3.5, outputPer1M: 15 },
  "claude-3-5-sonnet-20241022": { inputPer1M: 3, outputPer1M: 15 },
  "claude-3-5-haiku-20241022": { inputPer1M: 0.8, outputPer1M: 4 },
  "claude-sonnet-4-20250514": { inputPer1M: 3, outputPer1M: 15 },
  "claude-sonnet-4-6": { inputPer1M: 3, outputPer1M: 15 },
  "claude-sonnet-4-5": { inputPer1M: 3, outputPer1M: 15 },
  "claude-opus-4-7": { inputPer1M: 15, outputPer1M: 75 },
  "claude-opus-4-6": { inputPer1M: 15, outputPer1M: 75 },
  "claude-opus-4-5": { inputPer1M: 15, outputPer1M: 75 },
  "claude-haiku-4-5": { inputPer1M: 0.8, outputPer1M: 4 },
};

const DEFAULT_PRICING = { inputPer1M: 2.5, outputPer1M: 10 };

function getModelPricing(model: string) {
  return MODEL_PRICING[model] ?? DEFAULT_PRICING;
}

function estimateCost(model: string, tokensIn: number, tokensOut: number): number {
  const { inputPer1M, outputPer1M } = getModelPricing(model);
  return (tokensIn / 1_000_000) * inputPer1M + (tokensOut / 1_000_000) * outputPer1M;
}

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

  console.error(JSON.stringify({
    type: "key_validation_debug",
    keyPrefix: prefix,
    keyPrefixLen: prefix.length,
    keyHash: hash.slice(0, 16),
    timestamp: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, account_id, status, secret_hash")
    .eq("key_prefix", prefix)
    .eq("status", "active")
    .limit(1);

  console.error(JSON.stringify({
    type: "key_validation_result",
    keyPrefix: prefix,
    error: error?.message,
    foundRows: data?.length,
    timestamp: new Date().toISOString(),
  }));

  if (error || !data || data.length === 0) return null;

  const row = data[0];
  if (row.secret_hash !== hash) {
    console.error(JSON.stringify({
      type: "key_hash_mismatch",
      keyPrefix: prefix,
      storedHash: row.secret_hash?.slice(0, 16),
      providedHash: hash.slice(0, 16),
      timestamp: new Date().toISOString(),
    }));
    return null;
  }

  return { keyId: row.id, accountId: row.account_id };
}

async function recordUsageAsync(params: {
  supabase: ReturnType<typeof import("@/lib/supabase-admin").getSupabaseAdminClient>;
  accountId: string;
  apiKeyId: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costEstimate: number;
  status: string;
  requestId: string;
}) {
  try {
    await params.supabase.from("usage_events").insert({
      account_id: params.accountId,
      api_key_id: params.apiKeyId,
      model: params.model,
      tokens_in: params.tokensIn,
      tokens_out: params.tokensOut,
      cost_estimate: params.costEstimate,
      status: params.status,
      request_id: params.requestId,
    });
  } catch (err) {
    console.error("[claude/v1/messages] failed to record usage:", err);
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Log ALL incoming headers (names only, no values for security)
  const allHeaderNames = Array.from(request.headers.keys()).join(", ");
  console.error(JSON.stringify({
    type: "incoming_request",
    url: request.url,
    headerNames: allHeaderNames,
    timestamp: new Date().toISOString(),
  }));

  const authHeader = request.headers.get("authorization");
  const anthropicVersion = request.headers.get("anthropic-version");
  const contentType = request.headers.get("content-type");
  const xApiKey = request.headers.get("x-api-key");
  console.error(JSON.stringify({
    type: "header_debug",
    authHeaderPresent: !!authHeader,
    anthropicVersion,
    contentType,
    xApiKeyPresent: !!xApiKey,
    timestamp: new Date().toISOString(),
  }));

  const supabase = getSupabaseAdminClient();

  // 1. Parse API Key - support both Authorization: Bearer and x-api-key header
  let apiKey: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    apiKey = authHeader.slice(7);
  } else if (request.headers.get("x-api-key")) {
    apiKey = request.headers.get("x-api-key");
  }
  if (!apiKey) {
    return NextResponse.json({ type: "error", error: { type: "authentication_error", message: "missing_api_key" } }, { status: 401 });
  }

  // 2. Validate API Key
  const keyInfo = await validateApiKey(supabase, apiKey);
  if (!keyInfo) {
    return NextResponse.json({ type: "error", error: { type: "authentication_error", message: "invalid_api_key" } }, { status: 401 });
  }

  // 3. Check balance
  let balance;
  try {
    balance = await checkBalance(keyInfo.accountId);
  } catch (err: any) {
    if (err.message === "account_not_found") {
      return NextResponse.json({ type: "error", error: { type: "authentication_error", message: "account_not_found" } }, { status: 401 });
    }
    return NextResponse.json({ type: "error", error: { type: "internal_error", message: "balance_check_failed" } }, { status: 500 });
  }

  // 4. Parse Anthropic-format request body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ type: "error", error: { type: "invalid_request_error", message: "invalid_request_body" } }, { status: 400 });
  }

  const model = body?.model || "claude-3-5-sonnet-20241022";
  const anthropicMessages: Array<{ role: string; content: string }> = body?.messages || [];
  const maxTokens = body?.max_tokens || 4096;
  const stream = body?.stream ?? false;

  // Reject unknown models
  if (!(model in MODEL_PRICING)) {
    return NextResponse.json(
      {
        type: "error",
        error: {
          type: "invalid_request_error",
          message: `Model "${model}" is not supported. Supported models: ${Object.keys(MODEL_PRICING).join(", ")}`,
        },
      },
      { status: 400 },
    );
  }

  // Convert Anthropic messages to OpenAI format for ezrouter
  // Anthropic: {role: "user"|"assistant", content: string | Array<{type: string, text: string}>}
  const messages = anthropicMessages.map((m) => {
    const content = typeof m.content === "string" ? m.content : (Array.isArray(m.content) ? (m.content[0] as any)?.text || "" : "");
    return { role: m.role, content };
  });

  // Rough token estimation
  const inputText = JSON.stringify(messages);
  const estimatedTokensIn = Math.ceil(inputText.length / 4);
  const estimatedTokensOut = maxTokens;
  const estimatedCost = estimateCost(model, estimatedTokensIn, estimatedTokensOut);

  if (balance.availableBalanceUsd < estimatedCost) {
    return NextResponse.json(
      {
        type: "error",
        error: {
          type: "invalid_request_error",
          message: "insufficient_balance",
        },
      },
      { status: 402 },
    );
  }

  // Freeze estimated cost
  let freezeTxId: string | undefined;
  try {
    const freezeTx = await freezeBalance(keyInfo.accountId, estimatedCost, undefined, `claude_v1:${model}`);
    freezeTxId = freezeTx.id;
  } catch (err: any) {
    if (err.message === "insufficient_balance") {
      return NextResponse.json(
        {
          type: "error",
          error: {
            type: "invalid_request_error",
            message: "insufficient_balance",
          },
        },
        { status: 402 },
      );
    }
    return NextResponse.json({ type: "error", error: { type: "internal_error", message: "freeze_failed" } }, { status: 500 });
  }

  // Forward to ezrouter (always streaming, ezrouter uses SSE)
  const ezrouterBaseUrl = (process.env.EZROUTER_BASE_URL || "https://openrouter.ezsite.ai").replace(/\/$/, "");
  const ezrouterToken = process.env.EZROUTER_AUTH_TOKEN;
  if (!ezrouterToken) {
    return NextResponse.json({ type: "error", error: { type: "internal_error", message: "ezrouter_not_configured" } }, { status: 500 });
  }

  const requestId = crypto.randomUUID();
  let actualTokensIn = estimatedTokensIn;
  let actualTokensOut = estimatedTokensOut;

  try {
    const ezrouterRes = await fetch(`${ezrouterBaseUrl}/api/claude/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        Authorization: ezrouterToken,
        "X-Request-ID": requestId,
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, stream: true }),
    });

    if (!ezrouterRes.ok) {
      let errorBody: any;
      try {
        errorBody = await ezrouterRes.json();
      } catch {
        errorBody = await ezrouterRes.text();
      }
      const errorMessage = errorBody?.error || errorBody?.message || `ezrouter_error:${ezrouterRes.status}`;
      console.error(
        JSON.stringify({
          type: "ezrouter_error",
          requestId,
          model,
          ezrouterStatus: ezrouterRes.status,
          errorBody,
          timestamp: new Date().toISOString(),
        }),
      );
      return NextResponse.json(
        { type: "error", error: { type: "invalid_request_error", message: errorMessage } },
        { status: ezrouterRes.status },
      );
    }

    // Log success before returning stream
    console.error(JSON.stringify({
      type: "ezrouter_success",
      requestId,
      model,
      ezrouterStatus: ezrouterRes.status,
      contentType: ezrouterRes.headers.get("content-type"),
      timestamp: new Date().toISOString(),
    }));

    // Pass through Anthropic SSE directly
    return new Response(ezrouterRes.body, {
      status: ezrouterRes.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        "X-Request-ID": requestId,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    console.error(
      JSON.stringify({
        type: "ezrouter_fetch_failed",
        requestId,
        model,
        error: err?.message,
        timestamp: new Date().toISOString(),
      }),
    );
    return NextResponse.json(
      { type: "error", error: { type: "internal_error", message: err?.message || "ezrouter_fetch_failed" } },
      { status: 502 },
    );
  } finally {
    // Fire-and-forget billing after stream returns to client
    const finalCost = estimateCost(model, actualTokensIn, actualTokensOut);
    chargeBalance(keyInfo.accountId, finalCost, freezeTxId, `claude_v1:${model}`)
      .catch((err) => console.error("[claude/v1/messages] chargeBalance failed:", err));

    const frozenRemaining = estimatedCost - finalCost;
    if (frozenRemaining > 0.01) {
      import("@/lib/balance").then(({ refundBalance }) => {
        refundBalance(keyInfo.accountId, frozenRemaining, freezeTxId, `claude_v1_refund:${model}`)
          .catch(() => {});
      });
    }

    recordUsageAsync({
      supabase,
      accountId: keyInfo.accountId,
      apiKeyId: keyInfo.keyId,
      model,
      tokensIn: actualTokensIn,
      tokensOut: actualTokensOut,
      costEstimate: finalCost,
      status: "success",
      requestId,
    }).catch((err) => console.error("[claude/v1/messages] recordUsage failed:", err));
  }
}
