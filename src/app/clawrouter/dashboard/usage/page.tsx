'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OverviewCards, UsageChart, UsageTable } from '@/components/dashboard/usage';
import type { UsageSummary, ChartDataPoint, UsageRecord } from '@/components/dashboard/usage';
import { getSupabaseClient } from '@/lib/supabase';
import { getContentForLang, getIntlLocale } from '@/lib/content';

const PAGE_SIZE = 20;

function getDefaultDateRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: now.toISOString().slice(0, 10),
  };
}

export default function ClawRouterUsagePage() {
  const { lang } = useLang();
  const locale = getIntlLocale(lang);
  const t = getContentForLang(lang).dashboard;
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [checking, setChecking] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

  const navItems = useMemo(
    () => [
      { label: t.nav.dashboard, href: '/clawrouter/dashboard' },
      { label: t.nav.apiKeys, href: '/clawrouter/dashboard/api-keys' },
      { label: t.nav.quickStart, href: '/clawrouter/dashboard/quick-start' },
      { label: t.nav.models, href: '/clawrouter/dashboard/models' },
      { label: t.nav.usage, href: '/clawrouter/dashboard/usage', active: true },
      { label: t.nav.transactions, href: '/clawrouter/dashboard/transactions' },
      { label: t.nav.affiliate, href: '/clawrouter/dashboard/affiliate' },
      { label: t.nav.profile, href: '/clawrouter/dashboard/profile' },
    ],
    [t]
  );

  const fetchSummary = useCallback(async (token: string) => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/usage/summary', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        // Map API response { summary, balance } to what OverviewCards expects { totalTokens, inputTokens, outputTokens, totalCost, remainingBalance }
        const inTokens = Number(data.summary?.totalTokensIn ?? 0);
        const outTokens = Number(data.summary?.totalTokensOut ?? 0);
        setSummary({
          totalTokens: inTokens + outTokens,
          inputTokens: inTokens,
          outputTokens: outTokens,
          totalCost: Number(data.summary?.totalCost ?? 0),
          remainingBalance: Number(data.balance?.balanceUsd ?? 0),
        });
      }
    } catch {
      // silently fail
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchChart = useCallback(async (token: string) => {
    setLoadingChart(true);
    try {
      const res = await fetch('/api/usage/by-model', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const raw: Array<{ date: string; tokens: number; cost: number }> = Array.isArray(json)
          ? json
          : json.data ?? [];
        const byDate: Record<string, ChartDataPoint> = {};
        for (const item of raw) {
          const d = item.date?.slice(0, 10) ?? item.date;
          if (!byDate[d]) byDate[d] = { date: d, tokens: 0, cost: 0 };
          byDate[d].tokens += item.tokens ?? 0;
          byDate[d].cost += item.cost ?? 0;
        }
        setChartData(
          Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-30)
        );
      }
    } catch {
      // silently fail
    } finally {
      setLoadingChart(false);
    }
  }, []);

  const fetchRecords = useCallback(
    async (pg: number, token: string) => {
      setLoadingTable(true);
      try {
        const params = new URLSearchParams({
          page: String(pg),
          pageSize: String(PAGE_SIZE),
          start: dateRange.start,
          end: dateRange.end,
        });
        const res = await fetch(`/api/usage/records?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-store',
          },
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          const raw: any[] = Array.isArray(json) ? json : json.data ?? json.records ?? json.usageEvents ?? [];
          const items: UsageRecord[] = raw.map((r: any) => {
            const inputTokens = Number(r.tokens_in ?? r.inputTokens ?? 0);
            const outputTokens = Number(r.tokens_out ?? r.outputTokens ?? 0);
            return {
              id: r.id,
              time: r.created_at,
              model: r.model ?? '',
              inputTokens,
              outputTokens,
              totalTokens: inputTokens + outputTokens,
              cost: Number(r.cost ?? r.cost_estimate ?? 0),
            };
          });
          setRecords(items);
          // Use totalEvents as the table total (we're showing usage_events, not transactions)
          setTotal(Number(json.pagination?.totalEvents ?? items.length));
        }
      } catch {
        // silently fail
      } finally {
        setLoadingTable(false);
      }
    },
    [dateRange]
  );

  // Auth + initial data load
  useEffect(() => {
    if (!supabase) {
      router.replace('/login?returnTo=%2Fclawrouter%2Fdashboard%2Fusage');
      return;
    }

    const client = supabase;
    let mounted = true;

    async function init() {
      for (let i = 0; i < 8; i++) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          const token = data.session.access_token;
          setAccessToken(token);
          setEmail(data.session.user.email || null);
          if (token) {
            await Promise.all([
              fetchSummary(token),
              fetchChart(token),
            ]);
            await fetchRecords(1, token);
          }
          setChecking(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        router.replace('/login?returnTo=%2Fclawrouter%2Fdashboard%2Fusage');
      }
    }

    init();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/login?returnTo=%2Fclawrouter%2Fdashboard%2Fusage');
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload table when page or dateRange changes
  useEffect(() => {
    if (!checking && accessToken) {
      fetchRecords(page, accessToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, dateRange, checking, accessToken]);

  const handleDateRangeChange = (range: { start: string; end: string }) => {
    setDateRange(range);
    setPage(1);
  };

  if (checking) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16 text-stone-600">
        {t.common.loadingDashboard}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] text-stone-950">
      {/* Mobile: Top navigation bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] flex items-center gap-3 border-b border-stone-200/60 bg-white/90 px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-stone-300 bg-white/80 p-2 text-stone-700 hover:bg-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-stone-900">{t.nav.usage}</span>
      </div>

      {/* Mobile: Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64 h-full bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-stone-200 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
                CR
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-950">{t.common.clawRouter}</p>
                <p className="text-xs text-stone-500">{email || t.common.accountFallback}</p>
              </div>
            </div>
            <nav className="mt-5 space-y-1.5 px-3">
              {navItems.map((item) => {
                const isActive = item.active;
                if (item.href) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`block rounded-2xl px-4 py-3 text-sm ${isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <div
                    key={item.label}
                    className={`rounded-2xl px-4 py-3 text-sm ${isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
                  >
                    {item.label}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:pt-0 pt-16">
        <aside className="hidden lg:block rounded-[28px] border border-stone-300/60 bg-white/85 p-5 shadow-none">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
              CR
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-950">{t.common.clawRouter}</p>
              <p className="text-xs text-stone-500">{email || t.common.accountFallback}</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.active;
              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm ${isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div
                  key={item.label}
                  className={`rounded-2xl px-4 py-3 text-sm ${isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
                >
                  {item.label}
                </div>
              );
            })}
          </nav>
        </aside>

        <section className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="px-0 text-stone-700 hover:bg-transparent hover:text-stone-950"
          >
            <Link href="/clawrouter/dashboard">← {t.common.backToDashboard}</Link>
          </Button>
          <div className="mt-4 flex items-center gap-3">
            <Badge className="border-coral/20 bg-coral/10 text-coral">{t.nav.usage}</Badge>
            <h1 className="font-display text-3xl font-semibold text-stone-950 sm:text-4xl">
              {t.nav.usage}
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-stone-600 sm:text-base">
            实时查看本月 Token 消耗趋势、消费明细及账户余额。
          </p>
        </div>

        <section className="space-y-6">
          {/* Overview Cards */}
          <OverviewCards data={summary} loading={loadingSummary} />

          {/* Trend Chart */}
          <UsageChart data={chartData} loading={loadingChart} />

          {/* Detail Table */}
          <UsageTable
            records={records}
            loading={loadingTable}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </section>
        </section>
      </div>
    </main>
  );
}
