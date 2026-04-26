import crypto from "node:crypto";

export type CheckoutSessionRow = {
  id: string;
  account_id: string;
  status: string;
  checkout_url?: string | null;
  installer_setup_token?: string | null;
  provider?: string | null;
  external_session_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type EntitlementRow = {
  id: string;
  account_id: string;
  product: string;
  plan: string;
  status: string;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type MinimalSupabaseClient = {
  from: (table: string) => any;
};

type PurchaseState = "not_started" | "checkout_pending" | "completed" | "failed";

export type CheckoutSessionView = {
  id: string;
  accountId: string;
  status: string;
  purchaseState: PurchaseState;
  checkoutUrl: string;
  installerSetupToken: string | null;
  provider: string | null;
  externalSessionId: string | null;
  source: "web" | "installer" | null;
  entrypoint: string | null;
  metadata: Record<string, unknown>;
  createdAt: string | null;
  updatedAt: string | null;
};

export type EntitlementView = {
  id: string;
  accountId: string;
  product: string;
  plan: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type InstallerActivationState = {
  setupToken: string;
  activationUnlocked: boolean;
  account: {
    accountId: string | null;
    email: string | null;
  };
  entitlement: {
    status: "active" | "inactive";
    plan: string | null;
    product: string | null;
    startsAt: string | null;
    endsAt: string | null;
  };
  latestCheckoutSession: CheckoutSessionView | null;
  allowedPaths: Array<"connect_now" | "buy_and_connect" | "use_own_key">;
  recommendedPath: "connect_now" | "buy_and_connect";
};

export type InstallerProvisioningView = {
  setupToken: string;
  provisioningState: "blocked" | "provisioned";
  accountId: string | null;
  checkoutSessionId: string | null;
  provider: "clawrouter";
  model: "clawrouter/auto";
  bindingId: string | null;
  credentialRef: string | null;
  entitlement: InstallerActivationState["entitlement"];
  persisted: boolean;
  stubbed: false;
  note: string;
};

export type InstallerConfigInjectionView = {
  setupToken: string;
  configInjectionState: "blocked" | "written";
  configTarget: string | null;
  provider: "clawrouter";
  model: "clawrouter/auto";
  credentialRef: string | null;
  accountId: string | null;
  checkoutSessionId: string | null;
  patchPreview: {
    provider: "clawrouter";
    credentialRef: string | null;
    model: "clawrouter/auto";
    accountId: string | null;
  };
  configPatch: Record<string, unknown> | null;
  persisted: boolean;
  stubbed: false;
  note: string;
};

export type SettleCheckoutSessionInput = {
  supabase: MinimalSupabaseClient;
  sessionId?: string | null;
  status: "pending" | "completed" | "failed" | "expired";
  provider?: string | null;
  externalSessionId?: string | null;
  settlement?: Record<string, unknown> | null;
};

export type ProvisionInstallerActivationInput = {
  supabase: MinimalSupabaseClient;
  setupToken?: string | null;
  installerInstanceId?: string | null;
  platform?: string | null;
  appVersion?: string | null;
};

export type InjectInstallerConfigInput = ProvisionInstallerActivationInput & {
  targetConfigPath?: string | null;
};

const CHECKOUT_SESSION_COLUMNS =
  "id, account_id, status, checkout_url, installer_setup_token, provider, external_session_id, metadata, created_at, updated_at";
const ENTITLEMENT_COLUMNS =
  "id, account_id, product, plan, status, starts_at, ends_at, created_at, updated_at";

export type CreateCheckoutSessionInput = {
  supabase: MinimalSupabaseClient;
  accountId?: string | null;
  email?: string | null;
  installerSetupToken?: string | null;
  provider?: string | null;
  source: "web" | "installer";
  metadata?: Record<string, unknown>;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeAccountId(accountId?: string | null) {
  if (!accountId) {
    return crypto.randomUUID();
  }

  if (UUID_RE.test(accountId)) {
    return accountId;
  }

  throw new Error("invalid_account_id");
}

function checkoutUrlForSession(sessionId: string) {
  return `/clawrouter/checkout?session=${encodeURIComponent(sessionId)}`;
}

function mapCheckoutStatus(status?: string | null): PurchaseState {
  if (status === "completed") return "completed";
  if (status === "failed" || status === "expired") return "failed";
  if (status === "created" || status === "pending") return "checkout_pending";
  return "not_started";
}

export function toCheckoutSessionView(row: CheckoutSessionRow): CheckoutSessionView {
  const metadata = row.metadata || {};
  const source =
    metadata.source === "web" || metadata.source === "installer" ? metadata.source : null;
  const entrypoint = typeof metadata.entrypoint === "string" ? metadata.entrypoint : null;

  return {
    id: row.id,
    accountId: row.account_id,
    status: row.status,
    purchaseState: mapCheckoutStatus(row.status),
    checkoutUrl: row.checkout_url || checkoutUrlForSession(row.id),
    installerSetupToken: row.installer_setup_token || null,
    provider: row.provider || null,
    externalSessionId: row.external_session_id || null,
    source,
    entrypoint,
    metadata,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

export function toEntitlementView(row: EntitlementRow): EntitlementView {
  return {
    id: row.id,
    accountId: row.account_id,
    product: row.product,
    plan: row.plan,
    status: row.status,
    startsAt: row.starts_at || null,
    endsAt: row.ends_at || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

export async function createCheckoutSessionRecord(input: CreateCheckoutSessionInput) {
  // Resolve accountId: use provided UUID, or look up existing account by email, or generate new
  let accountId: string;
  if (input.accountId) {
    accountId = normalizeAccountId(input.accountId);
  } else if (input.email) {
    // Try to find an existing account by email so we link to the user's existing account
    // rather than creating a duplicate with a fresh UUID
    const existing = await input.supabase
      .from("accounts")
      .select("id")
      .eq("email", input.email)
      .maybeSingle();
    accountId = existing?.data?.id || normalizeAccountId(undefined);
  } else {
    accountId = normalizeAccountId(undefined);
  }

  const sessionId = crypto.randomUUID();
  const checkoutUrl = checkoutUrlForSession(sessionId);
  const accountUpsert = await input.supabase.from("accounts").upsert?.(
    {
      id: accountId,
      user_id: accountId,
      email: input.email || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (accountUpsert?.error) {
    throw new Error(accountUpsert.error.message || "failed_to_upsert_checkout_account");
  }

  const checkoutInsert = await input.supabase.from("checkout_sessions").insert({
    id: sessionId,
    account_id: accountId,
    product: "clawrouter",
    status: "created",
    provider: input.provider || "arc",
    checkout_url: checkoutUrl,
    installer_setup_token: input.installerSetupToken || null,
    metadata: {
      source: input.source,
      ...(input.metadata || {}),
    },
  }).select().single();

  if (!checkoutInsert || checkoutInsert.error || !checkoutInsert.data) {
    throw new Error(checkoutInsert?.error?.message || "failed_to_create_checkout_session");
  }

  return toCheckoutSessionView(checkoutInsert.data);
}

export async function getCheckoutSessionRecord(supabase: MinimalSupabaseClient, sessionId?: string | null) {
  if (!sessionId) {
    return null;
  }

  const response = await supabase
    .from("checkout_sessions")
    .select(CHECKOUT_SESSION_COLUMNS)
    .eq("id", sessionId)
    .maybeSingle();

  if (response.error && response.error.code !== "PGRST116") {
    throw new Error(response.error.message || "failed_to_load_checkout_session");
  }

  if (!response.data) {
    return null;
  }

  return toCheckoutSessionView(response.data);
}

export async function getLatestCheckoutSessionForSetupToken(
  supabase: MinimalSupabaseClient,
  setupToken?: string | null,
) {
  if (!setupToken) {
    return null;
  }

  const response = await supabase
    .from("checkout_sessions")
    .select(CHECKOUT_SESSION_COLUMNS)
    .eq("installer_setup_token", setupToken)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (response.error && response.error.code !== "PGRST116") {
    throw new Error(response.error.message || "failed_to_load_setup_checkout_session");
  }

  if (!response.data) {
    return null;
  }

  return toCheckoutSessionView(response.data);
}

export async function getActiveEntitlementForAccount(
  supabase: MinimalSupabaseClient,
  accountId?: string | null,
) {
  if (!accountId) {
    return null;
  }

  const response = await supabase
    .from("entitlements")
    .select(ENTITLEMENT_COLUMNS)
    .eq("account_id", accountId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (response.error && response.error.code !== "PGRST116") {
    throw new Error(response.error.message || "failed_to_load_active_entitlement");
  }

  if (!response.data) {
    return null;
  }

  return toEntitlementView(response.data);
}

async function upsertActiveEntitlementForCheckout(
  supabase: MinimalSupabaseClient,
  session: CheckoutSessionView,
) {
  const now = new Date().toISOString();
  const response = await supabase
    .from("entitlements")
    .upsert(
      {
        account_id: session.accountId,
        product: "clawrouter",
        plan: "clawrouter",
        status: "active",
        starts_at: now,
        ends_at: null,
        updated_at: now,
      },
      { onConflict: "account_id,product" },
    )
    .select(ENTITLEMENT_COLUMNS)
    .single();

  if (!response || response.error || !response.data) {
    throw new Error(response?.error?.message || "failed_to_upsert_entitlement");
  }

  return toEntitlementView(response.data);
}

async function getAccountSummary(supabase: MinimalSupabaseClient, accountId?: string | null) {
  if (!accountId) {
    return { accountId: null, email: null };
  }

  const response = await supabase
    .from("accounts")
    .select("id, email")
    .eq("id", accountId)
    .maybeSingle();

  if (response.error && response.error.code !== "PGRST116") {
    throw new Error(response.error.message || "failed_to_load_activation_account");
  }

  return {
    accountId,
    email: response.data?.email || null,
  };
}

function makeInstallerBindingId(accountId?: string | null) {
  return accountId ? `clawrouter-account:${accountId}` : null;
}

function makeInstallerCredentialRef(accountId?: string | null) {
  return accountId ? `account:${accountId}` : null;
}

async function syncAccountProvisioningState(
  supabase: MinimalSupabaseClient,
  accountId?: string | null,
) {
  if (!accountId) {
    return;
  }

  const response = await supabase.from("accounts").update({
    plan: "clawrouter",
    billing_status: "active",
    updated_at: new Date().toISOString(),
  }).eq("id", accountId);

  if (response?.error) {
    throw new Error(response.error.message || "failed_to_sync_account_provisioning_state");
  }
}

async function updateCheckoutSessionMetadata(
  supabase: MinimalSupabaseClient,
  session: CheckoutSessionView,
  metadataPatch: Record<string, unknown>,
) {
  const nextMetadata = {
    ...(session.metadata || {}),
    ...metadataPatch,
  };

  const response = await supabase
    .from("checkout_sessions")
    .update({
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.id)
    .select(CHECKOUT_SESSION_COLUMNS)
    .single();

  if (!response || response.error || !response.data) {
    throw new Error(response?.error?.message || "failed_to_update_checkout_session_metadata");
  }

  return toCheckoutSessionView(response.data);
}

export async function resolveInstallerActivationState(
  supabase: MinimalSupabaseClient,
  setupToken?: string | null,
  accountIdOverride?: string | null,
): Promise<InstallerActivationState> {
  const resolvedSetupToken = setupToken || "";
  const latestCheckoutSession = await getLatestCheckoutSessionForSetupToken(supabase, resolvedSetupToken);
  // Use the override accountId if provided (e.g., from an email lookup in bootstrap),
  // otherwise fall back to the accountId from the latest checkout session
  const account = await getAccountSummary(supabase, accountIdOverride ?? latestCheckoutSession?.accountId ?? null);
  const entitlement = await getActiveEntitlementForAccount(supabase, account.accountId);
  const activationUnlocked = Boolean(entitlement);

  return {
    setupToken: resolvedSetupToken,
    activationUnlocked,
    account,
    entitlement: {
      status: activationUnlocked ? "active" : "inactive",
      plan: entitlement?.plan || null,
      product: entitlement?.product || null,
      startsAt: entitlement?.startsAt || null,
      endsAt: entitlement?.endsAt || null,
    },
    latestCheckoutSession,
    allowedPaths: activationUnlocked
      ? ["connect_now", "use_own_key"]
      : ["buy_and_connect", "use_own_key"],
    recommendedPath: activationUnlocked ? "connect_now" : "buy_and_connect",
  };
}

export async function provisionInstallerActivation(
  input: ProvisionInstallerActivationInput,
): Promise<InstallerProvisioningView> {
  const activation = await resolveInstallerActivationState(input.supabase, input.setupToken);

  if (!activation.activationUnlocked || !activation.latestCheckoutSession || !activation.account.accountId) {
    return {
      setupToken: activation.setupToken,
      provisioningState: "blocked",
      accountId: activation.account.accountId,
      checkoutSessionId: activation.latestCheckoutSession?.id || null,
      provider: "clawrouter",
      model: "clawrouter/auto",
      bindingId: null,
      credentialRef: null,
      entitlement: activation.entitlement,
      persisted: false,
      stubbed: false,
      note: "Active entitlement required before installer provisioning can continue.",
    };
  }

  await syncAccountProvisioningState(input.supabase, activation.account.accountId);

  const provisionedSession = await updateCheckoutSessionMetadata(
    input.supabase,
    activation.latestCheckoutSession,
    {
      provisioning: {
        state: "provisioned",
        provider: "clawrouter",
        model: "clawrouter/auto",
        installer_instance_id: input.installerInstanceId || null,
        platform: input.platform || null,
        app_version: input.appVersion || null,
        provisioned_at: new Date().toISOString(),
      },
    },
  );

  return {
    setupToken: activation.setupToken,
    provisioningState: "provisioned",
    accountId: activation.account.accountId,
    checkoutSessionId: provisionedSession.id,
    provider: "clawrouter",
    model: "clawrouter/auto",
    bindingId: makeInstallerBindingId(activation.account.accountId),
    credentialRef: makeInstallerCredentialRef(activation.account.accountId),
    entitlement: activation.entitlement,
    persisted: true,
    stubbed: false,
    note: "Installer provisioning is unlocked and writeback is persisted on the checkout session.",
  };
}

export async function injectInstallerConfig(
  input: InjectInstallerConfigInput,
): Promise<InstallerConfigInjectionView> {
  const provisioning = await provisionInstallerActivation(input);

  if (provisioning.provisioningState !== "provisioned" || !provisioning.accountId || !provisioning.checkoutSessionId) {
    return {
      setupToken: provisioning.setupToken,
      configInjectionState: "blocked",
      configTarget: input.targetConfigPath || null,
      provider: "clawrouter",
      model: "clawrouter/auto",
      credentialRef: null,
      accountId: provisioning.accountId,
      checkoutSessionId: provisioning.checkoutSessionId,
      patchPreview: {
        provider: "clawrouter",
        credentialRef: null,
        model: "clawrouter/auto",
        accountId: provisioning.accountId,
      },
      configPatch: null,
      persisted: false,
      stubbed: false,
      note: "Active entitlement required before config injection can continue.",
    };
  }

  const latestSession = await getCheckoutSessionRecord(input.supabase, provisioning.checkoutSessionId);

  if (!latestSession) {
    throw new Error("missing_checkout_session_after_provisioning");
  }

  await updateCheckoutSessionMetadata(input.supabase, latestSession, {
    config_injection: {
      state: "written",
      target_config_path: input.targetConfigPath || null,
      written_at: new Date().toISOString(),
    },
  });

  const configPatch = {
    provider: "clawrouter",
    model: "clawrouter/auto",
    credentialRef: provisioning.credentialRef,
    accountId: provisioning.accountId,
    setupToken: provisioning.setupToken,
    checkoutSessionId: provisioning.checkoutSessionId,
  };

  return {
    setupToken: provisioning.setupToken,
    configInjectionState: "written",
    configTarget: input.targetConfigPath || null,
    provider: "clawrouter",
    model: "clawrouter/auto",
    credentialRef: provisioning.credentialRef,
    accountId: provisioning.accountId,
    checkoutSessionId: provisioning.checkoutSessionId,
    patchPreview: {
      provider: "clawrouter",
      credentialRef: provisioning.credentialRef,
      model: "clawrouter/auto",
      accountId: provisioning.accountId,
    },
    configPatch,
    persisted: true,
    stubbed: false,
    note: "Installer config payload is ready and the writeback is persisted on the checkout session.",
  };
}

export async function markCheckoutSessionPending(input: {
  supabase: MinimalSupabaseClient;
  sessionId?: string | null;
  provider?: string | null;
  externalSessionId?: string | null;
  checkoutUrl?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  if (!input.sessionId) {
    throw new Error("missing_checkout_session_id");
  }

  const existingSession = await getCheckoutSessionRecord(input.supabase, input.sessionId);
  const nextMetadata = {
    ...(existingSession?.metadata || {}),
    ...(input.metadata || {}),
  };

  const response = await input.supabase
    .from("checkout_sessions")
    .update({
      status: "pending",
      provider: input.provider || existingSession?.provider || "stripe",
      external_session_id: input.externalSessionId || null,
      checkout_url: input.checkoutUrl || existingSession?.checkoutUrl || null,
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .select(CHECKOUT_SESSION_COLUMNS)
    .single();

  if (!response || response.error || !response.data) {
    throw new Error(response?.error?.message || "failed_to_mark_checkout_session_pending");
  }

  return toCheckoutSessionView(response.data);
}

export async function settleCheckoutSessionRecord(input: SettleCheckoutSessionInput) {
  if (!input.sessionId) {
    throw new Error("missing_checkout_session_id");
  }

  const existingSession = await getCheckoutSessionRecord(input.supabase, input.sessionId);
  const nextMetadata = {
    ...(existingSession?.metadata || {}),
    ...(input.settlement ? { settlement: input.settlement } : {}),
  };
  const response = await input.supabase
    .from("checkout_sessions")
    .update({
      status: input.status,
      provider: input.provider || "arc",
      external_session_id: input.externalSessionId || null,
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .select(CHECKOUT_SESSION_COLUMNS)
    .single();

  if (!response || response.error || !response.data) {
    throw new Error(response?.error?.message || "failed_to_settle_checkout_session");
  }

  const settledSession = toCheckoutSessionView(response.data);

  if (settledSession.status === "completed") {
    await upsertActiveEntitlementForCheckout(input.supabase, settledSession);
  }

  return settledSession;
}
