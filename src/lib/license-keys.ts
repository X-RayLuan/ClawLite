import crypto from "node:crypto";

const LICENSE_KEY_PREFIX = "cllk_live_";
const CODE_LENGTH = 6;
const CODE_TTL_MINUTES = 5;
const MAX_FAILED_ATTEMPTS = 3;
const LOCK_DURATION_MINUTES = 15;

// ---------------------------------------------------------------------------
// Code hashing (SHA-256)
// ---------------------------------------------------------------------------
export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code, "utf8").digest("hex");
}

// ---------------------------------------------------------------------------
// API Key generation
// ---------------------------------------------------------------------------
export function generateLicenseApiKey(): string {
  return LICENSE_KEY_PREFIX + crypto.randomBytes(24).toString("hex");
}

export function makeApiKeyPrefix(secret: string): string {
  return secret.slice(0, 16);
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

// ---------------------------------------------------------------------------
// 6-digit code generation
// ---------------------------------------------------------------------------
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type LicenseKeyRecord = {
  id: string;
  email: string;
  api_key_prefix: string;
  device_id: string;
  license_type: string;
  expires_at: string | null;
  status: string;
  created_at: string;
};

export type VerificationCodeRecord = {
  id: string;
  email: string;
  code_hash: string;
  device_id: string;
  platform: string | null;
  expires_at: string;
  used: boolean;
  failed_attempts: number;
  locked_until: string | null;
};

// ---------------------------------------------------------------------------
// Validate input helpers
// ---------------------------------------------------------------------------
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

// ---------------------------------------------------------------------------
// License key lookup by prefix + hash (for validate endpoint)
// ---------------------------------------------------------------------------
export async function findLicenseKeyByApiKey(
  supabase: any,
  apiKey: string
): Promise<LicenseKeyRecord | null> {
  const prefix = makeApiKeyPrefix(apiKey);
  const keyHash = hashApiKey(apiKey);

  // We need to find by prefix first, then verify hash
  const { data, error } = await supabase
    .from("license_keys")
    .select("*")
    .eq("api_key_prefix", prefix)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return null;

  // Double-check hash matches
  if (data.api_key_hash !== keyHash) return null;

  return data as LicenseKeyRecord;
}

// ---------------------------------------------------------------------------
// Find license key by email + device_id
// ---------------------------------------------------------------------------
export async function findLicenseKeyByEmailAndDevice(
  supabase: any,
  email: string,
  deviceId: string
): Promise<LicenseKeyRecord | null> {
  const { data, error } = await supabase
    .from("license_keys")
    .select("*")
    .eq("email", email.toLowerCase())
    .eq("device_id", deviceId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data as LicenseKeyRecord;
}

// ---------------------------------------------------------------------------
// Create a new license key
// ---------------------------------------------------------------------------
export async function createLicenseKey(
  supabase: any,
  params: {
    email: string;
    deviceId: string;
    licenseType?: string;
    expiresAt?: string | null;
  }
): Promise<{ apiKey: string; record: LicenseKeyRecord }> {
  const apiKey = generateLicenseApiKey();
  const apiKeyHash = hashApiKey(apiKey);
  const apiKeyPrefix = makeApiKeyPrefix(apiKey);

  const { data, error } = await supabase
    .from("license_keys")
    .insert({
      email: params.email.toLowerCase(),
      device_id: params.deviceId,
      api_key_hash: apiKeyHash,
      api_key_prefix: apiKeyPrefix,
      license_type: params.licenseType || "free",
      expires_at: params.expiresAt || null,
      status: "active",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "failed_to_create_license_key");
  }

  return { apiKey, record: data as LicenseKeyRecord };
}

// ---------------------------------------------------------------------------
// Rotate (revoke old, create new) license key
// ---------------------------------------------------------------------------
export async function rotateLicenseKey(
  supabase: any,
  email: string,
  deviceId: string,
  licenseType?: string,
  expiresAt?: string | null
): Promise<{ apiKey: string; record: LicenseKeyRecord }> {
  // Revoke existing active keys for this email+device
  await supabase
    .from("license_keys")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("email", email.toLowerCase())
    .eq("device_id", deviceId)
    .eq("status", "active");

  return createLicenseKey(supabase, { email, deviceId, licenseType, expiresAt });
}

// ---------------------------------------------------------------------------
// Check if account has active entitlement for license type resolution
// ---------------------------------------------------------------------------
export async function getAccountLicenseInfo(
  supabase: any,
  email: string
): Promise<{ licenseType: string; expiresAt: string | null }> {
  // Check accounts table
  const { data: account } = await supabase
    .from("accounts")
    .select("id, plan, billing_status")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!account) {
    return { licenseType: "free", expiresAt: null };
  }

  // Check entitlements for this account
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("plan, status, ends_at")
    .eq("account_id", account.id)
    .eq("status", "active")
    .maybeSingle();

  if (entitlement && entitlement.ends_at) {
    return { licenseType: entitlement.plan || "pro", expiresAt: entitlement.ends_at };
  }

  // Check account plan
  if (account.billing_status === "active") {
    return { licenseType: account.plan || "pro", expiresAt: null };
  }

  return { licenseType: "free", expiresAt: null };
}

export { CODE_TTL_MINUTES, MAX_FAILED_ATTEMPTS, LOCK_DURATION_MINUTES };
