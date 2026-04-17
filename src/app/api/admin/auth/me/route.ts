import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const payload = requireAdminAuth(request);
    const supabase = getSupabaseAdminClient();

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, email, name, role, is_active, last_login_at, created_at")
      .eq("id", payload.admin_user_id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!admin) {
      return NextResponse.json({ ok: false, error: "admin_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: admin });
  } catch (err: any) {
    const status = err?.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: err?.message || "internal_error" }, { status });
  }
}
