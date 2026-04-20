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

    let inserted = false;
    let tableExists = true;

    try {
      const { error } = await supabase.from("resale_intakes").insert({
        id: intakeId,
        installer_setup_token: setupToken,
        seller_email: sellerEmail,
        seats: seats || 1,
        note: note || null,
        status: "submitted",
        created_at: new Date().toISOString(),
      });

      if (error) {
        // Check if error is "table does not exist"
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          tableExists = false;
        } else {
          throw error;
        }
      } else {
        inserted = true;
      }
    } catch (err: any) {
      // Non-table-not-found errors
      if (err.code !== "42P01" && !err.message?.includes("does not exist")) {
        return NextResponse.json(
          { error: err?.message || "resale_intake_failed" },
          { status: 500 },
        );
      }
      tableExists = false;
    }

    if (!tableExists) {
      return NextResponse.json(
        {
          status: "unavailable",
          intakeId: null,
          error: "Resale intake is not available at this time. Please contact support.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: inserted ? "submitted" : "failed",
      intakeId: inserted ? intakeId : null,
      reviewUrl: inserted ? `https://clawlite.ai/resale/${intakeId}` : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "resale_intake_failed" },
      { status: 500 },
    );
  }
}
