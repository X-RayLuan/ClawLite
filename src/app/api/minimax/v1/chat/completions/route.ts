import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance, freezeBalance, chargeBalance } from "@/lib/balance";
import { getModelPricing } from "@/lib/model-pricing";

const DEFAULT_PRICING = { inputPer1M: 0.1, outputPer1M: 0.5 }; // MiniMax default pricing (to be confirmed)

const MINIMAX_BASE_URL = "https://api.minimax.chat/v1";
const MINIMAX_MODEL = "MiniMax-Text-01";

async function estimateCost(model: string, tokensIn: number, tokensOut: number): Promise<number> {
  const { inputPer1M, outputPer1M } = await getModelPricing(model);
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

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, account_id, status, secret_hash")
    .eq("key_prefix", prefix)
    .eq("status", "active")
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0];
  if (row.secret_hash !== hash) return null;

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
      console.error("[minimax/v1/chat/completions] usage insert error:", insertError);
      return { success: false, error: insertError.message };
    }
    return { success: true };
  } catch (err) {
    console.error("[minimax/v1/chat/completions] failed to record usage:", err);
    return { success: false, error: String(err) };
  }
}

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

  // 3. Get MiniMax API key from env
  const minimaxApiKey = process.env.MINIMAX_API_KEY;
  if (!minimaxApiKey) {
    console.error("[minimax/v1/chat/completions] MINIMAX_API_KEY not configured");
    return NextResponse.json({ error: "minimax_not_configured" }, { status: 500 });
  }

  // 4. Check balance
  let balance;
  try {
    balance = await checkBalance(keyInfo.accountId);
  } catch (err) {
    console.error("[minimax/v1/chat/completions] balance check failed:", err);
    return NextResponse.json({ error: "balance_check_failed" }, { status: 500 });
  }

  // 5. Parse body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const model = body?.model || MINIMAX_MODEL;
  const maxTokens = body?.max_tokens || 4096;

  // Support both messages and prompt formats
  let messages: any[] = [];
  let inputText = "";

  if (body?.messages && body?.messages.length > 0) {
    messages = body.messages;
    inputText = JSON.stringify(messages);
  } else if (body?.prompt !== undefined) {
    const promptText = typeof body.prompt === "string" ? body.prompt : Array.isArray(body.prompt) ? body.prompt.join("\n") : String(body.prompt);
    messages = [{ role: "user", content: promptText }];
    inputText = promptText;
    body = { ...body, messages };
    delete (body as any).prompt;
  }

  // Set model
  body = { ...body, model };

  // Token estimation
  const estimatedTokensIn = Math.ceil(inputText.length / 4);
  const estimatedTokensOut = maxTokens;
  const estimatedCost = await estimateCost(model, estimatedTokensIn, estimatedTokensOut);

  if (balance.availableBalanceUsd < estimatedCost) {
    return NextResponse.json(
      {
        error: "insufficient_balance",
        available: balance.availableBalanceUsd,
        required: estimatedCost,
        rechargeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://clawlite.ai'}/clawrouter/dashboard/add-credits`,
      },
      { status: 402 },
    );
  }

  // 6. Freeze balance
  let freezeTxId: string | undefined;
  try {
    const freezeTx = await freezeBalance(keyInfo.accountId, estimatedCost, undefined, `minimax_v1_chat:${model}`);
    freezeTxId = freezeTx.id;
  } catch (err) {
    console.error("[minimax/v1/chat/completions] freeze failed:", err);
    return NextResponse.json({ error: "balance_freeze_failed" }, { status: 500 });
  }

  const requestId = crypto.randomUUID();
  let actualTokensIn = estimatedTokensIn;
  let actualTokensOut = estimatedTokensOut;
  let sseBuffer = "";

  let minimaxStatus = 200;
  let minimaxError: string | null = null;

  try {
    console.log("[minimax/v1/chat/completions] proxying to minimax:", { model });
    const minimaxResponse = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${minimaxApiKey}`,
        "X-Request-ID": requestId,
      },
      body: JSON.stringify(body),
    });

    minimaxStatus = minimaxResponse.status;

    if (!minimaxResponse.ok) {
      let errorBody: any;
      try {
        errorBody = await minimaxResponse.json();
      } catch {
        errorBody = await minimaxResponse.text();
      }
      console.error("[minimax/v1/chat/completions] minimax error:", errorBody);
      minimaxError = errorBody?.error?.message || errorBody?.error || `minimax_error:${minimaxResponse.status}`;
    }

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = minimaxResponse.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);

            const text = new TextDecoder().decode(value, { stream: true });
            const normalised = text.replace(/\r\n/g, "\n");
            sseBuffer += normalised;

            const msgParts = sseBuffer.split(/\n\n/);
            sseBuffer = msgParts.pop() ?? "";

            for (const raw of msgParts) {
              const line = raw.trimStart();
              if (!line.startsWith("data: ")) continue;
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") continue;
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

          // Flush buffer
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

    return new Response(stream, {
      status: minimaxStatus,
      headers: {
        "Content-Type": minimaxResponse.headers.get("Content-Type") || "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Request-ID": requestId,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    minimaxError = err?.message || "minimax_fetch_failed";
    minimaxStatus = 502;

    return NextResponse.json(
      { error: minimaxError },
      { status: 502, headers: { "X-Request-ID": requestId } },
    );
  } finally {
    if (!minimaxError) {
      const finalCost = await estimateCost(model, actualTokensIn, actualTokensOut);
      try {
        await chargeBalance(keyInfo.accountId, finalCost, freezeTxId, `minimax_v1_chat:${model}`);
      } catch (err) {
        console.error("[minimax/v1/chat/completions] chargeBalance failed:", err);
      }
    }

    const usageResult = await recordUsage({
      supabase,
      accountId: keyInfo.accountId,
      apiKeyId: keyInfo.keyId,
      model,
      tokensIn: actualTokensIn,
      tokensOut: actualTokensOut,
      costEstimate: await estimateCost(model, actualTokensIn, actualTokensOut),
      status: minimaxError ? "error" : "success",
      requestId,
    });
    if (!usageResult.success) {
      console.error("[minimax/v1/chat/completions] usage recording failed:", usageResult.error);
    }
  }
}
