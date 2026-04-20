import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// In-memory promo codes (in production, store in database)
const PROMO_CODES: Record<string, {
  discountType: "percentage" | "fixed" | "bonus";
  discountValue: number;
  description: string;
  maxUses?: number;
  usedCount?: number;
}> = {
  "SAVE10": {
    discountType: "percentage",
    discountValue: 10,
    description: "10% off your purchase!",
  },
  "BONUS20": {
    discountType: "bonus",
    discountValue: 20,
    description: "Get $20 bonus credits on any top-up!",
  },
  "FIVER": {
    discountType: "fixed",
    discountValue: 5,
    description: "$5 instant discount!",
  },
  "WELCOME15": {
    discountType: "percentage",
    discountValue: 15,
    description: "15% off for new customers!",
  },
  "DOUBLE": {
    discountType: "bonus",
    discountValue: 100,
    description: "Double your credits - 100% bonus!",
  },
};

// GET /api/promo/validate?code=SAVE10
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({
        ok: false,
        error: "promo_code_required",
      }, { status: 400 });
    }

    const promo = PROMO_CODES[code];

    if (!promo) {
      return NextResponse.json({
        ok: false,
        valid: false,
        error: "invalid_promo_code",
        message: "This promo code is not valid. Please check and try again.",
      });
    }

    // Check usage limits if configured
    if (promo.maxUses !== undefined) {
      const supabase = getSupabaseAdminClient();
      const { count } = await supabase
        .from("recharge_orders")
        .select("*", { count: "exact", head: true })
        .eq("promo_code", code)
        .eq("status", "completed");

      if ((count || 0) >= promo.maxUses) {
        return NextResponse.json({
          ok: false,
          valid: false,
          error: "promo_code_expired",
          message: "This promo code has reached its usage limit.",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      valid: true,
      code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      message: promo.description,
    });

  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error?.message || "promo_validation_failed",
    }, { status: 500 });
  }
}
