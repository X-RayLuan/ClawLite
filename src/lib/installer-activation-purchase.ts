export function buildInstallerStripeCheckoutConfig(input: {
  secretKey?: string | null;
  priceId?: string | null;
}) {
  const secretKey = input.secretKey?.trim();
  const priceId = input.priceId?.trim();

  if (!secretKey) {
    throw new Error("missing_stripe_secret_key");
  }

  if (!priceId) {
    throw new Error("missing_stripe_clawrouter_price_id");
  }

  return { secretKey, priceId };
}
