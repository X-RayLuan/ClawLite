import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import crypto from "crypto";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code, "utf8").digest("hex");
}

// Attach CORS headers to any NextResponse
function withCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin") || "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 204 });
  return withCors(request, response);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      const response = NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 }
      );
      return withCors(request, response);
    }

    const supabase = getSupabaseAdminClient();

    // Delete any existing unused OTPs for this email (cleanup)
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    const code = generateCode();
    const hashedCode = hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email,
        code_hash: hashedCode,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) {
      console.error("[otp/send] failed to insert OTP:", insertError);
      const response = NextResponse.json(
        { ok: false, error: "failed_to_store_otp" },
        { status: 500 }
      );
      return withCors(request, response);
    }

    // Send email with Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;

    if (resendApiKey && resendFrom) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: resendFrom,
            to: [email],
            subject: "Your ClawLite login code",
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#111827;max-width:480px;margin:0 auto;padding:32px 16px;">
                <h2 style="margin:0 0 16px;">Your ClawLite login code</h2>
                <p style="margin:0 0 16px;">Use this code to sign in to your ClawLite account:</p>
                <div style="margin:0 0 20px;padding:20px 24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;text-align:center;">
                  <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:32px;font-weight:700;letter-spacing:0.3em;color:#111827;">${code}</span>
                </div>
                <p style="margin:0;font-size:14px;color:#6b7280;">This code expires in ${OTP_TTL_MINUTES} minutes. If you did not request this, you can safely ignore this email.</p>
              </div>
            `,
            text: `Your ClawLite login code: ${code}\n\nThis code expires in ${OTP_TTL_MINUTES} minutes.`,
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.error("[otp/send] Resend error:", errText);
        }
      } catch (emailErr) {
        console.error("[otp/send] failed to send email:", emailErr);
      }
    } else {
      console.warn("[otp/send] RESEND_API_KEY or RESEND_FROM not set, skipping email");
    }

    const okResponse = NextResponse.json({ ok: true });
    return withCors(request, okResponse);
  } catch (error: any) {
    const response = NextResponse.json(
      { ok: false, error: error?.message || "internal_error" },
      { status: 500 }
    );
    return withCors(request, response);
  }
}
