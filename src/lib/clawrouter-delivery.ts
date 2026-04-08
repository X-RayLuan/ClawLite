import { listStripeCheckoutSessionsViaFetch } from "@/lib/stripe-rest";
import { reactivateInventoryDelivery } from "./clawrouter-delivery-reuse.js";
import { selectReusableInventoryAssignment } from "./clawrouter-delivery-idempotency.js";

type MinimalSupabaseClient = {
  from: (table: string) => any;
};

function makeKeyPrefix(secret?: string | null) {
  if (!secret) return null;
  return secret.slice(0, 16);
}

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

export async function assignInventoryKeyToAccount(input: {
  supabase: MinimalSupabaseClient;
  accountId: string;
  stripeSessionId?: string | null;
}) {
  if (input.stripeSessionId) {
    const existing = await input.supabase
      .from("account_key_deliveries")
      .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, created_at")
      .eq("account_id", input.accountId)
      .eq("delivery_mode", "inventory_key")
      .contains("metadata", { stripe_session_id: input.stripeSessionId })
      .limit(1)
      .maybeSingle();

    if (existing?.error && existing.error.code !== "PGRST116") {
      throw new Error(existing.error.message || "failed_to_load_existing_inventory_delivery");
    }

    if (existing?.data) {
      return { delivery: mapDelivery(existing.data), created: false, soldOut: false };
    }
  }

  const activeDelivery = await input.supabase
    .from("account_key_deliveries")
    .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, metadata, created_at")
    .eq("account_id", input.accountId)
    .eq("delivery_mode", "inventory_key")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeDelivery?.error && activeDelivery.error.code !== "PGRST116") {
    throw new Error(activeDelivery.error.message || "failed_to_load_active_inventory_delivery");
  }

  const assignedInventory = await input.supabase
    .from("inventory_keys")
    .select("id, provider, name, plaintext_key, face_value_usd, sale_price_usd, status")
    .eq("assigned_account_id", input.accountId)
    .eq("status", "assigned")
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assignedInventory?.error && assignedInventory.error.code !== "PGRST116") {
    throw new Error(assignedInventory.error.message || "failed_to_load_existing_assigned_inventory_key");
  }

  let assignedInventoryDelivery = null;
  if (assignedInventory?.data) {
    const existingAssignedDelivery = await input.supabase
      .from("account_key_deliveries")
      .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, metadata, created_at")
      .eq("account_id", input.accountId)
      .eq("delivery_mode", "inventory_key")
      .eq("source_type", "inventory_key")
      .eq("source_id", assignedInventory.data.id)
      .limit(1)
      .maybeSingle();

    if (existingAssignedDelivery?.error && existingAssignedDelivery.error.code !== "PGRST116") {
      throw new Error(existingAssignedDelivery.error.message || "failed_to_load_assigned_inventory_delivery");
    }

    assignedInventoryDelivery = existingAssignedDelivery?.data || null;
  }

  const reusableAssignment = selectReusableInventoryAssignment({
    activeDelivery: activeDelivery?.data || null,
    assignedInventory: assignedInventory?.data || null,
    assignedInventoryDelivery,
  });

  if (reusableAssignment.kind === 'active_delivery' && reusableAssignment.delivery) {
    return { delivery: mapDelivery(reusableAssignment.delivery), created: false, soldOut: false };
  }

  if (reusableAssignment.kind === 'assigned_inventory' && reusableAssignment.inventory) {
    const now = new Date().toISOString();
    if (reusableAssignment.delivery) {
      const reactivated = reactivateInventoryDelivery(
        reusableAssignment.delivery,
        reusableAssignment.inventory,
        input.stripeSessionId || null,
      );
      const deliveryUpdate = await input.supabase
        .from("account_key_deliveries")
        .update({
          display_name: reactivated.display_name,
          provider: reactivated.provider,
          plaintext_key: reactivated.plaintext_key,
          key_prefix: reactivated.key_prefix,
          face_value_usd: reactivated.face_value_usd,
          sale_price_usd: reactivated.sale_price_usd,
          status: reactivated.status,
          metadata: reactivated.metadata,
          updated_at: now,
        })
        .eq("id", reusableAssignment.delivery.id)
        .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, created_at")
        .single();

      if (!deliveryUpdate || deliveryUpdate.error || !deliveryUpdate.data) {
        throw new Error(deliveryUpdate?.error?.message || "failed_to_reactivate_assigned_inventory_delivery");
      }

      return { delivery: mapDelivery(deliveryUpdate.data), created: false, soldOut: false };
    }

    const deliveryInsert = await input.supabase
      .from("account_key_deliveries")
      .insert({
        account_id: input.accountId,
        delivery_mode: "inventory_key",
        source_type: "inventory_key",
        source_id: reusableAssignment.inventory.id,
        display_name: reusableAssignment.inventory.name,
        provider: reusableAssignment.inventory.provider,
        plaintext_key: reusableAssignment.inventory.plaintext_key,
        key_prefix: makeKeyPrefix(reusableAssignment.inventory.plaintext_key),
        face_value_usd: reusableAssignment.inventory.face_value_usd,
        sale_price_usd: reusableAssignment.inventory.sale_price_usd,
        status: "active",
        metadata: {
          stripe_session_id: input.stripeSessionId || null,
        },
        updated_at: now,
      })
      .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, created_at")
      .single();

    if (!deliveryInsert || deliveryInsert.error || !deliveryInsert.data) {
      throw new Error(deliveryInsert?.error?.message || "failed_to_create_assigned_inventory_delivery");
    }

    return { delivery: mapDelivery(deliveryInsert.data), created: false, soldOut: false };
  }

  const available = await input.supabase
    .from("inventory_keys")
    .select("id, provider, name, plaintext_key, face_value_usd, sale_price_usd, status")
    .eq("status", "available")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (available?.error && available.error.code !== "PGRST116") {
    throw new Error(available.error.message || "failed_to_load_available_inventory_key");
  }

  if (!available?.data) {
    return { delivery: null, created: false, soldOut: true };
  }

  const now = new Date().toISOString();
  const inventoryUpdate = await input.supabase
    .from("inventory_keys")
    .update({
      status: "assigned",
      assigned_account_id: input.accountId,
      assigned_at: now,
      updated_at: now,
    })
    .eq("id", available.data.id)
    .eq("status", "available")
    .select("id, provider, name, plaintext_key, face_value_usd, sale_price_usd, status")
    .maybeSingle();

  if (inventoryUpdate?.error && inventoryUpdate.error.code !== "PGRST116") {
    throw new Error(inventoryUpdate.error.message || "failed_to_assign_inventory_key");
  }

  if (!inventoryUpdate?.data) {
    return { delivery: null, created: false, soldOut: true };
  }

  const existingDelivery = await input.supabase
    .from("account_key_deliveries")
    .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, metadata, created_at")
    .eq("account_id", input.accountId)
    .eq("delivery_mode", "inventory_key")
    .eq("source_type", "inventory_key")
    .eq("source_id", inventoryUpdate.data.id)
    .limit(1)
    .maybeSingle();

  if (existingDelivery?.error && existingDelivery.error.code !== "PGRST116") {
    throw new Error(existingDelivery.error.message || "failed_to_load_reusable_inventory_delivery");
  }

  if (existingDelivery?.data) {
    const reactivated = reactivateInventoryDelivery(
      existingDelivery.data,
      inventoryUpdate.data,
      input.stripeSessionId || null,
    );
    const deliveryUpdate = await input.supabase
      .from("account_key_deliveries")
      .update({
        display_name: reactivated.display_name,
        provider: reactivated.provider,
        plaintext_key: reactivated.plaintext_key,
        key_prefix: reactivated.key_prefix,
        face_value_usd: reactivated.face_value_usd,
        sale_price_usd: reactivated.sale_price_usd,
        status: reactivated.status,
        metadata: reactivated.metadata,
        updated_at: now,
      })
      .eq("id", existingDelivery.data.id)
      .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, created_at")
      .single();

    if (!deliveryUpdate || deliveryUpdate.error || !deliveryUpdate.data) {
      throw new Error(deliveryUpdate?.error?.message || "failed_to_reactivate_inventory_delivery");
    }

    return { delivery: mapDelivery(deliveryUpdate.data), created: false, soldOut: false };
  }

  const deliveryInsert = await input.supabase
    .from("account_key_deliveries")
    .insert({
      account_id: input.accountId,
      delivery_mode: "inventory_key",
      source_type: "inventory_key",
      source_id: inventoryUpdate.data.id,
      display_name: inventoryUpdate.data.name,
      provider: inventoryUpdate.data.provider,
      plaintext_key: inventoryUpdate.data.plaintext_key,
      key_prefix: makeKeyPrefix(inventoryUpdate.data.plaintext_key),
      face_value_usd: inventoryUpdate.data.face_value_usd,
      sale_price_usd: inventoryUpdate.data.sale_price_usd,
      status: "active",
      metadata: {
        stripe_session_id: input.stripeSessionId || null,
      },
      updated_at: now,
    })
    .select("id, delivery_mode, display_name, provider, plaintext_key, key_prefix, face_value_usd, sale_price_usd, status, created_at")
    .single();

  if (!deliveryInsert || deliveryInsert.error || !deliveryInsert.data) {
    throw new Error(deliveryInsert?.error?.message || "failed_to_create_inventory_delivery");
  }

  return { delivery: mapDelivery(deliveryInsert.data), created: true, soldOut: false };
}

export async function reconcileInventoryAccessFromStripe(input: {
  supabase: MinimalSupabaseClient;
  accountId: string;
  stripeSessionIds?: string[];
}) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { reconciled: 0 };
  }

  const sessionIdFilter = Array.isArray(input.stripeSessionIds) ? input.stripeSessionIds.filter(Boolean) : [];
  if (sessionIdFilter.length === 0) {
    return { reconciled: 0 };
  }

  const sessions = await listStripeCheckoutSessionsViaFetch({
    secretKey: process.env.STRIPE_SECRET_KEY,
    limit: 25,
  });

  let reconciled = 0;

  for (const session of sessions) {
    if (session?.status !== "complete" || session?.payment_status !== "paid") continue;
    if (session?.metadata?.kind !== "clawrouter_access") continue;
    if (session?.metadata?.delivery_mode !== "inventory_key") continue;
    if (session?.metadata?.account_id !== input.accountId) continue;
    if (!sessionIdFilter.includes(session.id)) continue;

    const assignment = await assignInventoryKeyToAccount({
      supabase: input.supabase,
      accountId: input.accountId,
      stripeSessionId: session.id,
    });

    if (!assignment.soldOut && assignment.delivery) {
      reconciled += 1;
    }
  }

  return { reconciled };
}
