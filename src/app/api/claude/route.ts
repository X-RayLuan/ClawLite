import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance, freezeBalance, chargeBalance } from "@/lib/balance";
import { getModelPricing, getModelIds } from "@/lib/model-config";

async function estimateCost(model: string, tokensIn: number, tokensOut: number): Promise<number> {
  // Uses getModelPricing which applies 20% discount (DISCOUNT=0.8 in model-config)
  const { inputPer1M, outputPer1M } = await getModelPricing(model);
  return (tokensIn / 1_000_000) * inputPer1M + (tokensOut / 1_000_000) * outputPer1M;
}

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
    console.error("[claude/proxy] failed to record usage:", err);
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  // 3. Check balance
  let balance;
  try {
    balance = await checkBalance(keyInfo.accountId);
  } catch (err: any) {
    if (err.message === "account_not_found") {
      return NextResponse.json({ error: "account_not_found" }, { status: 401 });
    }
    return NextResponse.json({ error: "balance_check_failed" }, { status: 500 });
  }

  // 4. Parse request body for model/tokens to estimate cost
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request_body" }, { status: 400 });
  }

  const model = body?.model || "gpt-5.4";
  const messages = body?.messages || [];
  const maxTokens = body?.max_tokens || 4096;

  // Reject unknown models before hitting ezrouter – gives a clear error instead of a cryptic upstream message
  const supportedModels = await getModelIds();
  if (!supportedModels.includes(model)) {
    return NextResponse.json(
      {
        error: "model_not_supported",
        message: `Model "${model}" is not supported. Supported models: ${supportedModels.join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Rough token estimation: ~4 chars per token for input
  const inputText = JSON.stringify(messages);
  const estimatedTokensIn = Math.ceil(inputText.length / 4);
  const estimatedTokensOut = maxTokens;
  const estimatedCost = await estimateCost(model, estimatedTokensIn, estimatedTokensOut);

  if (balance.availableBalanceUsd < estimatedCost) {
    return NextResponse.json(
      { error: "insufficient_balance", available: balance.availableBalanceUsd, required: estimatedCost, rechargeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://clawlite.ai'}/clawrouter/dashboard/add-credits` },
      { status: 402 },
    );
  }

  // 5. Freeze estimated cost
  let freezeTxId: string | undefined;
  try {
    const freezeTx = await freezeBalance(
      keyInfo.accountId,
      estimatedCost,
      undefined,
      `claude_proxy:${model}`,
    );
    freezeTxId = freezeTx.id;
  } catch (err: any) {
    if (err.message === "insufficient_balance") {
      return NextResponse.json(
        { error: "insufficient_balance", available: balance.availableBalanceUsd, required: estimatedCost, rechargeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://clawlite.ai'}/clawrouter/dashboard/add-credits` },
        { status: 402 },
      );
    }
    return NextResponse.json({ error: "freeze_failed" }, { status: 500 });
  }

  // 6. Forward to ezrouter (Anthropic Messages API)
  const ezrouterBaseUrl = (process.env.EZROUTER_BASE_URL || "https://openrouter.ezsite.ai").replace(/\/$/, "");
  const ezrouterToken = process.env.EZROUTER_AUTH_TOKEN;
  if (!ezrouterToken) {
    return NextResponse.json({ error: "ezrouter_not_configured" }, { status: 500 });
  }

  const requestId = crypto.randomUUID();
  let ezrouterStatus = 200;
  let ezrouterError: string | null = null;
  let actualTokensIn = estimatedTokensIn;
  let actualTokensOut = estimatedTokensOut;

  // Convert OpenAI body to Anthropic format
  const anthropicBody = {
    model,
    messages,
    max_tokens: maxTokens,
  };

  try {
    const ezrouterResponse = await fetch(`${ezrouterBaseUrl}/api/claude/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        Authorization: ezrouterToken,
        "X-Request-ID": requestId,
      },
      body: JSON.stringify(anthropicBody),
    });

    ezrouterStatus = ezrouterResponse.status;

    if (!ezrouterResponse.ok) {
      let errorBody: any;
      try {
        errorBody = await ezrouterResponse.json();
      } catch {
        errorBody = await ezrouterResponse.text();
      }
      ezrouterError = errorBody?.error || errorBody?.message || `ezrouter_error:${ezrouterResponse.status}`;

      console.error(
        JSON.stringify({
          type: "ezrouter_error",
          requestId,
          model,
          ezrouterStatus: ezrouterResponse.status,
          ezrouterUrl: `${ezrouterBaseUrl}/api/claude/v1/messages`,
          errorBody,
          errorMessage: ezrouterError,
          timestamp: new Date().toISOString(),
        })
      );
    }

    // Stream response – convert Anthropic SSE to OpenAI SSE
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = ezrouterResponse.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }
          let buffer = "";
          let idx = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += new TextDecoder().decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                continue;
              }
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (!data || data === "{}") continue;

              try {
                const parsed = JSON.parse(data);

                // Extract token usage from message_stop event
                if (parsed.type === "message_stop") {
                  if (parsed.message?.usage?.input_tokens) actualTokensIn = parsed.message.usage.input_tokens;
                  if (parsed.message?.usage?.output_tokens) actualTokensOut = parsed.message.usage.output_tokens;
                  controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                  continue;
                }

                // Convert Anthropic content_block_delta to OpenAI delta
                if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                  const text = parsed.delta.text;
                  if (text) {
                    const openaiChunk = `data: ${JSON.stringify({ choices: [{ index: idx, delta: { content: text } }] })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(openaiChunk));
                  }
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        } catch (streamErr) {
          console.error("[claude/proxy] stream error:", streamErr);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: ezrouterStatus,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        "X-Request-ID": requestId,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    ezrouterError = err?.message || "ezrouter_fetch_failed";
    ezrouterStatus = 502;

    console.error(
      JSON.stringify({
        type: "ezrouter_fetch_failed",
        requestId,
        model,
        ezrouterUrl: `${ezrouterBaseUrl}/api/claude/v1/messages`,
        error: ezrouterError,
        timestamp: new Date().toISOString(),
      })
    );

    return NextResponse.json(
      { error: ezrouterError },
      {
        status: 502,
        headers: {
          "X-Request-ID": requestId,
        },
      },
    );
  } finally {
    // 7. Settle balance and record usage synchronously
    // (finally runs after stream finishes, so actualTokensIn/Out are final)
    const finalCost = await estimateCost(model, actualTokensIn, actualTokensOut);

    try {
      // Charge the actual (or estimated) cost — awaited synchronously
      await chargeBalance(keyInfo.accountId, finalCost, freezeTxId, `claude_proxy:${model}`);

      // Release any remaining frozen amount (between estimated and actual)
      const frozenRemaining = estimatedCost - finalCost;
      if (frozenRemaining > 0.01) {
        // Only release if > 1 cent difference
        try {
          const { refundBalance } = await import("@/lib/balance");
          await refundBalance(keyInfo.accountId, frozenRemaining, freezeTxId, `claude_proxy_refund:${model}`);
        } catch {
          // ignore refund errors
        }
      }
    } catch (err) {
      console.error("[claude/proxy] chargeBalance failed:", err);
      // Error is logged but does not block the response
    }

    await recordUsageAsync({
      supabase,
      accountId: keyInfo.accountId,
      apiKeyId: keyInfo.keyId,
      model,
      tokensIn: actualTokensIn,
      tokensOut: actualTokensOut,
      costEstimate: finalCost,
      status: ezrouterError ? "error" : "success",
      requestId,
    });
  }
}
