import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { settleCheckoutSessionRecord } from "@/lib/clawrouter-checkout";
import { ensureClawRouterApiKey, revealApiKey } from "@/lib/clawrouter-keys";
import { ensureClawRouterAccount } from "@/lib/clawrouter-topups";
import { assignInventoryKeyToAccount, ensureManagedKeyDelivery } from "@/lib/clawrouter-delivery";
import { sendClawLiteApiKeyEmail } from "@/lib/email";
import { addRechargeBalance } from "@/lib/recharge";

export const runtime = "nodejs";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

type MinimalSupabaseClient = {
  from: (table: string) => any;
};

async function resolveAccountEmail(
  supabase: MinimalSupabaseClient,
  accountId: string,
  fallbackEmail?: string | null,
) {
  if (fallbackEmail) {
    return fallbackEmail;
  }

  const account = await supabase
    .from("accounts")
    .select("email")
    .eq("id", accountId)
    .maybeSingle();

  if (account?.error && account.error.code !== "PGRST116") {
    throw new Error(account.error.message || "failed_to_load_account_email");
  }

  return account.data?.email || null;
}

async function maybeSendApiKeyEmail(input: {
  supabase: MinimalSupabaseClient;
  accountId: string;
  fallbackEmail?: string | null;
  keyResult: Awaited<ReturnType<typeof ensureClawRouterApiKey>>;
}) {
  if (!input.keyResult.created) {
    return;
  }

  const email = await resolveAccountEmail(input.supabase, input.accountId, input.fallbackEmail);
  if (!email) {
    console.warn(`[stripe webhook] Missing account email for api key delivery: ${input.accountId}`);
    return;
  }

  try {
    const revealed = await revealApiKey(input.supabase, input.keyResult.key.id, input.accountId);
    await sendClawLiteApiKeyEmail({
      to: email,
      apiKey: revealed.plaintextSecret,
    });
  } catch (emailError) {
    console.error("[stripe webhook] failed to send api key email", emailError);
  }
}

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ ok: false, error: "missing_stripe_secret_key" }, { status: 500 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false, error: "missing_stripe_webhook_secret" }, { status: 500 });
    }

    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ ok: false, error: "missing_stripe_signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const supabase = getSupabaseAdminClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const kind = session.metadata?.kind;
        const localSessionId = session.metadata?.checkout_session_id;

        // clawrouter_access 已移除，$5 充值现在和其他金额一样走 clawrouter_topup 流程
        // 保留此分支仅用于兼容已存在的 session
        if (kind === "clawrouter_access") {
          const accountId = session.metadata?.account_id;
          const paidAmountUsd = Number(session.metadata?.amount_usd || 0);

          if (!accountId || !Number.isFinite(paidAmountUsd) || paidAmountUsd <= 0) {
            throw new Error("invalid_access_metadata");
          }

          await addRechargeBalance(supabase, accountId, paidAmountUsd, session.id, {
            promoCode: session.metadata?.promo_code || undefined,
          });

          const keyResult = await ensureClawRouterApiKey(supabase, accountId);
          await maybeSendApiKeyEmail({
            supabase,
            accountId,
            fallbackEmail: session.customer_details?.email ?? session.customer_email ?? null,
            keyResult,
          });
          break;
        }

        if (kind === "clawrouter_topup") {
          const accountId = session.metadata?.account_id;
          const amountUsd = Number(session.metadata?.amount_usd || 0);
          const promoCode = session.metadata?.promo_code || null;

          if (!accountId || !Number.isFinite(amountUsd) || amountUsd <= 0) {
            throw new Error("invalid_topup_metadata");
          }

          // Ensure account exists before adding balance (addRechargeBalance requires the account to exist)
          await ensureClawRouterAccount({
            supabase,
            accountId,
            email: session.customer_details?.email ?? session.customer_email ?? null,
          });

          console.log(`[stripe webhook] clawrouter_topup: calling addRechargeBalance for account ${accountId}, amount ${amountUsd}, session ${session.id}`);
          try {
            const balanceResult = await addRechargeBalance(supabase, accountId, amountUsd, session.id, {
              promoCode: promoCode ?? undefined,
            });
            console.log(`[stripe webhook] addRechargeBalance result:`, balanceResult);
          } catch (balanceError: any) {
            // 如果是唯一约束冲突，说明已经处理过，跳过即可
            if (balanceError?.code === "23505") {
              console.log(`[stripe webhook] addRechargeBalance already processed (duplicate), continuing...`);
            } else {
              console.error(`[stripe webhook] addRechargeBalance failed:`, balanceError);
              throw balanceError; // 其他错误继续抛出
            }
          }

          // 创建或更新 entitlement（安装器 activation 需要检查 entitlement）
          const now = new Date().toISOString();
          await supabase
            .from("entitlements")
            .upsert(
              {
                account_id: accountId,
                product: "clawrouter",
                plan: "clawrouter",
                status: "active",
                starts_at: now,
                ends_at: null,
                updated_at: now,
              },
              { onConflict: "account_id,product" },
            );

          // 保留原有 managed key 发放逻辑
          const keyResult = await ensureClawRouterApiKey(supabase, accountId);
          try {
            const revealed = await revealApiKey(supabase, keyResult.key.id, accountId);
            await ensureManagedKeyDelivery({
              supabase,
              accountId,
              apiKey: { ...keyResult.key, plaintextSecret: revealed.plaintextSecret },
            });
          } catch (e) {
            console.error("[stripe webhook] failed to deliver managed key:", e);
          }
          await maybeSendApiKeyEmail({
            supabase,
            accountId,
            fallbackEmail: session.customer_details?.email ?? session.customer_email ?? null,
            keyResult,
          });
          break;
        }

        if (localSessionId) {
          const settled = await settleCheckoutSessionRecord({
            supabase,
            sessionId: localSessionId,
            status: "completed",
            provider: "stripe",
            externalSessionId: session.id,
            settlement: {
              stripe_event_id: event.id,
              stripe_session_id: session.id,
              stripe_payment_status: session.payment_status,
              stripe_customer_email: session.customer_details?.email ?? null,
              stripe_status: session.status,
              settled_at: new Date().toISOString(),
            },
          });

          const deliveryMode = session.metadata?.delivery_mode || "managed_topup";
          // delivery_mode 为 inventory_key 时不再分配 inventory key，统一使用 managed key
          if (deliveryMode !== "inventory_key") {
            await ensureClawRouterApiKey(supabase, settled.accountId);
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const localSessionId = session.metadata?.checkout_session_id;

        if (localSessionId) {
          await settleCheckoutSessionRecord({
            supabase,
            sessionId: localSessionId,
            status: "expired",
            provider: "stripe",
            externalSessionId: session.id,
            settlement: {
              stripe_event_id: event.id,
              stripe_session_id: session.id,
              stripe_status: session.status,
            },
          });
        }
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const localSessionId = session.metadata?.checkout_session_id;

        if (localSessionId) {
          await settleCheckoutSessionRecord({
            supabase,
            sessionId: localSessionId,
            status: "failed",
            provider: "stripe",
            externalSessionId: session.id,
            settlement: {
              stripe_event_id: event.id,
              stripe_session_id: session.id,
              stripe_status: session.status,
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "stripe_webhook_failed" },
      { status: 400 },
    );
  }
}
