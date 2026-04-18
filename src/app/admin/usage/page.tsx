'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminNav } from '@/components/admin-nav';
import { useLang } from '@/components/lang-provider';

export interface UsageOverview {
  total_requests: number;
  total_tokens_in: number;
  total_tokens_out: number;
  total_cost: number;
  top_accounts: Array<{
    account_id: string;
    email: string | null;
    total_cost: number;
  }>;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function StatCard({ label, value, subValue, loading, accent = 'default' }: {
  label: string; value: string; subValue?: string; loading: boolean; accent?: 'default' | 'coral' | 'sea';
}) {
  const accentClasses = {
    default: 'border-stone-300/70',
    coral: 'border-coral/30',
    sea: 'border-sea/30',
  };
  return (
    <Card className={cn('relative overflow-hidden', accentClasses[accent])}>
      <CardContent className="p-5 sm:p-6">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
            <div className="h-8 w-36 animate-pulse rounded bg-stone-200" />
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">{value}</p>
            {subValue && <p className="mt-1 text-sm text-stone-500">{subValue}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminUsagePage() {
  const { isAuthenticated, checking } = useAdminAuth();
  const { lang } = useLang();

  const [overview, setOverview] = useState<UsageOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [page, setPage] = useState(1);
  const [topAccountsLoading, setTopAccountsLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/admin/usage', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` },
      });
      if (res.ok) {
        const json = await res.json();
        setOverview(json.data || null);
      }
    } catch { /* silently fail */ }
    finally { setLoadingOverview(false); }
  }, []);

  useEffect(() => {
    if (checking) return;
    if (!isAuthenticated) return;
    fetchOverview();
  }, [checking, isAuthenticated, fetchOverview]);

  const totalTokens = (overview?.total_tokens_in || 0) + (overview?.total_tokens_out || 0);

  if (checking) {
    return (
      <main className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="gradient-bg min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <Badge className="border-coral/20 bg-coral/10 text-coral">{lang === 'zh' ? '管理后台' : 'Admin'}</Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {lang === 'zh' ? '消费统计' : 'Usage Statistics'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 sm:text-base">
          {lang === 'zh'
            ? '全局消费概览，按客户分布分析。'
            : 'Global usage overview and customer distribution.'}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8 space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label={lang === 'zh' ? '总请求数' : 'Total Requests'}
            value={loadingOverview ? '—' : formatNumber(overview?.total_requests ?? 0)}
            subValue={lang === 'zh' ? '全部时间累计' : 'All time'}
            loading={loadingOverview}
            accent="coral"
          />
          <StatCard
            label={lang === 'zh' ? '总 Token 消耗' : 'Total Token'}
            value={loadingOverview ? '—' : formatNumber(totalTokens)}
            subValue={`${lang === 'zh' ? '输入' : 'In'} ${formatNumber(overview?.total_tokens_in ?? 0)} / ${lang === 'zh' ? '输出' : 'Out'} ${formatNumber(overview?.total_tokens_out ?? 0)}`}
            loading={loadingOverview}
            accent="sea"
          />
          <StatCard
            label={lang === 'zh' ? '总费用' : 'Total Cost'}
            value={loadingOverview ? '—' : formatCurrency(overview?.total_cost ?? 0)}
            subValue={lang === 'zh' ? '全部时间累计' : 'All time'}
            loading={loadingOverview}
            accent="default"
          />
        </div>

        {/* Date Range + Refresh */}
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{lang === 'zh' ? '日期筛选' : 'Date Filter'}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">{lang === 'zh' ? '从' : 'From'}</span>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
                  className="w-36"
                />
                <span className="text-xs text-stone-400">{lang === 'zh' ? '至' : 'To'}</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
                  className="w-36"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={fetchOverview}>
                <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {lang === 'zh' ? '刷新' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Top Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'zh' ? '按客户费用排名（TOP 10）' : 'Top 10 Accounts by Cost'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">{lang === 'zh' ? '排名' : 'Rank'}</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">{lang === 'zh' ? '客户邮箱' : 'Customer Email'}</th>
                    <th className="py-3 text-right font-semibold text-stone-600">{lang === 'zh' ? '累计费用 (USD)' : 'Total Cost (USD)'}</th>
                    <th className="py-3 text-right font-semibold text-stone-600">{lang === 'zh' ? '费用占比' : 'Cost Share'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOverview ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-stone-100">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="py-3 pr-4">
                            <div className="h-4 w-20 animate-pulse rounded bg-stone-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : !overview?.top_accounts?.length ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-stone-400">{lang === 'zh' ? '暂无消费数据' : 'No usage data'}</td>
                    </tr>
                  ) : (
                    overview.top_accounts.map((acc, i) => {
                      const pct = overview.total_cost > 0
                        ? ((acc.total_cost / overview.total_cost) * 100).toFixed(1)
                        : '0.0';
                      return (
                        <tr
                          key={acc.account_id}
                          className="border-b border-stone-100 transition-colors hover:bg-stone-50"
                        >
                          <td className="py-3 pr-4">
                            <span className={cn(
                              'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                              i === 0 ? 'bg-coral/10 text-coral' :
                              i === 1 ? 'bg-sea/10 text-sea' :
                              'bg-stone-100 text-stone-500'
                            )}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-medium text-stone-900">{acc.email || '—'}</td>
                          <td className="py-3 text-right font-semibold text-stone-900">{formatCurrency(acc.total_cost)}</td>
                          <td className="py-3 text-right text-stone-600">{pct}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loadingOverview && (overview?.total_requests ?? 0) > 0 && (
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                <p className="text-xs text-stone-400">{lang === 'zh' ? '共' : 'Total'} {overview?.top_accounts?.length || 0} {lang === 'zh' ? '位客户' : 'customers'}</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="h-8 w-8 p-0">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  <Button variant="primary" size="sm" className="h-8 w-8 p-0 text-xs">{page}</Button>
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} className="h-8 w-8 p-0">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
