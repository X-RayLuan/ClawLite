import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const OTP_TTL_MINUTES = 10;

function withCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin") || "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code, "utf8").digest("hex");
}

function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!isValidEmail(email)) {
      return withCors(request, NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 }));
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
      return withCors(request, NextResponse.json({ ok: false, error: "email_service_not_configured" }, { status: 500 }));
    }

    const supabase = getSupabaseAdminClient();
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    const insertResult = await supabase.from("otp_codes").insert({
      email,
      code_hash: hashCode(code),
      expires_at: expiresAt,
      used: false,
    });

    if (insertResult.error) {
      throw new Error(insertResult.error.message || "failed_to_store_otp");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: [email],
      subject: "Your ClawLite verification code",
      text: `Your ClawLite verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
      html: `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;line-height:1.6;color:#111827;"><h2>Your ClawLite verification code</h2><p>Enter this code in the ClawLite installer:</p><p style="font-size:28px;font-weight:800;letter-spacing:6px;margin:18px 0;">${code}</p><p style="color:#6b7280;font-size:13px;">This code expires in ${OTP_TTL_MINUTES} minutes. If you did not request it, you can ignore this email.</p></div>`,
    });

    return withCors(request, NextResponse.json({ ok: true, id: result.data?.id || null }));
  } catch (error: any) {
    console.error("[auth/otp/send] unexpected error:", error);
    return withCors(request, NextResponse.json({ ok: false, error: error?.message || "internal_error" }, { status: 500 }));
  }
}
