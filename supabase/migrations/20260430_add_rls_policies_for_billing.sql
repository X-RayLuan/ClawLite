-- RLS policies for billing tables.
-- The service_role key bypasses RLS, but explicit policies ensure
-- that inserts work correctly even when RLS is strictly enforced.

-- ============================================================
-- usage_events: allow service role full access (bypass RLS)
-- ============================================================
create policy "service_role_usage_events_all"
  on public.usage_events
  for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- balance_transactions: allow service role full access (bypass RLS)
-- ============================================================
create policy "service_role_balance_transactions_all"
  on public.balance_transactions
  for all
  to service_role
  using (true)
  with check (true);
