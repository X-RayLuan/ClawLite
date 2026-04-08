type MinimalSupabaseClient = {
  from: (table: string) => any;
};

type ReconcileTopupsInput = {
  supabase: MinimalSupabaseClient;
  accountId: string;
  email?: string | null;
};

type ReconcileInventoryInput = {
  supabase: MinimalSupabaseClient;
  accountId: string;
};

export function shouldForceClawRouterAccountReconcile(searchParams: URLSearchParams) {
  return searchParams.get('refreshBilling') === '1' || searchParams.get('topup') === 'success';
}

export async function maybeReconcileClawRouterAccount(input: {
  shouldReconcile: boolean;
  supabase: MinimalSupabaseClient;
  accountId: string;
  email?: string | null;
  reconcileTopups: (input: ReconcileTopupsInput) => Promise<unknown>;
  reconcileInventoryAccess: (input: ReconcileInventoryInput) => Promise<unknown>;
}) {
  if (!input.shouldReconcile) return;

  await input.reconcileTopups({
    supabase: input.supabase,
    accountId: input.accountId,
    email: input.email,
  });

  await input.reconcileInventoryAccess({
    supabase: input.supabase,
    accountId: input.accountId,
  });
}
