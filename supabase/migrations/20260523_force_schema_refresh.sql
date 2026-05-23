-- Force PostgREST schema cache refresh by touching the table
-- This resolves "could not find column" errors in PostgREST schema cache
alter table public.balance_transactions alter column amount type numeric(18,4);
alter table public.balance_transactions alter column amount type numeric(18,2);
