import test from 'node:test';
import assert from 'node:assert/strict';

import { reactivateInventoryDelivery } from './clawrouter-delivery-reuse.js';

test('reactivateInventoryDelivery reuses a revoked delivery for the same inventory key', () => {
  const delivery = {
    id: 'delivery-1',
    account_id: 'acct-1',
    delivery_mode: 'inventory_key',
    source_type: 'inventory_key',
    source_id: 'inv-1',
    display_name: 'ClawLite-1',
    provider: 'ezrouter',
    plaintext_key: 'or_old_key',
    key_prefix: 'or_old_key',
    status: 'revoked',
    metadata: {},
    created_at: '2026-04-07T00:00:00.000Z',
  };
  const inventoryKey = {
    id: 'inv-1',
    provider: 'ezrouter',
    name: 'ClawLite-1',
    plaintext_key: 'or_live_new_key',
    face_value_usd: 10,
    sale_price_usd: 5,
  };

  const reused = reactivateInventoryDelivery(delivery, inventoryKey);

  assert.equal(reused.id, 'delivery-1');
  assert.equal(reused.status, 'active');
  assert.equal(reused.plaintext_key, 'or_live_new_key');
  assert.equal(reused.key_prefix, 'or_live_new_key'.slice(0, 16));
  assert.equal(reused.display_name, 'ClawLite-1');
  assert.equal(reused.provider, 'ezrouter');
});
