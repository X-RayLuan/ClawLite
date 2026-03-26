export const PARTNER_REFERRAL_COOKIE = "clawlite_partner_ref";
export const PARTNER_REFERRAL_TTL_SECONDS = 60 * 60 * 24 * 30;

export type PartnerCouponConfig = {
  slug: string;
  displayName: string;
  couponCode: string;
  couponLabel?: string;
  ctaText?: string;
};

export const DEFAULT_EZROUTER_COUPON = process.env.NEXT_PUBLIC_EZROUTER_COUPON_CODE || "WELCOMEEZROUTER2X";

const PARTNER_COUPON_MAP: Record<string, PartnerCouponConfig> = {
  kenmoo: {
    slug: "kenmoo",
    displayName: "Kenmoo",
    couponCode: "KENMOOEZROUTER2X",
    couponLabel: "Kenmoo partner bonus",
    ctaText: "Use your Kenmoo partner promo on EZROUTER.",
  },
};

export function normalizePartnerSlug(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

export function getPartnerCouponConfig(partnerSlug: string | null | undefined) {
  const slug = normalizePartnerSlug(partnerSlug);
  return slug ? PARTNER_COUPON_MAP[slug] || null : null;
}

export function getCouponExperience(partnerSlug: string | null | undefined) {
  const partner = getPartnerCouponConfig(partnerSlug);
  if (partner) {
    return {
      source: "partner" as const,
      partner,
      couponCode: partner.couponCode,
      headline: `${partner.displayName} partner coupon`,
      body: partner.ctaText || `Use your ${partner.displayName} partner promo on EZROUTER.`,
      redeemStepText: `Enter promo code ${partner.couponCode}`,
    };
  }

  return {
    source: "default" as const,
    partner: null,
    couponCode: DEFAULT_EZROUTER_COUPON,
    headline: "50% Discount Token Coupon",
    body: "Login complete. Use this 50% welcome code on EZROUTER.",
    redeemStepText: `Enter promo code ${DEFAULT_EZROUTER_COUPON}`,
  };
}
