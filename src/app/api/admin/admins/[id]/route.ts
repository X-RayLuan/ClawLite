import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// DELETE /api/admin/admins/:id — soft-delete admin (super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = requireSuperAdmin(request);
    const { id } = params;

    if (!id) {
      return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === currentAdmin.admin_user_id) {
      return NextResponse.json({ ok: false, error: "cannot_delete_self" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Verify target exists and is active
    const { data: target, error: findError } = await supabase
      .from("admin_users")
      .select("id, email, role, is_active")
      .eq("id", id)
      .maybeSingle();

    if (findError) throw new Error(findError.message);
    if (!target) {
      return NextResponse.json({ ok: false, error: "admin_not_found" }, { status: 404 });
    }
    if (!target.is_active) {
      return NextResponse.json({ ok: false, error: "admin_already_inactive" }, { status: 409 });
    }

    // Soft delete: set is_active = false
    const { error: deleteError } = await supabase
      .from("admin_users")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (deleteError) throw new Error(deleteError.message);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const status = err?.message === "unauthorized" ? 401 : err?.message === "forbidden" ? 403 : 500;
    return NextResponse.json({ ok: false, error: err?.message || "internal_error" }, { status });
  }
}
