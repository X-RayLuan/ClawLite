-- Add credit balance columns to accounts table for claude API proxy billing
alter table public.accounts add column if not exists credit_balance_usd numeric(18,8) default 0;
alter table public.accounts add column if not exists frozen_balance_usd numeric(18,8) default 0;
