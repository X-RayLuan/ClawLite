import test from 'node:test';
import assert from 'node:assert/strict';

import { buildInstallerStripeCheckoutConfig } from './installer-activation-purchase.ts';

test('buildInstallerStripeCheckoutConfig trims Stripe env values', () => {
  const config = buildInstallerStripeCheckoutConfig({
    secretKey: ' sk_test_installer \n',
    priceId: ' price_installer \n',
  });

  assert.deepEqual(config, {
    secretKey: 'sk_test_installer',
    priceId: 'price_installer',
  });
});

test('buildInstallerStripeCheckoutConfig rejects missing Stripe config instead of falling back', () => {
  assert.throws(
    () => buildInstallerStripeCheckoutConfig({ secretKey: 'sk_test_installer', priceId: ' \n' }),
    /missing_stripe_clawrouter_price_id/,
  );
});
