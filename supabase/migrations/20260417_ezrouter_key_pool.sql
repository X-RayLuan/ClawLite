-- ============================================================
-- ezrouter_key_pool: shared key pool for load-balanced routing
-- ============================================================
create table if not exists public.ezrouter_key_pool (
  id              uuid primary key default gen_random_uuid(),
  ezrouter_key_id text not null,
  plaintext_key   text not null,
  key_prefix      text not null,
  name            text not null,
  is_active       boolean not null default true,
  load_weight     integer not null default 100,
  current_load    integer not null default 0,
  account_id      uuid references public.accounts(id) on delete set null,
  is_shared       boolean not null default false,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists uniq_ezrouter_key_pool_ezrouter_key_id on public.ezrouter_key_pool(ezrouter_key_id);
create index if not exists idx_ezrouter_key_pool_is_active on public.ezrouter_key_pool(is_active);
create index if not exists idx_ezrouter_key_pool_account_id on public.ezrouter_key_pool(account_id);
create index if not exists idx_ezrouter_key_pool_load on public.ezrouter_key_pool(is_active, current_load asc);

-- ============================================================
-- balance_transactions: immutable ledger of balance operations
-- ============================================================
create table if not exists public.balance_transactions (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.accounts(id) on delete cascade,
  event_id      uuid,
  tx_type       text not null,
  amount        numeric(18,2) not null,
  balance_before numeric(18,2) not null,
  balance_after  numeric(18,2) not null,
  status        text not null default 'completed',
  description   text,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists idx_balance_transactions_account_id on public.balance_transactions(account_id);
create index if not exists idx_balance_transactions_event_id on public.balance_transactions(event_id) where event_id is not null;
create index if not exists idx_balance_transactions_tx_type on public.balance_transactions(tx_type);
create index if not exists idx_balance_transactions_created_at on public.balance_transactions(created_at desc);

-- ============================================================
-- recharge_orders: top-up / recharge order records
-- ============================================================
create table if not exists public.recharge_orders (
  id                   uuid primary key default gen_random_uuid(),
  account_id           uuid not null references public.accounts(id) on delete cascade,
  order_type           text not null default 'stripe',
  amount_usd           numeric(18,2) not null,
  credited_amount_usd  numeric(18,2) not null,
  provider             text not null default 'stripe',
  provider_order_id    text,
  stripe_session_id    text,
  stripe_payment_intent text,
  promo_code           text,
  status               text not null default 'pending',
  metadata             jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create unique index if not exists uniq_recharge_orders_stripe_session on public.recharge_orders(stripe_session_id) where stripe_session_id is not null;
create index if not exists idx_recharge_orders_account_id on public.recharge_orders(account_id);
create index if not exists idx_recharge_orders_status on public.recharge_orders(status);
create index if not exists idx_recharge_orders_created_at on public.recharge_orders(created_at desc);

-- ============================================================
-- RLS
-- ============================================================
alter table public.ezrouter_key_pool enable row level security;
alter table public.balance_transactions enable row level security;
alter table public.recharge_orders enable row level security;

revoke all on table public.ezrouter_key_pool from anon, authenticated;
revoke all on table public.balance_transactions from anon, authenticated;
revoke all on table public.recharge_orders from anon, authenticated;
