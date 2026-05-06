import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type BalanceTransaction = {
  id: string;
  accountId: string;
  referenceId: string | null;
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
    referenceId: row.reference_id || null,
    txType: row.tx_type,
    amount: Number(row.amount_usd || 0),
    balanceBefore: Number(row.balance_before_usd || 0),
    balanceAfter: Number(row.balance_after_usd || 0),
    status: row.tx_type, // derived from tx_type
    description: row.metadata?.description || null,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  };
}

/**
 * Check if an account has sufficient available balance.
 */
export async function checkBalance(accountId: string): Promise<AccountBalance> {
  const supabase = getSupabaseAdminClient();

  // First try to find account by id (primary key)
  const { data: account, error } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw new Error("account_not_found");

  // If not found by id, try by user_id (handles accounts created via keys route
  // which only set user_id without specifying id)
  if (!account) {
    const { data: accountByUserId, error: userIdError } = await supabase
      .from("accounts")
      .select("id, credit_balance_usd")
      .eq("user_id", accountId)
      .maybeSingle();

    if (userIdError && userIdError.code !== "PGRST116") throw new Error("account_not_found");
    if (!accountByUserId) throw new Error("account_not_found");

    return {
      accountId: accountByUserId.id,
      balanceUsd: Number(accountByUserId.credit_balance_usd || 0),
      frozenBalanceUsd: 0,
      availableBalanceUsd: Number(accountByUserId.credit_balance_usd || 0),
    };
  }

  const balance = Number(account.credit_balance_usd || 0);

  return {
    accountId,
    balanceUsd: balance,
    frozenBalanceUsd: 0,
    availableBalanceUsd: balance,
  };
}

/**
 * Freeze (reserve) a portion of the account balance for a request.
 * For now, we skip actual freezing and just check available balance.
 */
export async function freezeBalance(
  accountId: string,
  amount: number,
  referenceId?: string,
  description?: string,
): Promise<BalanceTransaction> {
  if (amount <= 0) throw new Error("freeze_amount_must_be_positive");

  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  // Get current balance
  const { data: account, error: accError } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();

  if (accError || !account) throw new Error("account_not_found");
  const currentBalance = Number(account.credit_balance_usd || 0);

  // Check available balance (for now, no actual freezing)
  if (currentBalance < amount) {
    throw new Error("insufficient_balance");
  }

  // Insert a freeze transaction record
  const { data: tx, error: txError } = await supabase
    .from("balance_transactions")
    .insert({
      account_id: accountId,
      tx_type: "freeze",
      amount_usd: -Math.abs(amount),
      balance_before_usd: currentBalance,
      balance_after_usd: currentBalance,
      reference_id: referenceId || null,
      metadata: { description: description || null },
    })
    .select("*")
    .single();

  if (txError) throw new Error(txError.message || "freeze_failed");
  return mapTx(tx);
}

/**
 * Confirm a charge against the account balance.
 */
export async function chargeBalance(
  accountId: string,
  amount: number,
  referenceId?: string,
  description?: string,
): Promise<BalanceTransaction> {
  if (amount <= 0) throw new Error("charge_amount_must_be_positive");

  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  // Get current balance
  const { data: account, error: accError } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();

  if (accError || !account) throw new Error("account_not_found");
  const currentBalance = Number(account.credit_balance_usd || 0);
  const newBalance = Math.max(0, currentBalance - amount);

  // Update account balance
  const { error: updateError } = await supabase
    .from("accounts")
    .update({ credit_balance_usd: newBalance, updated_at: now })
    .eq("id", accountId);

  if (updateError) throw new Error(updateError.message || "failed_to_charge_balance");

  // Insert charge transaction
  const { data: tx, error: txError } = await supabase
    .from("balance_transactions")
    .insert({
      account_id: accountId,
      tx_type: "charge",
      amount_usd: -Math.abs(amount),
      balance_before_usd: currentBalance,
      balance_after_usd: newBalance,
      reference_id: referenceId || null,
      metadata: { description: description || null },
    })
    .select("*")
    .single();

  if (txError) throw new Error(txError.message || "failed_to_record_charge");
  return mapTx(tx);
}

/**
 * Refund a previously charged amount back to the account.
 */
export async function refundBalance(
  accountId: string,
  amount: number,
  referenceId?: string,
  description?: string,
): Promise<BalanceTransaction> {
  if (amount <= 0) throw new Error("refund_amount_must_be_positive");

  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  // Get current balance
  const { data: account, error: accError } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();

  if (accError || !account) throw new Error("account_not_found");
  const currentBalance = Number(account.credit_balance_usd || 0);
  const newBalance = Number((currentBalance + amount).toFixed(8));

  // Update account balance
  const { error: updateError } = await supabase
    .from("accounts")
    .update({ credit_balance_usd: newBalance, updated_at: now })
    .eq("id", accountId);

  if (updateError) throw new Error(updateError.message || "failed_to_refund_balance");

  // Insert refund transaction
  const { data: tx, error: txError } = await supabase
    .from("balance_transactions")
    .insert({
      account_id: accountId,
      tx_type: "refund",
      amount_usd: Math.abs(amount),
      balance_before_usd: currentBalance,
      balance_after_usd: newBalance,
      reference_id: referenceId || null,
      metadata: { description: description || null },
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
