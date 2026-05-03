export function selectVisibleInventoryKeys(keys) {
  if (!Array.isArray(keys)) return [];
  return keys.filter((key) => key?.deliveryMode === "inventory_key" && key?.status === "active");
}

export function mapAssignedInventoryKeys(keys) {
  if (!Array.isArray(keys)) return [];
  return keys
    .filter((key) => key?.status === "assigned" && (key?.assignedAccountId || key?.assigned_account_id))
    .map((key) => ({
      id: key.id,
      deliveryMode: "inventory_key",
      displayName: key.name || "Inventory Key",
      provider: key.provider || "ezrouter",
      plaintextKey: key.plaintextKey || key.plaintext_key || null,
      keyPrefix: key.keyPrefix || key.key_prefix || null,
      faceValueUsd: key.faceValueUsd ?? key.face_value_usd ?? null,
      salePriceUsd: key.salePriceUsd ?? key.sale_price_usd ?? null,
      status: "active",
      createdAt: key.assignedAt || key.assigned_at || null,
    }));
}
