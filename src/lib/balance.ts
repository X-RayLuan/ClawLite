import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type BalanceTransaction = {
  id: string;
  accountId: string;
  eventId: string | null;
  txType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AccountBalance = {
  accountId: string;
  balanceUsd: number;
  frozenBalanceUsd: number;
  availableBalanceUsd: number;
};

function mapTx(row: any): BalanceTransaction {
  return {
    id: row.id,
    accountId: row.account_id,
    eventId: row.event_id || null,
    txType: row.tx_type,
    amount: Number(row.amount),
    balanceBefore: Number(row.balance_before),
    balanceAfter: Number(row.balance_after),
    status: row.status,
    description: row.description || null,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  };
}

/**
 * Check if an account has sufficient available balance.
 */
export async function checkBalance(accountId: string): Promise<AccountBalance> {
  const supabase = getSupabaseAdminClient();

  const { data: account, error } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();

  if (error || !account) throw new Error("account_not_found");

  const balance = Number(account.credit_balance_usd || 0);

  // Sum frozen amounts from pending freeze transactions
  const { data: frozenRows } = await supabase
    .from("balance_transactions")
    .select("amount")
    .eq("account_id", accountId)
    .eq("tx_type", "freeze")
    .eq("status", "frozen");

  const frozenBalance = (frozenRows || []).reduce(
    (sum: number, r: any) => sum + Math.abs(Number(r.amount)),
    0,
  );

  return {
    accountId,
    balanceUsd: balance,
    frozenBalanceUsd: frozenBalance,
    availableBalanceUsd: Math.max(0, balance - frozenBalance),
  };
}

/**
 * Freeze (reserve) a portion of the account balance.
 * Returns the transaction record.
 */
export async function freezeBalance(
  accountId: string,
  amount: number,
  eventId?: string,
  description?: string,
): Promise<BalanceTransaction> {
  if (amount <= 0) throw new Error("freeze_amount_must_be_positive");

  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  // Use a transaction-like pattern with two queries + locking via RPC if available
  // First get current balance
  const { data: account, error: accError } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();

  if (accError || !account) throw new Error("account_not_found");
  const currentBalance = Number(account.credit_balance_usd || 0);

  // Check available balance
  const frozen = await checkBalance(accountId);
  if (frozen.availableBalanceUsd < amount) {
    throw new Error("insufficient_balance");
  }

  const txType = "freeze";
  const balanceBefore = currentBalance;
  const balanceAfter = currentBalance; // freeze doesn't change total

  const { data: tx, error: txError } = await supabase
    .from("balance_transactions")
    .insert({
      account_id: accountId,
      event_id: eventId || null,
      tx_type: txType,
      amount: -Math.abs(amount),
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: "frozen",
      description: description || null,
    })
    .select("*")
    .single();

  if (txError) throw new Error(txError.message || "failed_to_freeze_balance");
  return mapTx(tx);
}

/**
 * Confirm a charge against a previously frozen amount (or direct deduction).
 * eventId ties this to the originating freeze transaction.
 */
export async function chargeBalance(
  accountId: string,
  amount: number,
  eventId?: string,
  description?: string,
): Promise<BalanceTransaction> {
  if (amount <= 0) throw new Error("charge_amount_must_be_positive");

  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: account, error: accError } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();

  if (accError || !account) throw new Error("account_not_found");
  const currentBalance = Number(account.credit_balance_usd || 0);

  const txType = "charge";
  const balanceBefore = currentBalance;
  const balanceAfter = Math.max(0, currentBalance - amount);

  // Update account balance
  const { error: updateError } = await supabase
    .from("accounts")
    .update({ credit_balance_usd: balanceAfter, updated_at: now })
    .eq("id", accountId);

  if (updateError) throw new Error(updateError.message || "failed_to_charge_balance");

  // Insert charge transaction
  const { data: tx, error: txError } = await supabase
    .from("balance_transactions")
    .insert({
      account_id: accountId,
      event_id: eventId || null,
      tx_type: txType,
      amount: -Math.abs(amount),
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: "completed",
      description: description || null,
    })
    .select("*")
    .single();

  if (txError) throw new Error(txError.message || "failed_to_record_charge");

  // Mark any matching freeze transactions as released
  if (eventId) {
    await supabase
      .from("balance_transactions")
      .update({ status: "released" })
      .eq("account_id", accountId)
      .eq("event_id", eventId)
      .eq("tx_type", "freeze")
      .eq("status", "frozen");
  }

  return mapTx(tx);
}

/**
 * Refund a previously charged amount back to the account.
 */
export async function refundBalance(
  accountId: string,
  amount: number,
  eventId?: string,
  description?: string,
): Promise<BalanceTransaction> {
  if (amount <= 0) throw new Error("refund_amount_must_be_positive");

  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: account, error: accError } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();

  if (accError || !account) throw new Error("account_not_found");
  const currentBalance = Number(account.credit_balance_usd || 0);

  const txType = "refund";
  const balanceBefore = currentBalance;
  const balanceAfter = Number((currentBalance + amount).toFixed(2));

  // Update account balance
  const { error: updateError } = await supabase
    .from("accounts")
    .update({ credit_balance_usd: balanceAfter, updated_at: now })
    .eq("id", accountId);

  if (updateError) throw new Error(updateError.message || "failed_to_refund_balance");

  // Insert refund transaction
  const { data: tx, error: txError } = await supabase
    .from("balance_transactions")
    .insert({
      account_id: accountId,
      event_id: eventId || null,
      tx_type: txType,
      amount: Math.abs(amount),
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: "completed",
      description: description || null,
    })
    .select("*")
    .single();

  if (txError) throw new Error(txError.message || "failed_to_record_refund");
  return mapTx(tx);
}

/**
 * Get transaction history for an account.
 */
export async function getTransactionHistory(
  accountId: string,
  limit = 50,
  offset = 0,
): Promise<BalanceTransaction[]> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("balance_transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message || "failed_to_get_transaction_history");
  return (data || []).map(mapTx);
}
