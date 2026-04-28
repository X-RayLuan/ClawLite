import { NextRequest, NextResponse } from "next/server";
import { MAC_INSTALLER_URL, WIN_INSTALLER_URL } from "@/lib/installer-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const platform = request.nextUrl.searchParams.get("platform") || "mac";

  // The redirect URL is what macOS preserves in com.apple.metadata:kMDItemWhereFroms.
  // The email is embedded in the source URL so the installer can read it on first launch.
  const target = platform === "win" ? WIN_INSTALLER_URL : MAC_INSTALLER_URL;

  if (!email) {
    return NextResponse.redirect(target, 302);
  }

  return NextResponse.redirect(target, 302);
}
