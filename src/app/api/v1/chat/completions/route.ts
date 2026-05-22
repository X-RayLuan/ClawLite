import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance, freezeBalance, chargeBalance } from "@/lib/balance";
import { getModelPricing } from "@/lib/model-pricing";

const EZROUTER_BASE_URL = (process.env.EZROUTER_BASE_URL || "https://openrouter.ezsite.ai").replace(/\/$/, "");
const EZROUTER_TOKEN = process.env.EZROUTER_AUTH_TOKEN || "";
const MINIMAX_BASE_URL = "https://api.minimax.chat/v1";
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || "";

// ─── Cost estimation ─────────────────────────────────────────────────────────

async function estimateCost(model: string, tokensIn: number, tokensOut: number): Promise<number> {
  const { inputPer1M, outputPer1M } = await getModelPricing(model);
  return (tokensIn / 1_000_000) * inputPer1M + (tokensOut / 1_000_000) * outputPer1M;
}

// ─── API Key validation ───────────────────────────────────────────────────────

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
  if (error || !data || data.length === 0) return null;
  if (data[0].secret_hash !== hash) return null;
  return { keyId: data[0].id, accountId: data[0].account_id };
}

// ─── Usage recording ──────────────────────────────────────────────────────────

async function recordUsage(params: {
  supabase: ReturnType<typeof import("@/lib/supabase-admin").getSupabaseAdminClient>;
  accountId: string;
  apiKeyId: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costEstimate: number;
  status: string;
  requestId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: insertError } = await params.supabase.from("usage_events").insert({
      account_id: params.accountId,
      api_key_id: params.apiKeyId,
      model: params.model,
      tokens_in: params.tokensIn,
      tokens_out: params.tokensOut,
      cost_estimate: params.costEstimate,
      status: params.status,
      request_id: params.requestId,
    });
    if (insertError) return { success: false, error: insertError.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── SSE token parser ─────────────────────────────────────────────────────────

function parseSseUsage(sseBuffer: string): { tokensIn: number; tokensOut: number } {
  let tokensIn = 0;
  let tokensOut = 0;
  const lines = sseBuffer.split(/\n\n/);
  for (const raw of lines) {
    const line = raw.trimStart();
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6).trim();
    if (payload === "[DONE]") continue;
    try {
      const parsed = JSON.parse(payload);
      const usage = parsed.usage ?? parsed;
      if (usage?.prompt_tokens > 0) tokensIn = usage.prompt_tokens;
      if (usage?.completion_tokens > 0) tokensOut = usage.completion_tokens;
      if (usage?.input_tokens > 0) tokensIn = usage.input_tokens;
      if (usage?.output_tokens > 0) tokensOut = usage.output_tokens;
    } catch { /* ignore */ }
  }
  return { tokensIn, tokensOut };
}

// ─── Route handler ───────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient();

  // 1. Parse API Key
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }
  const apiKey = authHeader.slice(7);
  if (!apiKey) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }

  // 2. Validate API Key
  const keyInfo = await validateApiKey(supabase, apiKey);
  if (!keyInfo) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
  }

  // 3. Parse body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const rawModel = body?.model;
  if (!rawModel || typeof rawModel !== "string") {
    return NextResponse.json({ error: "model_required" }, { status: 400 });
  }

  // 4. Parse provider from model prefix
  let provider: string;
  let upstreamModel: string;

  if (rawModel.startsWith("openai/")) {
    provider = "openai";
    upstreamModel = rawModel.slice("openai/".length);
  } else if (rawModel.startsWith("anthropic/")) {
    provider = "anthropic";
    upstreamModel = rawModel.slice("anthropic/".length);
  } else if (rawModel.startsWith("minimax/")) {
    provider = "minimax";
    upstreamModel = rawModel.slice("minimax/".length);
  } else {
    return NextResponse.json(
      { error: "invalid_model_format", message: "model must start with openai/, anthropic/, or minimax/" },
      { status: 400 },
    );
  }

  // 5. Determine routing
  let upstreamUrl: string;
  let upstreamHeaders: Record<string, string>;
  let upstreamBody: any;

  if (provider === "openai") {
    upstreamUrl = `${EZROUTER_BASE_URL}/api/openai/v1/chat/completions`;
    upstreamHeaders = {
      "Content-Type": "application/json",
      Authorization: EZROUTER_TOKEN,
    };
    upstreamBody = { ...body, model: upstreamModel };
    delete (upstreamBody as any).model;
    upstreamBody.model = upstreamModel;
  } else if (provider === "anthropic") {
    upstreamUrl = `${EZROUTER_BASE_URL}/api/claude/v1/messages`;
    upstreamHeaders = {
      "Content-Type": "application/json",
      Authorization: EZROUTER_TOKEN,
      "anthropic-version": "2023-06-01",
    };
    // Anthropic uses max_tokens, not messages + model differently
    upstreamBody = {
      model: upstreamModel,
      messages: body.messages,
      max_tokens: body.max_tokens || 4096,
    };
  } else {
    // minimax — direct to MiniMax official API
    if (!MINIMAX_API_KEY) {
      return NextResponse.json({ error: "minimax_not_configured" }, { status: 500 });
    }
    upstreamUrl = `${MINIMAX_BASE_URL}/chat/completions`;
    upstreamHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    };
    upstreamBody = { ...body, model: upstreamModel };
  }

  // 6. Check balance
  const maxTokens = body?.max_tokens || 4096;
  const inputText = JSON.stringify(body?.messages || []);
  const estimatedTokensIn = Math.ceil(inputText.length / 4);
  const estimatedTokensOut = maxTokens;
  const estimatedCost = await estimateCost(upstreamModel, estimatedTokensIn, estimatedTokensOut);

  let balance;
  try {
    balance = await checkBalance(keyInfo.accountId);
  } catch {
    return NextResponse.json({ error: "balance_check_failed" }, { status: 500 });
  }

  if (balance.availableBalanceUsd < estimatedCost) {
    return NextResponse.json(
      {
        error: "insufficient_balance",
        available: balance.availableBalanceUsd,
        required: estimatedCost,
        rechargeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://clawlite.ai"}/clawrouter/dashboard/add-credits`,
      },
      { status: 402 },
    );
  }

  // 7. Freeze balance
  let freezeTxId: string | undefined;
  try {
    const freezeTx = await freezeBalance(
      keyInfo.accountId,
      estimatedCost,
      undefined,
      `v1_chat:${provider}:${upstreamModel}`,
    );
    freezeTxId = freezeTx.id;
  } catch {
    return NextResponse.json({ error: "balance_freeze_failed" }, { status: 500 });
  }

  const requestId = crypto.randomUUID();
  let actualTokensIn = estimatedTokensIn;
  let actualTokensOut = estimatedTokensOut;
  let sseBuffer = "";

  let upstreamStatus = 200;
  let upstreamError: string | null = null;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify(upstreamBody),
    });

    upstreamStatus = upstreamResponse.status;

    if (!upstreamResponse.ok) {
      let errorBody: any;
      try { errorBody = await upstreamResponse.json(); } catch { errorBody = await upstreamResponse.text(); }
      upstreamError = errorBody?.error?.message || errorBody?.error || `upstream_error:${upstreamResponse.status}`;
    }

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = upstreamResponse.body?.getReader();
          if (!reader) { controller.close(); return; }
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
            const text = new TextDecoder().decode(value, { stream: true });
            sseBuffer += text.replace(/\r\n/g, "\n");
            const usage = parseSseUsage(sseBuffer);
            if (usage.tokensIn > 0) actualTokensIn = usage.tokensIn;
            if (usage.tokensOut > 0) actualTokensOut = usage.tokensOut;
          }
          // Flush remaining buffer
          const { tokensIn, tokensOut } = parseSseUsage(sseBuffer);
          if (tokensIn > 0) actualTokensIn = tokensIn;
          if (tokensOut > 0) actualTokensOut = tokensOut;
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      status: upstreamStatus,
      headers: {
        "Content-Type": upstreamResponse.headers.get("Content-Type") || "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Request-ID": requestId,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    upstreamError = err?.message || "upstream_fetch_failed";
    upstreamStatus = 502;
    return NextResponse.json({ error: upstreamError }, { status: 502, headers: { "X-Request-ID": requestId } });
  } finally {
    if (!upstreamError) {
      const finalCost = await estimateCost(upstreamModel, actualTokensIn, actualTokensOut);
      try {
        await chargeBalance(keyInfo.accountId, finalCost, freezeTxId, `v1_chat:${provider}:${upstreamModel}`);
      } catch (err) {
        console.error("[v1/chat/completions] chargeBalance failed:", err);
      }
    }
    await recordUsage({
      supabase,
      accountId: keyInfo.accountId,
      apiKeyId: keyInfo.keyId,
      model: upstreamModel,
      tokensIn: actualTokensIn,
      tokensOut: actualTokensOut,
      costEstimate: await estimateCost(upstreamModel, actualTokensIn, actualTokensOut),
      status: upstreamError ? "error" : "success",
      requestId,
    });
  }
}
