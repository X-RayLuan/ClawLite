import test from 'node:test';
import assert from 'node:assert/strict';

import { consumePendingPostLoginReturnTo } from './post-login-return.js';

test('does not consume a stale pending returnTo on the home page without auth payload', () => {
  const pending = consumePendingPostLoginReturnTo(
    'https://clawlite.ai/',
    '/clawrouter/dashboard'
  );

  assert.equal(pending, null);
});

test('consumes a safe pending returnTo only for root auth callback payloads', () => {
  const pending = consumePendingPostLoginReturnTo(
    'https://clawlite.ai/?code=abc',
    '/downloads'
  );

  assert.equal(pending, '/downloads');
});

test('ignores unsafe pending returnTo values', () => {
  const pending = consumePendingPostLoginReturnTo(
    'https://clawlite.ai/?code=abc',
    'https://evil.example'
  );

  assert.equal(pending, null);
});
