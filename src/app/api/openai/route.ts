import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance, freezeBalance, chargeBalance } from "@/lib/balance";

// Model pricing – USD per 1M tokens
const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  "gpt-5.4": { inputPer1M: 3, outputPer1M: 15 },
  "gpt-5.4-mini": { inputPer1M: 0.6, outputPer1M: 2.4 },
  "gpt-5.4-pro": { inputPer1M: 5, outputPer1M: 20 },
  "gpt-4o": { inputPer1M: 2.5, outputPer1M: 10 },
  "gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.6 },
};

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
    if (insertError) {
      console.error("[openai/proxy] usage insert error:", insertError);
      return { success: false, error: insertError.message };
    }
    console.log(`[openai/proxy] usage recorded: tokens_in=${params.tokensIn} tokens_out=${params.tokensOut} cost=${params.costEstimate}`);
    return { success: true };
  } catch (err) {
    console.error("[openai/proxy] failed to record usage:", err);
    return { success: false, error: String(err) };
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
  } catch (err) {
    console.error("[openai/proxy] balance check failed:", err);
    return NextResponse.json({ error: "balance_check_failed" }, { status: 500 });
  }

  // 4. Parse body, inject default model
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  // Default model: gpt-5.4
  if (!body?.model) {
    body = { ...body, model: "gpt-5.4" };
  }

  const model = body?.model || "gpt-5.4";
  const messages = body?.messages || [];
  const maxTokens = body?.max_tokens || 4096;

  // Rough token estimation
  const inputText = JSON.stringify(messages);
  const estimatedTokensIn = Math.ceil(inputText.length / 4);
  const estimatedTokensOut = maxTokens;
  const estimatedCost = estimateCost(model, estimatedTokensIn, estimatedTokensOut);

  if (balance.availableBalanceUsd < estimatedCost) {
    return NextResponse.json(
      { error: "insufficient_balance", available: balance.availableBalanceUsd, required: estimatedCost },
      { status: 402 }
    );
  }

  // 5. Freeze balance
  let freezeTxId: string | undefined;
  try {
    const freezeTx = await freezeBalance(
      keyInfo.accountId,
      estimatedCost,
      undefined,
      `openai_proxy:${model}`,
    );
    freezeTxId = freezeTx.id;
  } catch (err) {
    console.error("[openai/proxy] freeze failed:", err);
    return NextResponse.json({ error: "balance_freeze_failed" }, { status: 500 });
  }

  // 6. Proxy to Ezrouter
  const ezrouterBaseUrl = (process.env.EZROUTER_BASE_URL || "https://openrouter.ezsite.ai").replace(/\/$/, "");
  const ezrouterToken = process.env.EZROUTER_AUTH_TOKEN;
  if (!ezrouterToken) {
    return NextResponse.json({ error: "ezrouter_not_configured" }, { status: 500 });
  }

  const requestId = crypto.randomUUID();
  let actualTokensIn = estimatedTokensIn;
  let actualTokensOut = estimatedTokensOut;
  let sseBuffer = "";

  try {
    const ezrouterResponse = await fetch(`${ezrouterBaseUrl}/api/openai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: ezrouterToken,
        "X-Request-ID": requestId,
      },
      body: JSON.stringify(body),
    });

    // Stream response to client
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

            // Try to parse SSE for token usage
            // SSE messages are delimited by blank lines (\n\n).
            // Because chunks can arrive mid-line, we accumulate until \n\n.
            const text = new TextDecoder().decode(value, { stream: true });
            // Normalise \r\n → \n and track double-newline boundaries
            const normalised = text.replace(/\r\n/g, "\n");
            sseBuffer += normalised;

            // Split on SSE message delimiter (blank line = \n\n or trailing \n\n)
            const messages = sseBuffer.split(/\n\n/);
            // Keep the last "tail" as the new buffer (it may be incomplete)
            sseBuffer = messages.pop() ?? "";

            for (const raw of messages) {
              const line = raw.trimStart();
              if (!line.startsWith("data: ")) continue;
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload);
                // OpenAI compatible usage fields (may be top-level or inside choices)
                const usage = parsed.usage ?? parsed;
                if (usage?.prompt_tokens > 0) {
                  actualTokensIn = usage.prompt_tokens;
                }
                if (usage?.completion_tokens > 0) {
                  actualTokensOut = usage.completion_tokens;
                }
                // Also handle input_tokens/output_tokens (some providers use these)
                if (usage?.input_tokens > 0) {
                  actualTokensIn = usage.input_tokens;
                }
                if (usage?.output_tokens > 0) {
                  actualTokensOut = usage.output_tokens;
                }
              } catch {
                // ignore parse errors for malformed SSE data
              }
            }
          }

          // Flush any remaining SSE data in buffer (handles final chunk without trailing \n\n)
          if (sseBuffer.trim()) {
            const line = sseBuffer.trimStart();
            if (line.startsWith("data: ")) {
              const payload = line.slice(6).trim();
              if (payload !== "[DONE]") {
                try {
                  const parsed = JSON.parse(payload);
                  const usage = parsed.usage ?? parsed;
                  if (usage?.prompt_tokens > 0) actualTokensIn = usage.prompt_tokens;
                  if (usage?.completion_tokens > 0) actualTokensOut = usage.completion_tokens;
                  if (usage?.input_tokens > 0) actualTokensIn = usage.input_tokens;
                  if (usage?.output_tokens > 0) actualTokensOut = usage.output_tokens;
                } catch { /* ignore */ }
              }
            }
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    // Record actual usage after completion (must await so failures are not silent)
    const finalCost = estimateCost(model, actualTokensIn, actualTokensOut);
    const usageResult = await recordUsage({
      supabase,
      accountId: keyInfo.accountId,
      apiKeyId: keyInfo.keyId,
      model,
      tokensIn: actualTokensIn,
      tokensOut: actualTokensOut,
      costEstimate: finalCost,
      status: ezrouterResponse.ok ? "success" : "error",
      requestId,
    });
    if (!usageResult.success) {
      console.error("[openai/proxy] usage recording failed:", usageResult.error);
    }

    // Charge actual cost (only if > 0 to avoid balance.ts guard throwing on 0)
    if (ezrouterResponse.ok && finalCost > 0) {
      await chargeBalance(keyInfo.accountId, finalCost, freezeTxId ?? undefined, `openai_proxy:${model}`);
    } else if (!ezrouterResponse.ok) {
      // Refund: no charge needed, balance freeze just expires
    }

    return new Response(stream, {
      status: ezrouterResponse.status,
      headers: {
        "Content-Type": ezrouterResponse.headers.get("Content-Type") || "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Request-ID": requestId,
      },
    });
  } catch (err: any) {
    console.error("[openai/proxy] ezrouter fetch failed:", err);
    await recordUsage({
      supabase,
      accountId: keyInfo.accountId,
      apiKeyId: keyInfo.keyId,
      model,
      tokensIn: estimatedTokensIn,
      tokensOut: estimatedTokensOut,
      costEstimate: 0,
      status: "error",
      requestId,
    });
    return NextResponse.json({ error: err?.message || "proxy_failed" }, { status: 502 });
  }
}
