import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateAdminToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

// Bootstrap super-admin email (set via env var)
function getBootstrapEmail(): string | null {
  return process.env.ADMIN_BOOTSTRAP_EMAIL || null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ ok: false, error: "email and code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdminClient();

    // Find the latest unused, non-expired code
    const { data: loginCode, error: codeError } = await supabase
      .from("admin_login_codes")
      .select("id, email, code, expires_at, used_at")
      .eq("email", normalizedEmail)
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (codeError) throw new Error(codeError.message);

    // Validate code
    if (!loginCode || loginCode.code !== code) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 401 });
    }

    // Mark code as used
    await supabase
      .from("admin_login_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", loginCode.id);

    // Check if admin_users table is empty → bootstrap mode
    const { count, error: countError } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true });

    if (countError) throw new Error(countError.message);

    let adminUser: { id: string; email: string; role: string } | null = null;
    let role: "super_admin" | "admin" = "admin";
    let createdBy: string | null = null;

    if ((count ?? 0) === 0) {
      // First login: bootstrap — create super_admin
      const bootstrapEmail = getBootstrapEmail();
      const targetEmail = bootstrapEmail ? bootstrapEmail.toLowerCase() : normalizedEmail;

      const { data: newAdmin, error: insertError } = await supabase
        .from("admin_users")
        .insert({
          email: targetEmail,
          role: "super_admin",
          is_active: true,
        })
        .select("id, email, role")
        .single();

      if (insertError) throw new Error(insertError.message);
      adminUser = newAdmin;
      role = "super_admin";
    } else {
      // Normal login: find active admin by email
      const { data: existing, error: findError } = await supabase
        .from("admin_users")
        .select("id, email, role, is_active")
        .eq("email", normalizedEmail)
        .eq("is_active", true)
        .maybeSingle();

      if (findError) throw new Error(findError.message);
      if (!existing) {
        return NextResponse.json({ ok: false, error: "admin_not_found" }, { status: 404 });
      }

      adminUser = existing;
      role = existing.role as "super_admin" | "admin";
      createdBy = existing.id;
    }

    // Update last_login_at
    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", adminUser!.id);

    // Generate JWT
    const token = generateAdminToken({
      admin_user_id: adminUser!.id,
      email: adminUser!.email,
      role: role as "super_admin" | "admin",
    });

    return NextResponse.json({
      ok: true,
      token,
      admin: {
        id: adminUser!.id,
        email: adminUser!.email,
        role: role,
      },
    });
  } catch (err: any) {
    console.error("[Admin login]", err);
    return NextResponse.json({ ok: false, error: err?.message || "internal_error" }, { status: 500 });
  }
}
