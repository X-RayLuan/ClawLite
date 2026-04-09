import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    const body = await request.json().catch(() => ({}));
    const licenseId = typeof body.licenseId === "string" ? body.licenseId : "";
    if (!licenseId) {
      return NextResponse.json({ ok: false, error: "missing_license_id" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("seedance_licenses")
      .select("id,user_id,status")
      .eq("id", licenseId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ ok: false, error: "license_not_found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("seedance_licenses")
      .update({ status: "revoked" })
      .eq("id", licenseId)
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ ok: true, revoked: true, licenseId });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_revoke_seedance_key" }, { status: 400 });
  }
}
