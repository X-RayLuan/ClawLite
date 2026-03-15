export const pricingConfig = {
  byok: {
    label: "BYOK",
    platformFee: "$0 platform fee",
    description: "Your key. Your usage. Your bill."
  },
  tokens: {
    label: "ClawLite Tokens",
    pricingLabel: "Usage-based",
    description: "Managed billing for fast-moving teams.",
    discountText: "50% discount from official API price",
    ezRouterUrl: "https://openrouter.ezsite.ai"
  },
  remoteImplementation: {
    label: "Remote Implementation",
    price: "$500",
    description: "We install, configure, and get your workflow running with you.",
    stripeUrl: "https://buy.stripe.com/cNidR8fPO5HS3mW6lB8IU00",
    ctaLabel: "Book Remote Implementation"
  }
} as const;

export const allowedExternalAuthTargets = [
  pricingConfig.remoteImplementation.stripeUrl,
  pricingConfig.tokens.ezRouterUrl
] as const;

export function isAllowedExternalAuthTarget(value: string | null | undefined): value is (typeof allowedExternalAuthTargets)[number] {
  return !!value && (allowedExternalAuthTargets as readonly string[]).includes(value);
}
