import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdminAuth, requireSuperAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET /api/admin/admins — list all admins (super_admin or admin)
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, name, role, is_active, last_login_at, created_at, created_by")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, data: data || [] });
  } catch (err: any) {
    const status = err?.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: err?.message || "internal_error" }, { status });
  }
}

// POST /api/admin/admins — add new admin (super_admin only)
export async function POST(request: NextRequest) {
  try {
    const adminResult = requireSuperAdmin(request);
    if (adminResult instanceof NextResponse) return adminResult;
    const currentAdmin = adminResult;
    const { email, name } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdminClient();

    // Check if already exists (active or inactive)
    const { data: existing, error: findError } = await supabase
      .from("admin_users")
      .select("id, is_active")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (findError) throw new Error(findError.message);

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({ ok: false, error: "admin_already_exists" }, { status: 409 });
      }
      // Reactivate inactive admin
      const { error: reactivateError } = await supabase
        .from("admin_users")
        .update({ is_active: true, role: "admin", created_by: currentAdmin.admin_user_id })
        .eq("id", existing.id);
      if (reactivateError) throw new Error(reactivateError.message);
    } else {
      // Insert new admin
      const { error: insertError } = await supabase.from("admin_users").insert({
        email: normalizedEmail,
        name: name?.trim() || null,
        role: "admin",
        is_active: true,
        created_by: currentAdmin.admin_user_id,
      });
      if (insertError) throw new Error(insertError.message);
    }

    // Send invitation email
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;
    if (resendApiKey && resendFrom) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: resendFrom,
        to: normalizedEmail,
        subject: "You've been added as an admin on ClawLite",
        text: `You have been added as an admin on ClawLite.\n\nAsk a super admin to send you a login code to get started.\n\nIf you did not expect this email, please ignore it.`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const status = err?.message === "unauthorized" ? 401 : err?.message === "forbidden" ? 403 : 500;
    return NextResponse.json({ ok: false, error: err?.message || "internal_error" }, { status });
  }
}
