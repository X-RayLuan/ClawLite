export function selectReusableInventoryAssignment({
  activeDelivery,
  assignedInventory,
  assignedInventoryDelivery,
}) {
  if (activeDelivery) {
    return {
      kind: 'active_delivery',
      delivery: activeDelivery,
      inventory: null,
    };
  }

  if (assignedInventory) {
    return {
      kind: 'assigned_inventory',
      delivery: assignedInventoryDelivery || null,
      inventory: assignedInventory,
    };
  }

  return {
    kind: 'none',
    delivery: null,
    inventory: null,
  };
}
