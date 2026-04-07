import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAC_DMG_URL =
  "https://github.com/X-RayLuan/ClawLite-Brand-Installer/releases/latest/download/clawlite.dmg";
const WIN_EXE_URL =
  "https://github.com/X-RayLuan/ClawLite-Brand-Installer/releases/latest/download/clawlite-setup.exe";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const platform = request.nextUrl.searchParams.get("platform") || "mac";

  // The redirect URL is what macOS preserves in com.apple.metadata:kMDItemWhereFroms.
  // The email is embedded in the source URL so the installer can read it on first launch.
  const target = platform === "win" ? WIN_EXE_URL : MAC_DMG_URL;

  if (!email) {
    return NextResponse.redirect(target, 302);
  }

  return NextResponse.redirect(target, 302);
}
