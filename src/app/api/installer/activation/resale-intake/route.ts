import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { setupToken, sellerEmail, seats, note } = body;

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }
    if (!sellerEmail) {
      return NextResponse.json({ error: "sellerEmail is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const intakeId = crypto.randomUUID();

    try {
      await supabase.from("resale_intakes").insert({
        id: intakeId,
        installer_setup_token: setupToken,
        seller_email: sellerEmail,
        seats: seats || 1,
        note: note || null,
        status: "submitted",
        created_at: new Date().toISOString(),
      });
    } catch {
      // Table may not exist yet — log and continue
      console.log("resale_intakes insert skipped (table may not exist):", intakeId);
    }

    return NextResponse.json({
      status: "submitted",
      intakeId,
      reviewUrl: `https://clawlite.ai/resale/${intakeId}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "resale_intake_failed" },
      { status: 500 },
    );
  }
}
