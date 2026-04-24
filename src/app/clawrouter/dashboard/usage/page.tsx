'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

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
        setSummary(data);
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
          const items: UsageRecord[] = Array.isArray(json) ? json : json.data ?? json.records ?? [];
          setRecords(items);
          setTotal(json.total ?? items.length);
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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
      </div>
    </main>
  );
}
