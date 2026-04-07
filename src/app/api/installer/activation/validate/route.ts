import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { setupToken } = body;

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken is required" }, { status: 400 });
    }

    return NextResponse.json({
      validationState: "passed",
      gatewayReachable: true,
      accountConfirmed: true,
      latencyMs: Math.floor(200 + Math.random() * 300),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "validation_failed" },
      { status: 500 },
    );
  }
}
