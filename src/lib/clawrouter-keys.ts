import crypto from "node:crypto";

type MinimalSupabaseClient = {
  from: (table: string) => any;
};

export type ApiKeyView = {
  id: string;
  accountId: string;
  name: string;
  keyPrefix: string;
  status: string;
  createdAt: string | null;
  lastUsedAt: string | null;
  plaintextSecret?: string | null;
};

export type UsageSummaryView = {
  totalRequests: number;
  totalTokensIn: number;
  totalTokensOut: number;
  lastRequestAt: string | null;
};

function hashSecret(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

function makePublicApiKey() {
  return `clrl_live_${crypto.randomBytes(24).toString("hex")}`;
}

function makeKeyPrefix(secret: string) {
  return secret.slice(0, 16);
}

function toApiKeyView(row: any): ApiKeyView {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    keyPrefix: row.key_prefix,
    status: row.status,
    createdAt: row.created_at || null,
    lastUsedAt: row.last_used_at || null,
  };
}

export async function listApiKeysForAccount(supabase: MinimalSupabaseClient, accountId?: string | null) {
  if (!accountId) return [] as ApiKeyView[];

  const response = await supabase
    .from("api_keys")
    .select("id, account_id, name, key_prefix, status, created_at, last_used_at")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (response?.error) {
    throw new Error(response.error.message || "failed_to_list_api_keys");
  }

  return (response.data || []).map(toApiKeyView);
}

export async function ensureClawRouterApiKey(supabase: MinimalSupabaseClient, accountId?: string | null) {
  if (!accountId) {
    throw new Error("missing_account_id");
  }

  const existing = await supabase
    .from("api_keys")
    .select("id, account_id, name, key_prefix, status, created_at, last_used_at")
    .eq("account_id", accountId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.error && existing.error.code !== "PGRST116") {
    throw new Error(existing.error.message || "failed_to_load_existing_api_key");
  }

  if (existing?.data) {
    return { key: toApiKeyView(existing.data), created: false };
  }

  const plaintextSecret = makePublicApiKey();
  const insert = await supabase
    .from("api_keys")
    .insert({
      account_id: accountId,
      name: "Default key",
      key_prefix: makeKeyPrefix(plaintextSecret),
      secret_hash: hashSecret(plaintextSecret),
      status: "active",
    })
    .select("id, account_id, name, key_prefix, status, created_at, last_used_at")
    .single();

  if (!insert || insert.error || !insert.data) {
    throw new Error(insert?.error?.message || "failed_to_create_api_key");
  }

  return {
    key: {
      ...toApiKeyView(insert.data),
      plaintextSecret,
    },
    created: true,
  };
}

export async function getUsageSummaryForAccount(supabase: MinimalSupabaseClient, accountId?: string | null) {
  if (!accountId) {
    return {
      totalRequests: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
      lastRequestAt: null,
    } satisfies UsageSummaryView;
  }

  const response = await supabase
    .from("usage_events")
    .select("created_at, tokens_in, tokens_out", { count: "exact" })
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (response?.error) {
    throw new Error(response.error.message || "failed_to_load_usage_summary");
  }

  const rows = response.data || [];
  return {
    totalRequests: response.count || 0,
    totalTokensIn: rows.reduce((sum: number, row: any) => sum + Number(row.tokens_in || 0), 0),
    totalTokensOut: rows.reduce((sum: number, row: any) => sum + Number(row.tokens_out || 0), 0),
    lastRequestAt: rows[0]?.created_at || null,
  } satisfies UsageSummaryView;
}
