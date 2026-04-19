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

    const returnTo = body.returnTo || "/clawrouter/dashboard";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawlite.ai";

    // Pass redirect_to explicitly so Supabase redirects to our callback with tokens in hash.
    // @ts-ignore — redirectTo is a valid runtime param but may not be in TS types
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(returnTo)}`,
    } as any);

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[otp/verify] generateLink error:", linkError);
      return NextResponse.json({ ok: false, error: "session_creation_failed" }, { status: 500 });
    }

    // Return the action_link directly — the browser will visit it, Supabase will
    // set session cookies on our domain and redirect to redirectTo with tokens in hash.
    const actionLink = linkData.properties!.action_link!;
    return NextResponse.json({
      ok: true,
      verified: true,
      email,
      redirectUrl: actionLink,
    });

    return NextResponse.json({
      ok: true,
      verified: true,
      email,
      redirectUrl: linkData.properties.action_link,
    });
  } catch (error: any) {
    console.error("[otp/verify] unexpected error:", error);
    return NextResponse.json({ ok: false, error: error?.message || "internal_error" }, { status: 500 });
  }
}
