import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance, freezeBalance, chargeBalance } from "@/lib/balance";

// Model pricing (Claude 3.5 Sonnet) – USD per 1M tokens
const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  "claude-3-5-sonnet-20241022": { inputPer1M: 3, outputPer1M: 15 },
  "claude-3-5-sonnet-20250320": { inputPer1M: 3, outputPer1M: 15 },
  "claude-3-5-haiku-20241022": { inputPer1M: 0.8, outputPer1M: 4 },
};

// Default pricing for unknown models
const DEFAULT_PRICING = { inputPer1M: 3, outputPer1M: 15 };

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

  const model = body?.model || "claude-3-5-sonnet-20241022";
  const messages = body?.messages || [];
  const maxTokens = body?.max_tokens || 4096;

  // Rough token estimation: ~4 chars per token for input
  const inputText = JSON.stringify(messages);
  const estimatedTokensIn = Math.ceil(inputText.length / 4);
  const estimatedTokensOut = maxTokens;
  const estimatedCost = estimateCost(model, estimatedTokensIn, estimatedTokensOut);

  if (balance.availableBalanceUsd < estimatedCost) {
    return NextResponse.json(
      { error: "insufficient_balance", available: balance.availableBalanceUsd, required: estimatedCost },
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
        { error: "insufficient_balance", available: balance.availableBalanceUsd, required: estimatedCost },
        { status: 402 },
      );
    }
    return NextResponse.json({ error: "freeze_failed" }, { status: 500 });
  }

  // 6. Forward to ezrouter
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
  let streamed = false;

  try {
    const ezrouterResponse = await fetch(`${ezrouterBaseUrl}/api/claude`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ezrouterToken}`,
        "X-Request-ID": requestId,
      },
      body: JSON.stringify(body),
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
    }

    // Stream response to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = ezrouterResponse.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
            streamed = true;

            // Try to parse SSE to extract token usage
            // Each chunk is a text line like "data: {...}"
            const text = new TextDecoder().decode(value, { stream: true });
            const lines = text.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  if (parsed.usage?.prompt_tokens) {
                    actualTokensIn = parsed.usage.prompt_tokens;
                  }
                  if (parsed.usage?.completion_tokens) {
                    actualTokensOut = parsed.usage.completion_tokens;
                  }
                } catch {
                  // ignore parse errors per chunk
                }
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
    // 7. Record usage (async, non-blocking) and settle balance
    const finalCost = estimateCost(model, actualTokensIn, actualTokensOut);

    // Fire-and-forget: record usage and settle frozen amount
    (async () => {
      try {
        // Charge the actual (or estimated) cost
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
    })();
  }
}
