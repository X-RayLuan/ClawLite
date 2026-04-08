export function collectReconciledInventoryAccessSessionIds(results) {
  if (!Array.isArray(results)) return [];

  return results
    .filter((result) => !result?.alreadySettled && result?.metadata?.kind === 'clawrouter_access')
    .map((result) => result.id)
    .filter(Boolean);
}
