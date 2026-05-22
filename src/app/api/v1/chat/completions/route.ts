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
  let upstreamStatus = 200;
  let upstreamError: string | null = null;

  try {
    // Log full ezrouter request (body may be large — redact auth header value)
    const logHeaders = { ...upstreamHeaders, Authorization: '***' }
    console.log("[v1/chat/completions] ezrouter request →", JSON.stringify({ url: upstreamUrl, headers: logHeaders, body: upstreamBody }, null, 2));

    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify(upstreamBody),
    });

    upstreamStatus = upstreamResponse.status;

    if (!upstreamResponse.ok) {
      let errorBody: any;
      try { errorBody = await upstreamResponse.json(); } catch { errorBody = await upstreamResponse.text(); }
      console.error("[v1/chat/completions] ezrouter error:", JSON.stringify({ status: upstreamStatus, error: errorBody }, null, 2));
      upstreamError = errorBody?.error?.message || errorBody?.error || `upstream_error:${upstreamResponse.status}`;
    } else {
      console.log("[v1/chat/completions] ezrouter response ← status:", upstreamStatus);
    }

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = upstreamResponse.body?.getReader();
          if (!reader) {
            console.error("[v1/chat/completions] upstreamResponse.body is null — no reader");
            controller.close();
            return;
          }
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = new TextDecoder().decode(value, { stream: true });
            buffer += text.replace(/\r\n/g, "\n");
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              // Anthropic SSE: "event: <type>" + "data: <json>"
              if (line.startsWith("event: ")) continue;
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (!data || data === "{}") continue;

              try {
                const parsed = JSON.parse(data);

                // message_stop — extract usage and send [DONE]
                if (parsed.type === "message_stop") {
                  if (parsed.message?.usage?.input_tokens) actualTokensIn = parsed.message.usage.input_tokens;
                  if (parsed.message?.usage?.output_tokens) actualTokensOut = parsed.message.usage.output_tokens;
                  controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                  continue;
                }

                // content_block_delta — convert Anthropic text to OpenAI delta format
                if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                  const txt = parsed.delta.text;
                  if (txt) {
                    const openaiChunk = `data: ${JSON.stringify({ choices: [{ index: 0, delta: { content: txt } }] })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(openaiChunk));
                  }
                }
              } catch {
                // ignore parse errors per line
              }
            }
          }

          // Flush remaining buffer
          if (buffer.trim()) {
            const line = buffer.trim();
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data && data !== "{}") {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === "message_stop") {
                    if (parsed.message?.usage?.input_tokens) actualTokensIn = parsed.message.usage.input_tokens;
                    if (parsed.message?.usage?.output_tokens) actualTokensOut = parsed.message.usage.output_tokens;
                    controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                  }
                } catch { /* ignore */ }
              }
            }
          }
          controller.close();
        } catch (err) {
          console.error("[v1/chat/completions] stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      status: upstreamStatus,
      headers: {
        "Content-Type": "text/event-stream",
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
