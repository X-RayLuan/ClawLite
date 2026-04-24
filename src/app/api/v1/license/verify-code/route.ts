import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  generateLicenseApiKey,
  makeApiKeyPrefix,
  hashApiKey,
  hashCode,
  isValidEmail,
  isValidCode,
  findLicenseKeyByEmailAndDevice,
  getAccountLicenseInfo,
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_MINUTES,
} from "@/lib/license-keys";

export const runtime = "nodejs";

// POST /api/v1/license/verify-code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "invalid_email", message: "A valid email address is required." },
        { status: 400 }
      );
    }
    if (!code || !isValidCode(code)) {
      return NextResponse.json(
        { success: false, error: "invalid_code", message: "A valid 6-digit code is required." },
        { status: 400 }
      );
    }
    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "missing_device_id", message: "device_id is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const hashedCode = hashCode(code);
    const now = new Date().toISOString();

    // Find the most recent un-used code record for this email
    const { data: codeRecord, error: findError } = await supabase
      .from("license_verification_codes")
      .select("*")
      .eq("email", email)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error("[license/verify-code] find error:", findError);
      return NextResponse.json(
        { success: false, error: "internal_error", message: "Verification failed." },
        { status: 500 }
      );
    }

    if (!codeRecord) {
      return NextResponse.json(
        { success: false, error: "invalid_code", message: "Invalid or expired verification code." },
        { status: 401 }
      );
    }

    // Check if code is expired
    if (new Date(codeRecord.expires_at) < new Date(now)) {
      return NextResponse.json(
        { success: false, error: "code_expired", message: "Verification code has expired. Please request a new one." },
        { status: 401 }
      );
    }

    // Check if account is locked due to too many failed attempts
    if (codeRecord.locked_until && new Date(codeRecord.locked_until) > new Date(now)) {
      const lockedMs = new Date(codeRecord.locked_until).getTime() - Date.now();
      const lockedMinutes = Math.ceil(lockedMs / 60000);
      return NextResponse.json(
        {
          success: false,
          error: "account_locked",
          message: `Too many failed attempts. Please try again in ${lockedMinutes} minute(s).`,
          retry_after: Math.ceil(lockedMs / 1000),
        },
        { status: 429 }
      );
    }

    // Verify the code
    const codeMatches = codeRecord.code_hash === hashedCode;
    const deviceMatches = codeRecord.device_id === deviceId;

    if (!codeMatches || !deviceMatches) {
      // Increment failed_attempts
      const newFailedAttempts = (codeRecord.failed_attempts || 0) + 1;
      const lockUntil =
        newFailedAttempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000).toISOString()
          : codeRecord.locked_until;

      await supabase
        .from("license_verification_codes")
        .update({
          failed_attempts: newFailedAttempts,
          locked_until: lockUntil,
        })
        .eq("id", codeRecord.id);

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        return NextResponse.json(
          {
            success: false,
            error: "account_locked",
            message: `Too many failed attempts. Please try again in ${LOCK_DURATION_MINUTES} minutes.`,
            retry_after: LOCK_DURATION_MINUTES * 60,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "invalid_code",
          message: "Invalid verification code.",
          attempts_remaining: MAX_FAILED_ATTEMPTS - newFailedAttempts,
        },
        { status: 401 }
      );
    }

    // Code is valid — mark it as used
    await supabase
      .from("license_verification_codes")
      .update({ used: true })
      .eq("id", codeRecord.id);

    // Get license info for this account
    const { licenseType, expiresAt } = await getAccountLicenseInfo(supabase, email);

    // Check if this email+device already has an active license key
    let existingKey = await findLicenseKeyByEmailAndDevice(supabase, email, deviceId);
    let apiKey: string;

    if (existingKey) {
      // Return existing key
      apiKey = `[retained — key not exposed in response — use refresh-key to rotate]`;
      // We can't reconstruct the plaintext key from hash, so for verify-code we return the existing key info
      // In practice, the installer should store the key after first verify-code call
      // For re-verification, we return a flag indicating key already exists
      return NextResponse.json({
        success: true,
        message: "Device already activated.",
        api_key: null,
        api_key_prefix: existingKey.api_key_prefix,
        license_type: existingKey.license_type,
        expires_at: existingKey.expires_at,
        already_activated: true,
      });
    }

    // Create new license key
    const newApiKey = generateLicenseApiKey();
    const apiKeyHash = hashApiKey(newApiKey);
    const apiKeyPrefix = makeApiKeyPrefix(newApiKey);

    const { data: newKeyRecord, error: keyError } = await supabase
      .from("license_keys")
      .insert({
        email,
        device_id: deviceId,
        api_key_hash: apiKeyHash,
        api_key_prefix: apiKeyPrefix,
        license_type: licenseType,
        expires_at: expiresAt || null,
        status: "active",
      })
      .select("*")
      .single();

    if (keyError) {
      console.error("[license/verify-code] failed to create license key:", keyError);
      return NextResponse.json(
        { success: false, error: "internal_error", message: "Failed to create license key." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Device activated successfully.",
      api_key: newApiKey,
      api_key_prefix: apiKeyPrefix,
      license_type: licenseType,
      expires_at: expiresAt,
      already_activated: false,
    });
  } catch (error: any) {
    console.error("[license/verify-code] unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error", message: error?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
