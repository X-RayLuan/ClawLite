import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  findLicenseKeyByApiKey,
  rotateLicenseKey,
  getAccountLicenseInfo,
} from "@/lib/license-keys";

export const runtime = "nodejs";

// POST /api/v1/license/refresh-key
// Requires: Authorization: Bearer <api_key>
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const apiKey =
      authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "unauthorized", message: "API key is required." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Look up the license key
    const keyRecord = await findLicenseKeyByApiKey(supabase, apiKey);

    if (!keyRecord) {
      return NextResponse.json(
        { success: false, error: "invalid_api_key", message: "Invalid or revoked API key." },
        { status: 401 }
      );
    }

    // Check if key is expired
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "key_expired",
          message: "API key has expired.",
          license_type: keyRecord.license_type,
          expires_at: keyRecord.expires_at,
        },
        { status: 401 }
      );
    }

    // Get current license info from account
    const { licenseType, expiresAt } = await getAccountLicenseInfo(
      supabase,
      keyRecord.email
    );

    // Rotate the key (revoke old, create new)
    const { apiKey: newApiKey, record: newRecord } = await rotateLicenseKey(
      supabase,
      keyRecord.email,
      keyRecord.device_id,
      licenseType,
      expiresAt
    );

    return NextResponse.json({
      success: true,
      message: "API key refreshed successfully.",
      api_key: newApiKey,
      api_key_prefix: newRecord.api_key_prefix,
      license_type: licenseType,
      expires_at: expiresAt,
    });
  } catch (error: any) {
    console.error("[license/refresh-key] unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error", message: error?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
