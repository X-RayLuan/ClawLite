import test from 'node:test';
import assert from 'node:assert/strict';
import { mapAssignedInventoryKeys, selectVisibleInventoryKeys } from './clawrouter-dashboard.js';

test('selectVisibleInventoryKeys returns only active inventory keys', () => {
  const keys = [
    { id: '1', deliveryMode: 'inventory_key', status: 'active' },
    { id: '2', deliveryMode: 'inventory_key', status: 'inactive' },
    { id: '3', deliveryMode: 'managed_key', status: 'active' },
  ];

  const visible = selectVisibleInventoryKeys(keys);

  assert.deepEqual(visible.map((k) => k.id), ['1']);
});

test('mapAssignedInventoryKeys returns only current assigned inventory keys', () => {
  const keys = [
    { id: '1', name: 'Key A', provider: 'ezrouter', plaintextKey: 'or_live_a', keyPrefix: 'or_live_a', status: 'assigned', assignedAccountId: 'acct_1', assignedAt: '2026-04-08T00:00:00.000Z' },
    { id: '2', name: 'Key B', provider: 'ezrouter', plaintextKey: 'or_live_b', keyPrefix: 'or_live_b', status: 'available', assignedAccountId: null, assignedAt: null },
    { id: '3', name: 'Key C', provider: 'ezrouter', plaintextKey: 'or_live_c', keyPrefix: 'or_live_c', status: 'assigned', assignedAccountId: null, assignedAt: '2026-04-08T00:00:00.000Z' },
  ];

  const visible = mapAssignedInventoryKeys(keys);

  assert.deepEqual(visible, [
    {
      id: '1',
      deliveryMode: 'inventory_key',
      displayName: 'Key A',
      provider: 'ezrouter',
      plaintextKey: 'or_live_a',
      keyPrefix: 'or_live_a',
      faceValueUsd: null,
      salePriceUsd: null,
      status: 'active',
      createdAt: '2026-04-08T00:00:00.000Z',
    },
  ]);
});
