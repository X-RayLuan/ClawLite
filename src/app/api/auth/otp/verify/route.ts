import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import crypto from "crypto";

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code, "utf8").digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!email || !email.includes("@") || !code) {
      return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
    }

    const normalizedCode = code.replace(/\D/g, "");
    if (normalizedCode.length !== 6) {
      return NextResponse.json({ ok: false, error: "invalid_code_format" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const hashedCode = hashCode(normalizedCode);
    const now = new Date().toISOString();

    // Find the OTP record
    const { data: otpRecord, error: findError } = await supabase
      .from("otp_codes")
      .select("id")
      .eq("email", email)
      .eq("code_hash", hashedCode)
      .eq("used", false)
      .gt("expires_at", now)
      .maybeSingle();

    if (findError) {
      console.error("[otp/verify] find error:", findError);
      return NextResponse.json({ ok: false, error: "verification_failed" }, { status: 500 });
    }

    if (!otpRecord) {
      return NextResponse.json({ ok: false, error: "invalid_or_expired_code" }, { status: 401 });
    }

    // Mark OTP as used (one-time)
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    // Generate a magic link. Supabase will:
    // 1. Accept the token
    // 2. Set session cookies on our domain (via redirect_to)
    // 3. Redirect to redirect_to with tokens in the URL hash
    const returnTo = body.returnTo || "/clawrouter/dashboard";
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[otp/verify] generateLink error:", linkError);
      return NextResponse.json({ ok: false, error: "session_creation_failed" }, { status: 500 });
    }

    // Parse the generated magic link URL and inject our callback + next as redirect_to
    const actionUrl = new URL(linkData.properties.action_link);
    const magicLinkToken = actionUrl.searchParams.get("token") || "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawlite.ai";

    // Build the redirect_to: where Supabase should redirect after setting the session cookie.
    // Include 'next' so the callback knows where to send the user.
    const redirectToCallback = `${siteUrl}/auth/callback?next=${encodeURIComponent(returnTo)}`;

    // The final magic link URL — the browser will visit this, Supabase will set session
    // cookies on our domain, then redirect to redirectToCallback with tokens in the hash.
    // We return this as redirectUrl so the login page can navigate the browser to it.
    const magicLinkUrl = `https://lryjqxoudbqpwugfseyg.supabase.co/auth/v1/verify?token=${encodeURIComponent(magicLinkToken)}&type=magiclink&redirect_to=${encodeURIComponent(redirectToCallback)}`;

    return NextResponse.json({
      ok: true,
      verified: true,
      email,
      redirectUrl: magicLinkUrl,
    });
  } catch (error: any) {
    console.error("[otp/verify] unexpected error:", error);
    return NextResponse.json({ ok: false, error: error?.message || "internal_error" }, { status: 500 });
  }
}
