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

    // Find account
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, email")
      .eq("id", userId)
      .maybeSingle();

    if (accountError || !account) {
      return NextResponse.json({ ok: false, error: "account_not_found" }, { status: 404 });
    }

    // Referral code = account ID (shortened or direct UUID)
    const referralCode = account.id;

    // Referral link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clawrouter.com";
    const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

    // Stats: count referrals and commissions
    const [{ count: totalReferrals }, { count: pendingReferrals }, { data: commissions, error: commError }] = await Promise.all([
      supabase
        .from("affiliate_referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", account.id),
      supabase
        .from("affiliate_referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", account.id)
        .eq("status", "pending"),
      supabase
        .from("affiliate_commissions")
        .select("amount, status, created_at")
        .eq("referrer_id", account.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (commError) {
      return NextResponse.json({ ok: false, error: commError.message || "failed_to_load_commissions" }, { status: 500 });
    }

    const pendingCommission = (commissions || [])
      .filter((c: any) => c.status === "pending")
      .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

    const totalCommission = (commissions || [])
      .filter((c: any) => c.status === "paid")
      .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

    return NextResponse.json(
      {
        ok: true,
        referralCode,
        referralLink,
        stats: {
          totalReferrals: totalReferrals || 0,
          pendingReferrals: pendingReferrals || 0,
          pendingCommission,
          totalCommission,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_load_affiliate" }, { status: 500 });
  }
}
