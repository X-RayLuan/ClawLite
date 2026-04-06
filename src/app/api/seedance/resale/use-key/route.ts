import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { validateSeedanceLicense } from "@/lib/seedance-resale";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);

    const body = await request.json().catch(() => ({}));

    const seedanceLicense = typeof body.seedanceLicense === "string" ? body.seedanceLicense : "";
    if (!seedanceLicense) {
      return NextResponse.json({ ok: false, error: "missing_seedance_license" }, { status: 400 });
    }

    const result = await validateSeedanceLicense(
      getSupabaseAdminClient(),
      {
        userId,
        seedanceLicense,
        taskEstimateUnits: body.taskEstimateUnits,
      },
    );

    return NextResponse.json({ ok: true, validation: result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_use_seedance_license" }, { status: 400 });
  }
}

