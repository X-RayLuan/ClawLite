import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRootAuthCallbackRedirect } from './root-auth-callback.js';

test('forwards code callbacks on the home page to auth/callback with downloads returnTo', () => {
  const redirect = buildRootAuthCallbackRedirect('https://clawlite.ai/?code=abc');

  assert.equal(redirect, '/auth/callback?code=abc&returnTo=%2Fdownloads');
});

test('preserves a safe returnTo already present in the URL', () => {
  const redirect = buildRootAuthCallbackRedirect('https://clawlite.ai/?code=abc&returnTo=%2Fclawrouter%2Fdashboard');

  assert.equal(redirect, '/auth/callback?code=abc&returnTo=%2Fclawrouter%2Fdashboard');
});

test('forwards hash-token callbacks on the home page', () => {
  const redirect = buildRootAuthCallbackRedirect('https://clawlite.ai/#access_token=at&refresh_token=rt&type=magiclink');

  assert.equal(redirect, '/auth/callback?returnTo=%2Fdownloads#access_token=at&refresh_token=rt&type=magiclink');
});

test('ignores non-auth home URLs', () => {
  assert.equal(buildRootAuthCallbackRedirect('https://clawlite.ai/'), null);
  assert.equal(buildRootAuthCallbackRedirect('https://clawlite.ai/?foo=bar'), null);
});

test('ignores auth payloads on non-home paths', () => {
  assert.equal(buildRootAuthCallbackRedirect('https://clawlite.ai/downloads?code=abc'), null);
});
