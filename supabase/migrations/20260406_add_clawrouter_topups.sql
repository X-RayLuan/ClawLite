alter table public.accounts
  add column if not exists credit_balance_usd numeric(18,2) not null default 0;

create table if not exists public.topup_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  provider text not null default 'stripe',
  stripe_session_id text not null unique,
  stripe_event_id text,
  amount_usd numeric(18,2) not null,
  promo_code text,
  status text not null default 'completed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_topup_transactions_account_id on public.topup_transactions(account_id);
create index if not exists idx_topup_transactions_created_at on public.topup_transactions(created_at desc);

alter table public.topup_transactions enable row level security;
revoke all on table public.topup_transactions from anon, authenticated;
