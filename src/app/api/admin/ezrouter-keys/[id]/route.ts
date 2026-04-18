import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/ezrouter-keys/:id - 获取单个 Key
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const { id } = await params;
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("ezrouter_key_pool")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ ok: false, error: "key_not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_get_key" }, { status });
  }
}

// PATCH /api/admin/ezrouter-keys/:id - 更新 Key（状态、配置）
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdminClient();

    const allowed = ["name", "is_active", "load_weight", "is_shared", "metadata", "current_load", "account_id"];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from("ezrouter_key_pool")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ ok: false, error: "key_not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_update_key" }, { status });
  }
}

// DELETE /api/admin/ezrouter-keys/:id - 从池中移除 Key
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const { id } = await params;
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("ezrouter_key_pool")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_delete_key" }, { status });
  }
}
