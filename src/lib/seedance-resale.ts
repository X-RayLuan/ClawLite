import crypto from "node:crypto";

type MinimalSupabaseClient = {
  from: (table: string) => any;
};

export type SeedanceQuoteInput = {
  userId: string;
  sku?: string | null;
  requestedUnits?: number | null;
};

export type SeedanceOrderInput = {
  userId: string;
  amountUsd: number;
  units: number;
  sku: string;
  metadata?: Record<string, unknown>;
  providerCheckoutSessionId?: string | null;
};

export type SeedanceConfirmInput = {
  orderId: string;
  providerEventId: string;
  providerStatus?: string;
  settleMetadata?: Record<string, unknown>;
};

export type SeedanceUseKeyInput = {
  userId: string;
  seedanceLicense: string;
  taskEstimateUnits?: number;
};

export type SeedanceQuote = {
  sku: string;
  requestedUnits: number;
  unitPriceUsd: number;
  subtotalUsd: number;
  currency: "USD";
};

function now() {
  return new Date().toISOString();
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function randomLicenseKey() {
  return `sd_live_${crypto.randomBytes(16).toString("hex")}`;
}

function priceBySku(sku: string) {
  if (sku === "seedance_starter_1x") {
    return 2.5;
  }
  if (sku === "seedance_premium_10x") {
    return 20;
  }
  return 5;
}

function normalizeRequestedUnits(input?: number | null) {
  if (!Number.isFinite(Number(input))) {
    return 1;
  }
  return Math.max(1, Math.floor(Number(input)));
}

export function buildSeedanceQuote(input: SeedanceQuoteInput): SeedanceQuote {
  const sku = input.sku || "seedance_starter_1x";
  const requestedUnits = normalizeRequestedUnits(input.requestedUnits);
  const unitPriceUsd = priceBySku(sku);
  return {
    sku,
    requestedUnits,
    unitPriceUsd,
    subtotalUsd: Number((unitPriceUsd * requestedUnits).toFixed(2)),
    currency: "USD",
  };
}

function resolveProviderEnabled() {
  return Boolean(process.env.SEEDANCE_API_KEY && process.env.SEEDANCE_PROVIDER_ENDPOINT);
}

export async function createSeedanceOrder(supabase: MinimalSupabaseClient, input: SeedanceOrderInput) {
  if (!input.userId || !Number.isFinite(input.amountUsd) || !Number.isFinite(input.units)) {
    throw new Error("invalid_seedance_order_input");
  }

  const nowAt = now();
  const id = crypto.randomUUID();
  const metadata = {
    ...(input.metadata || {}),
    providerEnabled: resolveProviderEnabled(),
    createdBy: "seedance-service",
  };

  const insert = await supabase.from("seedance_sales_orders").insert({
    id,
    account_id: input.userId,
    sku: input.sku,
    status: "pending",
    amount_usd: input.amountUsd,
    units: input.units,
    provider_checkout_session_id: input.providerCheckoutSessionId || null,
    metadata,
    created_at: nowAt,
    updated_at: nowAt,
  }).select("*").single();

  if (!insert || insert.error || !insert.data) {
    throw new Error(insert?.error?.message || "failed_to_create_seedance_order");
  }

  return insert.data;
}

export async function confirmSeedanceOrder(
  supabase: MinimalSupabaseClient,
  input: SeedanceConfirmInput,
) {
  if (!input.orderId) {
    throw new Error("missing_order_id");
  }

  const current = await supabase
    .from("seedance_sales_orders")
    .select("*")
    .eq("id", input.orderId)
    .maybeSingle();

  if (current?.error) {
    throw new Error(current.error.message || "failed_to_load_seedance_order");
  }
  if (!current?.data) {
    throw new Error("seedance_order_not_found");
  }

  const nextMetadata = {
    ...(current.data.metadata || {}),
    providerStatus: input.providerStatus || null,
    providerEventId: input.providerEventId,
    settleMetadata: input.settleMetadata || {},
    settledAt: now(),
  };

  const updated = await supabase
    .from("seedance_sales_orders")
    .update({
      status: "paid",
      provider_event_id: input.providerEventId,
      metadata: nextMetadata,
      updated_at: now(),
    })
    .eq("id", input.orderId)
    .eq("status", "pending")
    .select("*")
    .single();

  if (!updated || updated.error || !updated.data) {
    throw new Error(updated?.error?.message || "failed_to_confirm_seedance_order");
  }

  return updated.data;
}

export async function createSeedanceSelfSignedLicense(supabase: MinimalSupabaseClient, orderRow: any) {
  if (!orderRow || !orderRow.account_id) {
    throw new Error("invalid_order_for_license_issue");
  }

  const licenseText = randomLicenseKey();
  const keyHash = sha256(licenseText);
  const nowAt = now();

  const inserted = await supabase.from("seedance_licenses").insert({
    id: crypto.randomUUID(),
    account_id: orderRow.account_id,
    order_id: orderRow.id,
    sku: orderRow.sku || "seedance_starter_1x",
    license_hash: keyHash,
    status: "active",
    max_uses: Math.max(1, Number(orderRow.units || 1)),
    remaining_uses: Math.max(1, Number(orderRow.units || 1)),
    issued_at: nowAt,
    expires_at: null,
    metadata: {
      orderId: orderRow.id,
      createdBy: "seedance-service",
    },
    created_at: nowAt,
    updated_at: nowAt,
  }).select("*").single();

  if (!inserted || inserted.error || !inserted.data) {
    throw new Error(inserted?.error?.message || "failed_to_create_seedance_license");
  }

  return {
    id: inserted.data.id,
    license: licenseText,
    licenseHash: keyHash,
    status: inserted.data.status,
    remainingUses: inserted.data.remaining_uses,
    maxUses: inserted.data.max_uses,
  };
}

export async function validateSeedanceLicense(supabase: MinimalSupabaseClient, input: SeedanceUseKeyInput) {
  if (!input.seedanceLicense || !input.userId) {
    throw new Error("missing_license_or_user");
  }

  const keyHash = sha256(input.seedanceLicense);
  const rowRes = await supabase
    .from("seedance_licenses")
    .select("id, account_id, status, remaining_uses, max_uses, sku")
    .eq("license_hash", keyHash)
    .maybeSingle();

  if (rowRes?.error) {
    throw new Error(rowRes.error.message || "failed_to_lookup_seedance_license");
  }

  if (!rowRes?.data) {
    throw new Error("seedance_license_not_found");
  }

  const license = rowRes.data;

  if (license.account_id !== input.userId) {
    throw new Error("seedance_license_not_owned");
  }

  if (license.status !== "active") {
    throw new Error("seedance_license_not_active");
  }

  const costUnits = Math.max(1, Math.floor(Number(input.taskEstimateUnits || 1)));

  if (license.remaining_uses < costUnits) {
    await supabase
      .from("seedance_licenses")
      .update({ status: "exhausted", updated_at: now() })
      .eq("id", license.id);
    throw new Error("seedance_license_insufficient_balance");
  }

  const nextRemaining = Math.max(0, Number(license.remaining_uses) - costUnits);
  const nextStatus = nextRemaining <= 0 ? "exhausted" : "active";

  const usage = await supabase.from("seedance_usage_ledger").insert({
    id: crypto.randomUUID(),
    account_id: input.userId,
    license_id: license.id,
    used_units: costUnits,
    task_unit_cost: 1,
    created_at: now(),
    status: "pending",
    metadata: {
      requestedUnits: costUnits,
    },
  }).select("*").single();

  if (!usage || usage.error || !usage.data) {
    throw new Error(usage?.error?.message || "failed_to_write_seedance_usage");
  }

  const updatedLicense = await supabase
    .from("seedance_licenses")
    .update({
      remaining_uses: nextRemaining,
      status: nextStatus,
      updated_at: now(),
    })
    .eq("id", license.id)
    .select("id, remaining_uses, status")
    .single();

  if (!updatedLicense || updatedLicense.error || !updatedLicense.data) {
    throw new Error(updatedLicense?.error?.message || "failed_to_update_seedance_license");
  }

  return {
    ok: true,
    licenseId: license.id,
    remainingUses: updatedLicense.data.remaining_uses,
    status: updatedLicense.data.status,
    usageId: usage.data.id,
  };
}

export async function getSeedanceLicense(supabase: MinimalSupabaseClient, licenseId: string, userId: string) {
  const row = await supabase
    .from("seedance_licenses")
    .select("id, license_hash, status, max_uses, remaining_uses, issued_at, expires_at, sku")
    .eq("id", licenseId)
    .eq("account_id", userId)
    .maybeSingle();

  if (row?.error && row.error.code !== "PGRST116") {
    throw new Error(row.error.message || "failed_to_get_seedance_license");
  }

  return row.data || null;
}

