import { NextRequest, NextResponse } from "next/server";
import {
  getPartnerCouponConfig,
  PARTNER_REFERRAL_COOKIE,
  PARTNER_REFERRAL_TTL_SECONDS,
} from "@/lib/partner-referral";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ partnerSlug: string }> }
) {
  const { partnerSlug } = await context.params;
  const partner = getPartnerCouponConfig(partnerSlug);

  if (!partner) {
    return NextResponse.redirect(new URL("/downloads", _request.url));
  }

  const destination = new URL("/downloads", _request.url);
  destination.searchParams.set("partner", partner.slug);

  const response = NextResponse.redirect(destination);
  response.cookies.set({
    name: PARTNER_REFERRAL_COOKIE,
    value: partner.slug,
    maxAge: PARTNER_REFERRAL_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
