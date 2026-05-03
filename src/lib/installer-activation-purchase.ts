export function buildInstallerStripeSecret(secretKey?: string | null) {
  const secret = secretKey?.trim();

  if (!secret) {
    throw new Error("missing_stripe_secret_key");
  }

  return secret;
}

export function buildInstallerStripeCheckoutConfig(input: {
  secretKey?: string | null;
  priceId?: string | null;
}) {
  const secretKey = buildInstallerStripeSecret(input.secretKey);
  const priceId = input.priceId?.trim();

  if (!priceId) {
    throw new Error("missing_stripe_clawrouter_price_id");
  }

  return { secretKey, priceId };
}
