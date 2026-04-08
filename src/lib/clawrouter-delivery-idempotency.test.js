import test from 'node:test';
import assert from 'node:assert/strict';

import { selectReusableInventoryAssignment } from './clawrouter-delivery-idempotency.js';

test('selectReusableInventoryAssignment prefers an existing active inventory delivery', () => {
  const result = selectReusableInventoryAssignment({
    activeDelivery: {
      id: 'delivery-1',
      source_id: 'inv-1',
      status: 'active',
      plaintext_key: 'or_active_key',
    },
    assignedInventory: null,
    assignedInventoryDelivery: null,
  });

  assert.equal(result.kind, 'active_delivery');
  assert.equal(result.delivery?.id, 'delivery-1');
});

test('selectReusableInventoryAssignment reuses assigned inventory with a revoked delivery', () => {
  const result = selectReusableInventoryAssignment({
    activeDelivery: null,
    assignedInventory: {
      id: 'inv-2',
      name: 'ClawLite-2',
      provider: 'ezrouter',
      plaintext_key: 'or_reused_key',
      face_value_usd: 10,
      sale_price_usd: 5,
      status: 'assigned',
    },
    assignedInventoryDelivery: {
      id: 'delivery-2',
      source_id: 'inv-2',
      status: 'revoked',
      metadata: {},
    },
  });

  assert.equal(result.kind, 'assigned_inventory');
  assert.equal(result.inventory?.id, 'inv-2');
  assert.equal(result.delivery?.id, 'delivery-2');
});

test('selectReusableInventoryAssignment reuses assigned inventory even when delivery is not created yet', () => {
  const result = selectReusableInventoryAssignment({
    activeDelivery: null,
    assignedInventory: {
      id: 'inv-3',
      name: 'ClawLite-3',
      provider: 'ezrouter',
      plaintext_key: 'or_pending_delivery',
      face_value_usd: 10,
      sale_price_usd: 5,
      status: 'assigned',
    },
    assignedInventoryDelivery: null,
  });

  assert.equal(result.kind, 'assigned_inventory');
  assert.equal(result.inventory?.id, 'inv-3');
  assert.equal(result.delivery, null);
});

test('selectReusableInventoryAssignment returns none when account has no reusable inventory state', () => {
  const result = selectReusableInventoryAssignment({
    activeDelivery: null,
    assignedInventory: null,
    assignedInventoryDelivery: null,
  });

  assert.equal(result.kind, 'none');
});
