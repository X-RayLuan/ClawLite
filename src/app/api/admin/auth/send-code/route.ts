import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { generate6DigitCode } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdminClient();

    // Check if user exists and is active
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id, email, role, is_active")
      .eq("email", normalizedEmail)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError) throw new Error(adminError.message);

    // If admin not found, reject (send-code only works for registered admins)
    if (!admin) {
      return NextResponse.json({ ok: false, error: "admin_not_found" }, { status: 404 });
    }

    // Generate 6-digit code
    const code = generate6DigitCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Invalidate any existing unused codes for this email
    await supabase
      .from("admin_login_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("email", normalizedEmail)
      .is("used_at", null);

    // Store new code
    const { error: insertError } = await supabase
      .from("admin_login_codes")
      .insert({ email: normalizedEmail, code, expires_at: expiresAt });

    if (insertError) throw new Error(insertError.message);

    // Send email
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;
    if (resendApiKey && resendFrom) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: resendFrom,
        to: normalizedEmail,
        subject: "Your ClawLite Admin Login Code",
        text: `Your admin login code is: ${code}\nIt expires in 5 minutes.\n\nIf you didn't request this, please ignore this email.`,
      });
    } else {
      // Log code in dev if email not configured
      console.log(`[Admin send-code] Email: ${normalizedEmail}, Code: ${code}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Admin send-code]", err);
    return NextResponse.json({ ok: false, error: err?.message || "internal_error" }, { status: 500 });
  }
}
