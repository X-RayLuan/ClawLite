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

    // Generate magic link (contains token) via admin API
    // This doesn't send email - just generates the URL and token
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[otp/verify] generateLink error:", linkError);
      return NextResponse.json({ ok: false, error: "session_creation_failed" }, { status: 500 });
    }

    // Extract the token from the magic link URL
    // action_link format: https://xxx.auth.supabase.co/auth/v1/verify?token=XXX&type=magiclink&...
    const actionLink = linkData.properties.action_link;
    let accessToken = "";
    try {
      const url = new URL(actionLink);
      accessToken = url.searchParams.get("token") || "";
    } catch {
      // URL parsing failed, accessToken stays empty
    }

    if (!accessToken) {
      console.error("[otp/verify] could not extract token from action_link:", actionLink);
      return NextResponse.json({ ok: false, error: "session_creation_failed" }, { status: 500 });
    }

    // Now we have a valid Supabase access token
    // Redirect to callback with this token to set the session cookie
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawlite.ai";
    const callbackUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(body.returnTo || "/clawrouter/dashboard")}&code=${accessToken}`;

    return NextResponse.json({
      ok: true,
      verified: true,
      email,
      redirectUrl: callbackUrl,
    });
  } catch (error: any) {
    console.error("[otp/verify] unexpected error:", error);
    return NextResponse.json({ ok: false, error: error?.message || "internal_error" }, { status: 500 });
  }
}
