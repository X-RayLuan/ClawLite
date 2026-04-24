import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  generateCode,
  hashCode,
  isValidEmail,
  CODE_TTL_MINUTES,
} from "@/lib/license-keys";

export const runtime = "nodejs";

// POST /api/v1/license/send-code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const platform = typeof body.platform === "string" ? body.platform.trim() : "";
    const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "invalid_email", message: "A valid email address is required." },
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

    // Check if email exists in accounts table
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, email, billing_status, plan")
      .eq("email", email)
      .maybeSingle();

    if (accountError) {
      console.error("[license/send-code] account lookup error:", accountError);
    }

    // If account does not exist or has never purchased (no active entitlement), return email_not_purchased
    if (!account) {
      return NextResponse.json(
        { success: false, error: "email_not_purchased", message: "No purchase found for this email address." },
        { status: 403 }
      );
    }

    // Check entitlements for this account
    const { data: entitlement } = await supabase
      .from("entitlements")
      .select("id")
      .eq("account_id", account.id)
      .eq("status", "active")
      .maybeSingle();

    const hasActiveEntitlement = !!entitlement;
    const hasCreditBalance = Number(account.billing_status === "active");

    if (!hasActiveEntitlement && !hasCreditBalance) {
      return NextResponse.json(
        { success: false, error: "email_not_purchased", message: "No active purchase found for this email address." },
        { status: 403 }
      );
    }

    // Clean up old unused codes for this email
    await supabase
      .from("license_verification_codes")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    // Generate new 6-digit code
    const code = generateCode();
    const hashedCode = hashCode(code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("license_verification_codes")
      .insert({
        email,
        code_hash: hashedCode,
        device_id: deviceId,
        platform: platform || null,
        expires_at: expiresAt,
        used: false,
        failed_attempts: 0,
      });

    if (insertError) {
      console.error("[license/send-code] failed to insert code:", insertError);
      return NextResponse.json(
        { success: false, error: "internal_error", message: "Failed to generate verification code." },
        { status: 500 }
      );
    }

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;

    if (resendApiKey && resendFrom) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: resendFrom,
            to: [email],
            subject: "Your ClawLite Installer verification code",
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#111827;max-width:480px;margin:0 auto;padding:32px 16px;">
                <h2 style="margin:0 0 16px;">Your ClawLite Installer activation code</h2>
                <p style="margin:0 0 16px;">Use this code to activate ClawLite Installer:</p>
                <div style="margin:0 0 20px;padding:20px 24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;text-align:center;">
                  <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:32px;font-weight:700;letter-spacing:0.3em;color:#111827;">${code}</span>
                </div>
                <p style="margin:0;font-size:14px;color:#6b7280;">This code expires in ${CODE_TTL_MINUTES} minutes. If you did not request this, you can safely ignore this email.</p>
              </div>
            `,
            text: `Your ClawLite Installer activation code: ${code}\n\nThis code expires in ${CODE_TTL_MINUTES} minutes.`,
          }),
        });
      } catch (emailErr) {
        console.error("[license/send-code] failed to send email:", emailErr);
        // Don't fail the request — code was generated and stored
      }
    } else {
      console.warn("[license/send-code] RESEND_API_KEY or RESEND_FROM not set, skipping email");
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
      expires_in: CODE_TTL_MINUTES * 60,
    });
  } catch (error: any) {
    console.error("[license/send-code] unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error", message: error?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
