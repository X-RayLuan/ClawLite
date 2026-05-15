import crypto from "node:crypto";

function getCipherSecret(): Buffer {
  const secret = process.env.API_KEY_CIPHER_SECRET;
  if (!secret) throw new Error("API_KEY_CIPHER_SECRET env var is not set");
  return Buffer.from(secret, "hex");
}

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
  hasEncryptedSecret: boolean;
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
  return `cls_${crypto.randomBytes(24).toString("hex")}`;
}

function makeKeyPrefix(secret: string) {
  return secret.slice(0, 16);
}

// AES-256-GCM encryption
function encryptSecret(plaintext: string): string {
  const key = getCipherSecret();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintextBuf = Buffer.from(plaintext, "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintextBuf), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

// AES-256-GCM decryption
function decryptSecret(encrypted: string): string {
  const [ivHex, authTagHex, ciphertextHex] = encrypted.split(":");
  const key = getCipherSecret();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
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
    hasEncryptedSecret: Boolean(row.secret_encrypted),
  };
}

export async function listApiKeysForAccount(supabase: MinimalSupabaseClient, accountId?: string | null) {
  if (!accountId) return [] as ApiKeyView[];

  const response = await supabase
    .from("api_keys")
    .select("id, account_id, name, key_prefix, status, created_at, last_used_at, secret_encrypted")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (response?.error) {
    throw new Error(response.error.message || "failed_to_list_api_keys");
  }

  return (response.data || []).map(toApiKeyView);
}

export async function ensureClawRouterApiKey(
  supabase: MinimalSupabaseClient,
  accountId?: string | null,
  name?: string
) {
  if (!accountId) {
    throw new Error("missing_account_id");
  }

  // When a name is provided, always create a new key with that name (no reuse).
  // When no name is provided, reuse existing default key if one exists.
  if (!name) {
    const existing = await supabase
      .from("api_keys")
      .select("id, account_id, name, key_prefix, status, created_at, last_used_at, secret_encrypted")
      .eq("account_id", accountId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.error && existing.error.code !== "PGRST116") {
      throw new Error(existing.error.message || "failed_to_load_existing_api_key");
    }

    if (existing?.data) {
      return { key: toApiKeyView(existing.data), created: false, plaintextSecret: null };
    }
  }

  // Create new key — stored encrypted, revealed via revealApiKey
  const plaintextSecret = makePublicApiKey();
  const encryptedSecret = encryptSecret(plaintextSecret);
  const keyName = name || "Default key";

  const insert = await supabase
    .from("api_keys")
    .insert({
      account_id: accountId,
      name: keyName,
      key_prefix: makeKeyPrefix(plaintextSecret),
      secret_hash: hashSecret(plaintextSecret),
      secret_encrypted: encryptedSecret,
      status: "active",
    })
    .select("id, account_id, name, key_prefix, status, created_at, last_used_at, secret_encrypted")
    .single();

  if (!insert || insert.error || !insert.data) {
    throw new Error(insert?.error?.message || "failed_to_create_api_key");
  }

  return { key: toApiKeyView(insert.data), created: true, plaintextSecret };
}

// Reveal plaintext API key — decrypts from secret_encrypted
export async function revealApiKey(supabase: MinimalSupabaseClient, keyId: string, accountId: string): Promise<{ plaintextSecret: string }> {
  const response = await supabase
    .from("api_keys")
    .select("id, account_id, secret_encrypted")
    .eq("id", keyId)
    .eq("account_id", accountId)
    .eq("status", "active")
    .maybeSingle();

  if (response?.error || !response?.data) {
    throw new Error("key_not_found");
  }

  const row = response.data;

  if (!row.secret_encrypted) {
    throw new Error("key_not_recoverable");
  }

  try {
    const plaintext = decryptSecret(row.secret_encrypted);
    return { plaintextSecret: plaintext };
  } catch (err) {
    throw new Error("key_decryption_failed");
  }
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
