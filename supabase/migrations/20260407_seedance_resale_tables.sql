create extension if not exists pgcrypto;

create table if not exists public.seedance_sales_orders (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  sku text not null default 'seedance_starter_1x',
  units integer not null default 1,
  amount_usd numeric(18,2) not null,
  status text not null default 'pending',
  provider_checkout_session_id text,
  provider_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_seedance_sales_orders_account_id on public.seedance_sales_orders(account_id);
create index if not exists idx_seedance_sales_orders_status on public.seedance_sales_orders(status);

create table if not exists public.seedance_licenses (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  order_id uuid not null references public.seedance_sales_orders(id) on delete cascade,
  sku text not null,
  license_hash text not null,
  status text not null default 'active',
  max_uses integer not null default 1,
  remaining_uses integer not null default 1,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_seedance_licenses_hash on public.seedance_licenses(license_hash);
create index if not exists idx_seedance_licenses_account_id on public.seedance_licenses(account_id);
create index if not exists idx_seedance_licenses_status on public.seedance_licenses(status);

create table if not exists public.seedance_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  license_id uuid not null references public.seedance_licenses(id) on delete cascade,
  used_units integer not null default 1,
  task_unit_cost integer,
  status text not null default 'recorded',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_seedance_usage_ledger_account_id on public.seedance_usage_ledger(account_id);
create index if not exists idx_seedance_usage_ledger_license_id on public.seedance_usage_ledger(license_id);

create table if not exists public.seedance_refunds (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  order_id uuid not null references public.seedance_sales_orders(id) on delete cascade,
  reason text,
  amount_usd numeric(18,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_seedance_refunds_order_id on public.seedance_refunds(order_id);
create index if not exists idx_seedance_refunds_status on public.seedance_refunds(status);

create table if not exists public.seedance_rate_limit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.accounts(id) on delete cascade,
  window_start timestamptz not null,
  window_end timestamptz not null,
  used_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_seedance_rate_limit_user_window on public.seedance_rate_limit(user_id, window_start, window_end);

alter table public.seedance_sales_orders enable row level security;
alter table public.seedance_licenses enable row level security;
alter table public.seedance_usage_ledger enable row level security;
alter table public.seedance_refunds enable row level security;
alter table public.seedance_rate_limit enable row level security;

revoke all on table public.seedance_sales_orders from anon, authenticated;
revoke all on table public.seedance_licenses from anon, authenticated;
revoke all on table public.seedance_usage_ledger from anon, authenticated;
revoke all on table public.seedance_refunds from anon, authenticated;
revoke all on table public.seedance_rate_limit from anon, authenticated;
