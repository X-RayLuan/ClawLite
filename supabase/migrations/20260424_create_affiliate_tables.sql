-- Affiliate referrals table
create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.accounts(id) on delete cascade,
  referee_id uuid not null references public.accounts(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists idx_affiliate_referrals_referrer_id on public.affiliate_referrals(referrer_id);
create index if not exists idx_affiliate_referrals_referee_id on public.affiliate_referrals(referee_id);

-- Affiliate commissions table
create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.accounts(id) on delete cascade,
  referee_id uuid not null references public.accounts(id) on delete cascade,
  amount numeric(18, 8) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists idx_affiliate_commissions_referrer_id on public.affiliate_commissions(referrer_id);

alter table public.affiliate_referrals enable row level security;
alter table public.affiliate_commissions enable row level security;

revoke all on table public.affiliate_referrals from anon, authenticated;
revoke all on table public.affiliate_commissions from anon, authenticated;
