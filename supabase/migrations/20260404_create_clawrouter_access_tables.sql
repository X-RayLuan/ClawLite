create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  plan text not null default 'free',
  billing_status text not null default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  secret_hash text not null,
  status text not null default 'active',
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists idx_api_keys_account_id on public.api_keys(account_id);
create index if not exists idx_api_keys_key_prefix on public.api_keys(key_prefix);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  product text not null default 'clawrouter',
  plan text not null,
  status text not null,
  monthly_request_limit integer,
  monthly_token_limit bigint,
  rpm_limit integer,
  model_allowlist jsonb not null default '[]'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_entitlements_account_id on public.entitlements(account_id);

create table if not exists public.provider_bindings (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  provider text not null default 'arc',
  credential_ref text not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_provider_bindings_account_id on public.provider_bindings(account_id);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  api_key_id uuid references public.api_keys(id) on delete set null,
  provider_binding_id uuid references public.provider_bindings(id) on delete set null,
  request_id text not null,
  model text not null,
  tokens_in bigint not null default 0,
  tokens_out bigint not null default 0,
  cost_estimate numeric(18,8),
  status text not null,
  error_code text,
  created_at timestamptz not null default now()
);
create index if not exists idx_usage_events_account_id on public.usage_events(account_id);
create index if not exists idx_usage_events_created_at on public.usage_events(created_at desc);

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  product text not null default 'clawrouter',
  status text not null default 'created',
  provider text not null default 'arc',
  checkout_url text,
  external_session_id text,
  installer_setup_token text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_checkout_sessions_account_id on public.checkout_sessions(account_id);
create index if not exists idx_checkout_sessions_setup_token on public.checkout_sessions(installer_setup_token);

create table if not exists public.setup_tokens (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  token_hash text not null,
  status text not null default 'active',
  expires_at timestamptz not null,
  installer_instance_id text,
  platform text,
  app_version text,
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);
create index if not exists idx_setup_tokens_account_id on public.setup_tokens(account_id);

alter table public.accounts enable row level security;
alter table public.api_keys enable row level security;
alter table public.entitlements enable row level security;
alter table public.provider_bindings enable row level security;
alter table public.usage_events enable row level security;
alter table public.checkout_sessions enable row level security;
alter table public.setup_tokens enable row level security;

revoke all on table public.accounts from anon, authenticated;
revoke all on table public.api_keys from anon, authenticated;
revoke all on table public.entitlements from anon, authenticated;
revoke all on table public.provider_bindings from anon, authenticated;
revoke all on table public.usage_events from anon, authenticated;
revoke all on table public.checkout_sessions from anon, authenticated;
revoke all on table public.setup_tokens from anon, authenticated;
