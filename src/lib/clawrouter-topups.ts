import { listStripeCheckoutSessionsViaFetch } from "@/lib/stripe-rest";
import { collectReconciledInventoryAccessSessionIds } from "./clawrouter-topups-reconcile.js";

type MinimalSupabaseClient = {
  from: (table: string) => any;
};

export async function ensureClawRouterAccount(input: {
  supabase: MinimalSupabaseClient;
  accountId: string;
  email?: string | null;
}) {
  const now = new Date().toISOString();
  const response = await input.supabase
    .from("accounts")
    .upsert(
      {
        id: input.accountId,
        user_id: input.accountId,
        email: input.email || null,
        updated_at: now,
      },
      { onConflict: "id" },
    )
    .select("id, email, credit_balance_usd")
    .single();

  if (!response || response.error || !response.data) {
    throw new Error(response?.error?.message || "failed_to_upsert_topup_account");
  }

  return response.data;
}

export async function settleTopupCheckoutSession(input: {
  supabase: MinimalSupabaseClient;
  accountId: string;
  stripeSessionId: string;
  stripeEventId?: string | null;
  amountUsd: number;
  promoCode?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  await ensureClawRouterAccount({
    supabase: input.supabase,
    accountId: input.accountId,
    email: typeof input.metadata?.stripe_customer_email === "string" ? String(input.metadata?.stripe_customer_email) : null,
  });

  const existing = await input.supabase
    .from("topup_transactions")
    .select("id, status")
    .eq("stripe_session_id", input.stripeSessionId)
    .maybeSingle();

  if (existing?.error && existing.error.code !== "PGRST116") {
    throw new Error(existing.error.message || "failed_to_load_topup_transaction");
  }

  if (existing?.data?.status === "completed") {
    return { alreadySettled: true };
  }

  const now = new Date().toISOString();

  const insert = await input.supabase
    .from("topup_transactions")
    .upsert(
      {
        account_id: input.accountId,
        provider: "stripe",
        stripe_session_id: input.stripeSessionId,
        stripe_event_id: input.stripeEventId || null,
        amount_usd: Number(input.amountUsd.toFixed(2)),
        promo_code: input.promoCode || null,
        status: "completed",
        metadata: input.metadata || {},
        updated_at: now,
      },
      { onConflict: "stripe_session_id" },
    )
    .select("id")
    .single();

  if (!insert || insert.error || !insert.data) {
    throw new Error(insert?.error?.message || "failed_to_upsert_topup_transaction");
  }

  const account = await input.supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", input.accountId)
    .maybeSingle();

  if (account?.error && account.error.code !== "PGRST116") {
    throw new Error(account.error.message || "failed_to_load_account_for_topup");
  }

  const currentBalance = Number(account?.data?.credit_balance_usd || 0);
  const nextBalance = Number((currentBalance + input.amountUsd).toFixed(2));

  const accountUpdate = await input.supabase
    .from("accounts")
    .update({
      credit_balance_usd: nextBalance,
      billing_status: "active",
      updated_at: now,
    })
    .eq("id", input.accountId);

  if (accountUpdate?.error) {
    throw new Error(accountUpdate.error.message || "failed_to_update_credit_balance");
  }

  return {
    alreadySettled: false,
    nextBalance,
  };
}

export async function reconcileTopupsFromStripe(input: {
  supabase: MinimalSupabaseClient;
  accountId: string;
  email?: string | null;
}) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { reconciled: 0, reconciledInventoryAccessSessionIds: [] as string[] };
  }

  const sessions = await listStripeCheckoutSessionsViaFetch({
    secretKey: process.env.STRIPE_SECRET_KEY,
    limit: 25,
  });

  let reconciled = 0;
  const settledSessions = [];

  for (const session of sessions) {
    if (session?.status !== "complete" || session?.payment_status !== "paid") continue;
    if (!["clawrouter_topup", "clawrouter_access"].includes(session?.metadata?.kind || "")) continue;
    if (session?.metadata?.account_id !== input.accountId) continue;

    const paidAmountUsd = Number(session?.metadata?.amount_usd || 0);
    const amountUsd = paidAmountUsd;
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) continue;

    const result = await settleTopupCheckoutSession({
      supabase: input.supabase,
      accountId: input.accountId,
      stripeSessionId: session.id,
      amountUsd,
      promoCode: session?.metadata?.promo_code || null,
      metadata: {
        reconciled_from_account_api: true,
        kind: session?.metadata?.kind || null,
        paid_amount_usd: paidAmountUsd,
        bonus_amount_usd: Math.max(amountUsd - paidAmountUsd, 0),
        credited_amount_usd: amountUsd,
        stripe_customer_email: session?.customer_details?.email || session?.customer_email || input.email || null,
        stripe_payment_status: session?.payment_status || null,
        stripe_status: session?.status || null,
      },
    });
    settledSessions.push({
      id: session.id,
      metadata: {
        kind: session?.metadata?.kind || null,
      },
      alreadySettled: result.alreadySettled,
    });

    if (!result.alreadySettled) {
      reconciled += 1;
    }
  }

  return {
    reconciled,
    reconciledInventoryAccessSessionIds: collectReconciledInventoryAccessSessionIds(settledSessions),
  };
}
