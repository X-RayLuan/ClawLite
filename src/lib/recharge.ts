import type { SupabaseClient } from "@supabase/supabase-js";

export type AddRechargeBalanceOptions = {
  promoCode?: string;
  bonusAmount?: number; // 赠送金额（不计入主充值金额）
};

export type AddRechargeBalanceResult = {
  rechargeOrderId: string;
  balanceTransactionId: string;
  newBalance: number;
};

/**
 * 充值余额：
 * 1. 在 recharge_orders 表插入记录（幂等：stripe_session_id 唯一约束）
 * 2. 在 accounts 表增加 credit_balance_usd
 * 3. 在 balance_transactions 表插入 recharge 记录（幂等 key）
 * 4. 在 topup_transactions 表插入记录（幂等 key: stripe_session_id）
 */
export async function addRechargeBalance(
  supabase: SupabaseClient,
  accountId: string,
  amountUsd: number,
  stripeSessionId: string,
  options?: AddRechargeBalanceOptions,
): Promise<AddRechargeBalanceResult> {
  const now = new Date().toISOString();
  const creditedAmountUsd = Number((amountUsd + (options?.bonusAmount || 0)).toFixed(2));
  const amountUsdFixed = Number(amountUsd.toFixed(2));

  // 1. 插入 recharge_orders（幂等依赖 stripe_session_id 唯一约束）
  const { data: rechargeOrder, error: rechargeError } = await supabase
    .from("recharge_orders")
    .insert({
      account_id: accountId,
      order_type: "stripe",
      amount_usd: amountUsdFixed,
      credited_amount_usd: creditedAmountUsd,
      provider: "stripe",
      stripe_session_id: stripeSessionId,
      promo_code: options?.promoCode || null,
      status: "completed",
      metadata: {
        bonus_amount_usd: options?.bonusAmount || 0,
        credited_amount_usd: creditedAmountUsd,
      },
    })
    .select("id")
    .single();

  if (rechargeError) {
    // 如果是唯一约束冲突，说明已经处理过，直接返回
    if (rechargeError.code === "23505") {
      const existing = await supabase
        .from("recharge_orders")
        .select("id")
        .eq("stripe_session_id", stripeSessionId)
        .maybeSingle();
      if (existing.data) {
        return {
          rechargeOrderId: existing.data.id,
          balanceTransactionId: "",
          newBalance: 0,
        };
      }
    }
    throw new Error(rechargeError.message || "failed_to_insert_recharge_order");
  }

  // 2. 获取当前余额并更新
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();

  if (accountError || !account) {
    throw new Error(accountError?.message || "account_not_found");
  }

  const balanceBefore = Number(account.credit_balance_usd || 0);
  const balanceAfter = Number((balanceBefore + creditedAmountUsd).toFixed(2));

  const { error: updateError } = await supabase
    .from("accounts")
    .update({
      credit_balance_usd: balanceAfter,
      billing_status: "active",
      updated_at: now,
    })
    .eq("id", accountId);

  if (updateError) {
    throw new Error(updateError.message || "failed_to_update_credit_balance");
  }

  // 3. 插入 balance_transactions 记录（幂等 key: stripe_session_id + tx_type=recharge）
  const idempotencyKey = `recharge:${stripeSessionId}`;

  const { data: txRecord, error: txError } = await supabase
    .from("balance_transactions")
    .insert({
      account_id: accountId,
      event_id: null,
      tx_type: "recharge",
      amount_usd: creditedAmountUsd,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: "completed",
      description: `Stripe recharge${options?.promoCode ? ` (promo: ${options.promoCode})` : ""}`,
      metadata: {
        stripe_session_id: stripeSessionId,
        recharge_order_id: rechargeOrder.id,
        promo_code: options?.promoCode || null,
        bonus_amount_usd: options?.bonusAmount || 0,
        source: "stripe_webhook",
      },
    })
    .select("id")
    .single();

  if (txError) {
    throw new Error(txError.message || "failed_to_insert_balance_transaction");
  }

  // 4. 插入 topup_transactions 记录（幂等 key: stripe_session_id）
  const { error: topupTxError } = await supabase
    .from("topup_transactions")
    .insert({
      account_id: accountId,
      provider: "stripe",
      stripe_session_id: stripeSessionId,
      stripe_event_id: null,
      amount_usd: creditedAmountUsd,
      promo_code: options?.promoCode || null,
      status: "completed",
      metadata: {
        recharge_order_id: rechargeOrder.id,
        balance_transaction_id: txRecord.id,
        bonus_amount_usd: options?.bonusAmount || 0,
        source: "stripe_webhook",
      },
    });

  if (topupTxError) {
    // 唯一约束冲突说明已处理过，忽略即可
    if (topupTxError.code !== "23505") {
      console.error("[addRechargeBalance] failed to insert topup_transactions:", topupTxError);
    }
  }

  return {
    rechargeOrderId: rechargeOrder.id,
    balanceTransactionId: txRecord.id,
    newBalance: balanceAfter,
  };
}
