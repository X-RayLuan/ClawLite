import { NextRequest, NextResponse } from "next/server";
import { getInstallerUrl } from "@/lib/installer-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const os = request.nextUrl.searchParams.get("os") || "mac";

  // 根据 IP 归属地选择下载源（国内→OSS，国际→GitHub）
  const target = await getInstallerUrl(os === "windows" ? "windows" : "macos")

  if (!email) {
    return NextResponse.redirect(target, 302);
  }

  // 保留 email 参数（通过 query string 传递，下载页会读取）
  return NextResponse.redirect(`${target}${target.includes('?') ? '&' : '?'}email=${encodeURIComponent(email)}`, 302);
}