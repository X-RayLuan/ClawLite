/**
 * @param {any} existingDelivery
 * @param {any} inventoryKey
 * @param {string | null | undefined} stripeSessionId
 */
export function reactivateInventoryDelivery(existingDelivery, inventoryKey, stripeSessionId = null) {
  return {
    ...existingDelivery,
    display_name: inventoryKey.name,
    provider: inventoryKey.provider,
    plaintext_key: inventoryKey.plaintext_key,
    key_prefix: inventoryKey.plaintext_key ? inventoryKey.plaintext_key.slice(0, 16) : null,
    face_value_usd: inventoryKey.face_value_usd,
    sale_price_usd: inventoryKey.sale_price_usd,
    status: 'active',
    metadata: {
      ...(existingDelivery.metadata || {}),
      stripe_session_id: stripeSessionId,
    },
  };
}
