import test from 'node:test';
import assert from 'node:assert/strict';
import {
  maybeReconcileClawRouterAccount,
  shouldForceClawRouterAccountReconcile,
} from './clawrouter-account-reconcile.ts';

test('shouldForceClawRouterAccountReconcile returns true for Stripe success return', () => {
  const searchParams = new URLSearchParams('topup=success');

  assert.equal(shouldForceClawRouterAccountReconcile(searchParams), true);
});

test('maybeReconcileClawRouterAccount runs both reconcile passes when forced', async () => {
  const calls = [];
  const supabase = { from() {} };

  await maybeReconcileClawRouterAccount({
    shouldReconcile: true,
    supabase,
    accountId: 'acct_123',
    email: 'user@example.com',
    reconcileTopups: async (input) => {
      calls.push(['topups', input]);
      return {
        reconciled: 1,
        reconciledInventoryAccessSessionIds: ['cs_new_access'],
      };
    },
    reconcileInventoryAccess: async (input) => {
      calls.push(['inventory', input]);
    },
  });

  assert.deepEqual(calls, [
    [
      'topups',
      {
        supabase,
        accountId: 'acct_123',
        email: 'user@example.com',
      },
    ],
    [
      'inventory',
      {
        supabase,
        accountId: 'acct_123',
        stripeSessionIds: ['cs_new_access'],
      },
    ],
  ]);
});

test('maybeReconcileClawRouterAccount skips reconcile when not forced', async () => {
  let called = false;
  const supabase = { from() {} };

  await maybeReconcileClawRouterAccount({
    shouldReconcile: false,
    supabase,
    accountId: 'acct_123',
    email: 'user@example.com',
    reconcileTopups: async () => {
      called = true;
    },
    reconcileInventoryAccess: async () => {
      called = true;
    },
  });

  assert.equal(called, false);
});
