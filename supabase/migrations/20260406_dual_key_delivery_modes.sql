alter table public.entitlements
  add column if not exists delivery_mode text not null default 'managed_key';

create table if not exists public.inventory_keys (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'ezrouter',
  name text not null,
  plaintext_key text not null,
  key_prefix text not null,
  face_value_usd numeric(18,2) not null default 10,
  sale_price_usd numeric(18,2) not null default 5,
  status text not null default 'available',
  assigned_account_id uuid references public.accounts(id) on delete set null,
  assigned_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uniq_inventory_keys_plaintext_key on public.inventory_keys(plaintext_key);
create index if not exists idx_inventory_keys_status on public.inventory_keys(status);
create index if not exists idx_inventory_keys_assigned_account_id on public.inventory_keys(assigned_account_id);

create table if not exists public.account_key_deliveries (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  delivery_mode text not null,
  source_type text not null,
  source_id uuid,
  display_name text not null,
  provider text not null,
  plaintext_key text,
  key_prefix text,
  face_value_usd numeric(18,2),
  sale_price_usd numeric(18,2),
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uniq_account_key_deliveries_source on public.account_key_deliveries(account_id, delivery_mode, source_type, source_id);
create index if not exists idx_account_key_deliveries_account_id on public.account_key_deliveries(account_id);
create index if not exists idx_account_key_deliveries_mode on public.account_key_deliveries(delivery_mode);

alter table public.inventory_keys enable row level security;
alter table public.account_key_deliveries enable row level security;

revoke all on table public.inventory_keys from anon, authenticated;
revoke all on table public.account_key_deliveries from anon, authenticated;
