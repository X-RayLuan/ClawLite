type MinimalSupabaseClient = {
  from: (table: string) => any;
};

type ReconcileTopupsInput = {
  supabase: MinimalSupabaseClient;
  accountId: string;
  email?: string | null;
};

type ReconcileTopupsResult = {
  reconciled?: number;
  reconciledInventoryAccessSessionIds?: string[];
};

type ReconcileInventoryInput = {
  supabase: MinimalSupabaseClient;
  accountId: string;
  stripeSessionIds?: string[];
};

export function shouldForceClawRouterAccountReconcile(searchParams: URLSearchParams) {
  return searchParams.get('refreshBilling') === '1' || searchParams.get('topup') === 'success';
}

export async function maybeReconcileClawRouterAccount(input: {
  shouldReconcile: boolean;
  supabase: MinimalSupabaseClient;
  accountId: string;
  email?: string | null;
  reconcileTopups: (input: ReconcileTopupsInput) => Promise<ReconcileTopupsResult>;
  reconcileInventoryAccess: (input: ReconcileInventoryInput) => Promise<unknown>;
}) {
  if (!input.shouldReconcile) return;

  const topupResult = await input.reconcileTopups({
    supabase: input.supabase,
    accountId: input.accountId,
    email: input.email,
  });

  await input.reconcileInventoryAccess({
    supabase: input.supabase,
    accountId: input.accountId,
    stripeSessionIds: topupResult?.reconciledInventoryAccessSessionIds || [],
  });
}
