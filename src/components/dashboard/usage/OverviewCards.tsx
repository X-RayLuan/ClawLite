'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface UsageSummary {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  remainingBalance: number;
}

interface OverviewCardsProps {
  data: UsageSummary | null;
  loading: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toString();
}

function formatCurrency(amount: number): string {
  if (amount < 0.01 && amount > 0) {
    return '$' + amount.toFixed(6);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  loading: boolean;
  accent?: 'default' | 'coral' | 'sea';
}

function StatCard({ label, value, subValue, loading, accent = 'default' }: StatCardProps) {
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

export function OverviewCards({ data, loading }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="本月消耗 Token"
        value={loading ? '—' : formatNumber(data?.totalTokens ?? 0)}
        subValue={`In: ${formatNumber(data?.inputTokens ?? 0)} · Out: ${formatNumber(data?.outputTokens ?? 0)}`}
        loading={loading}
        accent="coral"
      />
      <StatCard
        label="本月消费"
        value={loading ? '—' : formatCurrency(data?.totalCost ?? 0)}
        subValue="按量计费"
        loading={loading}
        accent="sea"
      />
      <StatCard
        label="剩余余额"
        value={loading ? '—' : formatCurrency(data?.remainingBalance ?? 0)}
        subValue="可用额度"
        loading={loading}
        accent="default"
      />
    </div>
  );
}
