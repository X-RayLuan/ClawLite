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

    // Find account
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (accountError || !account) {
      return NextResponse.json({ ok: false, error: "account_not_found" }, { status: 404 });
    }

    // Find all pending commissions for this user
    const { data: pendingCommissions, error: commError } = await supabase
      .from("affiliate_commissions")
      .select("id, amount")
      .eq("referrer_id", account.id)
      .eq("status", "pending");

    if (commError) {
      return NextResponse.json({ ok: false, error: commError.message || "failed_to_load_commissions" }, { status: 500 });
    }

    if (!pendingCommissions || pendingCommissions.length === 0) {
      return NextResponse.json({ ok: false, error: "no_pending_commissions" }, { status: 400 });
    }

    // Mark them as paid
    const commissionIds = pendingCommissions.map((c: any) => c.id);
    const { error: updateError } = await supabase
      .from("affiliate_commissions")
      .update({ status: "paid" })
      .in("id", commissionIds);

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message || "failed_to_claim_commissions" }, { status: 500 });
    }

    const totalClaimed = pendingCommissions.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

    return NextResponse.json(
      { ok: true, claimed: commissionIds.length, amount: totalClaimed },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_claim_commissions" }, { status: 500 });
  }
}
