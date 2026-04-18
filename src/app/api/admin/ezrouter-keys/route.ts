import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET /api/admin/ezrouter-keys - 列出所有 Key
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("ezrouter_key_pool")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data: data || [] }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_list_keys" }, { status });
  }
}

// POST /api/admin/ezrouter-keys - 添加 Key 到池
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const supabase = getSupabaseAdminClient();
    const body = await request.json();

    const { ezrouter_key_id, plaintext_key, key_prefix, name, is_shared, load_weight, metadata } = body;

    if (!ezrouter_key_id || !plaintext_key || !key_prefix || !name) {
      return NextResponse.json({ ok: false, error: "missing required fields: ezrouter_key_id, plaintext_key, key_prefix, name" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ezrouter_key_pool")
      .insert({
        ezrouter_key_id,
        plaintext_key,
        key_prefix,
        name,
        is_shared: is_shared ?? false,
        load_weight: load_weight ?? 100,
        metadata: metadata ?? {},
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error: any) {
    const status = error?.message === "unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_add_key" }, { status });
  }
}
