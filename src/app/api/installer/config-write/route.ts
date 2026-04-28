import { NextRequest, NextResponse } from "next/server";

/**
 * Installer config-write API.
 *
 * In the web-based installer flow, the actual config file write to the user's
 * local ~/.openclaw/openclaw.json is performed by the desktop installer app
 * (ClawLite-Installer), not by this Next.js server route.
 *
 * This endpoint exists as a signal/audit log for when a user triggers
 * "Configure to Claw" from the installer dashboard. It can be extended in the
 * future to coordinate with the desktop installer via a secure channel.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const apiKey = typeof body.apiKey === "string" ? body.apiKey : "";

    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "missing_api_key" }, { status: 400 });
    }

    // Log the config-write event server-side (actual file write is handled by the desktop installer)
    console.log(`[installer/config-write] Config write triggered for account (apiKey prefix: ${apiKey.slice(0, 12)}...)`);

    return NextResponse.json({
      ok: true,
      message: "Config write signalled. Actual file write is performed by the desktop installer app.",
    });
  } catch (error: any) {
    console.error("[installer/config-write] unexpected error:", error);
    return NextResponse.json({ ok: false, error: error?.message || "internal_error" }, { status: 500 });
  }
}
