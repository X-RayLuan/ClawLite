type MinimalSupabaseClient = {
  from: (table: string) => any;
};

export async function settleTopupCheckoutSession(input: {
  supabase: MinimalSupabaseClient;
  accountId: string;
  stripeSessionId: string;
  stripeEventId?: string | null;
  amountUsd: number;
  promoCode?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
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
