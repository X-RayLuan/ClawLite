import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("seedance_licenses")
      .select("id,key_name,key_prefix,status,max_uses,remaining_uses,model_scope,created_at,last_used_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, keys: data || [] });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_list_seedance_keys" }, { status: 400 });
  }
}
