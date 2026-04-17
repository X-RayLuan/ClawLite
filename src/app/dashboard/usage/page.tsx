'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { OverviewCards, UsageChart, UsageTable } from '@/components/dashboard/usage';
import type { UsageSummary, ChartDataPoint, UsageRecord } from '@/components/dashboard/usage';

const PAGE_SIZE = 20;

function getDefaultDateRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: now.toISOString().slice(0, 10),
  };
}

export default function UsageDashboardPage() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/usage/summary');
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

  const fetchChart = useCallback(async () => {
    setLoadingChart(true);
    try {
      const res = await fetch('/api/usage/by-model');
      if (res.ok) {
        const json = await res.json();
        // normalize to ChartDataPoint[]
        const raw: Array<{ date: string; tokens: number; cost: number }> = Array.isArray(json)
          ? json
          : json.data ?? [];
        // aggregate by date
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
    async (pg: number) => {
      setLoadingTable(true);
      try {
        const params = new URLSearchParams({
          page: String(pg),
          pageSize: String(PAGE_SIZE),
          start: dateRange.start,
          end: dateRange.end,
        });
        const res = await fetch(`/api/usage/records?${params}`);
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

  useEffect(() => {
    fetchSummary();
    fetchChart();
  }, [fetchSummary, fetchChart]);

  useEffect(() => {
    fetchRecords(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, dateRange]);

  const handleDateRangeChange = (range: { start: string; end: string }) => {
    setDateRange(range);
    setPage(1);
  };

  return (
    <main className="gradient-bg min-h-screen">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <Badge className="border-coral/20 bg-coral/10 text-coral">用量统计</Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
          客户用量 Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 sm:text-base">
          实时查看本月 Token 消耗趋势、消费明细及账户余额。
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8 space-y-6">
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
    </main>
  );
}
