import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { findLicenseKeyByApiKey } from "@/lib/license-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/v1/license/validate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const apiKey = typeof body.api_key === "string" ? body.api_key.trim() : "";
    const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: "missing_api_key" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Look up the license key
    const keyRecord = await findLicenseKeyByApiKey(supabase, apiKey);

    if (!keyRecord) {
      return NextResponse.json({
        valid: false,
        error: "invalid_api_key",
        message: "API key not found or has been revoked.",
      });
    }

    // Check if key is expired
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: "key_expired",
        message: "API key has expired.",
        license_type: keyRecord.license_type,
        expires_at: keyRecord.expires_at,
      });
    }

    // Optionally verify device_id matches (if provided)
    if (deviceId && keyRecord.device_id !== deviceId) {
      return NextResponse.json({
        valid: false,
        error: "device_mismatch",
        message: "API key is not valid for this device.",
      });
    }

    return NextResponse.json({
      valid: true,
      license_type: keyRecord.license_type,
      expires_at: keyRecord.expires_at,
    });
  } catch (error: any) {
    console.error("[license/validate] unexpected error:", error);
    return NextResponse.json(
      { valid: false, error: "internal_error", message: error?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
