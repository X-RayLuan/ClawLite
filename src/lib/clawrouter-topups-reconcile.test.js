import test from 'node:test';
import assert from 'node:assert/strict';

import { collectReconciledInventoryAccessSessionIds } from './clawrouter-topups-reconcile.js';

test('collectReconciledInventoryAccessSessionIds returns only newly settled clawrouter_access sessions', () => {
  const sessions = [
    {
      id: 'cs_old_access',
      metadata: { kind: 'clawrouter_access' },
      alreadySettled: true,
    },
    {
      id: 'cs_new_access',
      metadata: { kind: 'clawrouter_access' },
      alreadySettled: false,
    },
    {
      id: 'cs_new_topup',
      metadata: { kind: 'clawrouter_topup' },
      alreadySettled: false,
    },
  ];

  assert.deepEqual(collectReconciledInventoryAccessSessionIds(sessions), ['cs_new_access']);
});
