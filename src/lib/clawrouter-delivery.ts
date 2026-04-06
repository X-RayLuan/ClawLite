type MinimalSupabaseClient = {
  from: (table: string) => any;
};

export type DeliveredKeyView = {
  id: string;
  deliveryMode: "managed_key" | "inventory_key";
  displayName: string;
  provider: string;
  plaintextKey: string | null;
  keyPrefix: string | null;
  faceValueUsd: number | null;
  salePriceUsd: number | null;
  status: string;
  createdAt: string | null;
};

function mapDelivery(row: any): DeliveredKeyView {
  return {
    id: row.id,
    deliveryMode: row.delivery_mode,
    displayName: row.display_name,
    provider: row.provider,
    plaintextKey: row.plaintext_key || null,
    keyPrefix: row.key_prefix || null,
    faceValueUsd: row.face_value_usd == null ? null : Number(row.face_value_usd),
    salePriceUsd: row.sale_price_usd == null ? null : Number(row.sale_price_usd),
    status: row.status,
    createdAt: row.created_at || null,
  };
}

export async function listDeliveredKeysForAccount(supabase: MinimalSupabaseClient, accountId?: string | null) {
  if (!accountId) return [] as DeliveredKeyView[];

  const response = await supabase
    .from("account_key_deliveries")
    .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, created_at")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (response?.error) {
    throw new Error(response.error.message || "failed_to_list_delivered_keys");
  }

  return (response.data || []).map(mapDelivery);
}

export async function ensureManagedKeyDelivery(input: {
  supabase: MinimalSupabaseClient;
  accountId: string;
  apiKey: {
    id: string;
    name: string;
    keyPrefix: string;
    plaintextSecret?: string | null;
    status: string;
    createdAt: string | null;
  };
}) {
  const response = await input.supabase
    .from("account_key_deliveries")
    .upsert(
      {
        account_id: input.accountId,
        delivery_mode: "managed_key",
        source_type: "api_key",
        source_id: input.apiKey.id,
        display_name: input.apiKey.name,
        provider: "clawlite",
        plaintext_key: input.apiKey.plaintextSecret || null,
        key_prefix: input.apiKey.keyPrefix,
        status: input.apiKey.status,
        metadata: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id,delivery_mode,source_type,source_id" },
    )
    .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, created_at")
    .single();

  if (!response || response.error || !response.data) {
    throw new Error(response?.error?.message || "failed_to_upsert_managed_key_delivery");
  }

  return mapDelivery(response.data);
}
