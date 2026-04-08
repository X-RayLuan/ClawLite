export function selectVisibleInventoryKeys(keys) {
  if (!Array.isArray(keys)) return [];
  return keys.filter((key) => key?.deliveryMode === "inventory_key" && key?.status === "active");
}

export function mapAssignedInventoryKeys(keys) {
  if (!Array.isArray(keys)) return [];
  return keys
    .filter((key) => key?.status === "assigned" && key?.assignedAccountId)
    .map((key) => ({
      id: key.id,
      deliveryMode: "inventory_key",
      displayName: key.name || "Inventory Key",
      provider: key.provider || "ezrouter",
      plaintextKey: key.plaintextKey || null,
      keyPrefix: key.keyPrefix || null,
      faceValueUsd: key.faceValueUsd ?? null,
      salePriceUsd: key.salePriceUsd ?? null,
      status: "active",
      createdAt: key.assignedAt || null,
    }));
}
