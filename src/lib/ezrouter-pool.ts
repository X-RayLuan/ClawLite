import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type PoolKey = {
  id: string;
  ezrouterKeyId: string;
  plaintextKey: string;
  keyPrefix: string;
  name: string;
  isActive: boolean;
  loadWeight: number;
  currentLoad: number;
  accountId: string | null;
  isShared: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: any): PoolKey {
  return {
    id: row.id,
    ezrouterKeyId: row.ezrouter_key_id,
    plaintextKey: row.plaintext_key,
    keyPrefix: row.key_prefix,
    name: row.name,
    isActive: row.is_active,
    loadWeight: row.load_weight,
    currentLoad: row.current_load,
    accountId: row.account_id || null,
    isShared: row.is_shared,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * List all keys in the pool.
 */
export async function listPoolKeys(): Promise<PoolKey[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ezrouter_key_pool")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message || "failed_to_list_pool_keys");
  return (data || []).map(mapRow);
}

/**
 * Select the best key (lowest load / weight ratio) from active shared keys.
 * Falls back to any active key if no shared key is available.
 */
export async function selectBestKey(): Promise<PoolKey | null> {
  const supabase = getSupabaseAdminClient();

  // Prefer shared keys with the lowest load
  const { data, error } = await supabase
    .from("ezrouter_key_pool")
    .select("*")
    .eq("is_active", true)
    .eq("is_shared", true)
    .order("current_load", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message || "failed_to_select_best_key");

  if (data) return mapRow(data);

  // Fallback: any active key sorted by load
  const { data: fallback, error: fallbackError } = await supabase
    .from("ezrouter_key_pool")
    .select("*")
    .eq("is_active", true)
    .order("current_load", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fallbackError) throw new Error(fallbackError.message || "failed_to_select_fallback_key");
  return fallback ? mapRow(fallback) : null;
}

/**
 * Increment the load counter after a request is dispatched.
 * Also resets load when a key is checked healthy.
 */
export async function updateKeyUsage(keyId: string, delta = 1): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.rpc("increment_key_load", { key_id: keyId, delta });
  if (error) {
    // Fallback: manual read + write if RPC not available
    const { data: row, error: readError } = await supabase
      .from("ezrouter_key_pool")
      .select("id, current_load")
      .eq("id", keyId)
      .maybeSingle();

    if (readError) throw new Error(readError.message || "failed_to_update_key_usage");

    await supabase
      .from("ezrouter_key_pool")
      .update({
        current_load: (row?.current_load || 0) + delta,
        updated_at: new Date().toISOString(),
      })
      .eq("id", keyId);
  }
}

/**
 * Mark a key as healthy (active) or unhealthy (inactive).
 */
export async function checkKeyHealth(keyId: string, healthy: boolean): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("ezrouter_key_pool")
    .update({
      is_active: healthy,
      current_load: healthy ? 0 : 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", keyId);

  if (error) throw new Error(error.message || "failed_to_check_key_health");
}

/**
 * Persist a new key into the pool.
 */
export async function addKeyToPool(input: {
  ezrouterKeyId: string;
  plaintextKey: string;
  keyPrefix: string;
  name: string;
  isShared?: boolean;
  metadata?: Record<string, unknown>;
}): Promise<PoolKey> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ezrouter_key_pool")
    .insert({
      ezrouter_key_id: input.ezrouterKeyId,
      plaintext_key: input.plaintextKey,
      key_prefix: input.keyPrefix,
      name: input.name,
      is_shared: input.isShared ?? false,
      metadata: input.metadata || {},
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message || "failed_to_add_key_to_pool");
  return mapRow(data);
}
