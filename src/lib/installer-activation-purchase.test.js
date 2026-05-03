import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildInstallerStripeCheckoutConfig,
  buildInstallerStripeSecret,
} from './installer-activation-purchase.ts';

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

test('buildInstallerStripeSecret trims env values for purchase-state reconciliation', () => {
  assert.equal(buildInstallerStripeSecret(' sk_live_installer \n'), 'sk_live_installer');
});

test('buildInstallerStripeSecret rejects missing secret', () => {
  assert.throws(() => buildInstallerStripeSecret(' \n'), /missing_stripe_secret_key/);
});
