'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ChartDataPoint {
  date: string;
  tokens: number;
  cost: number;
}

interface UsageChartProps {
  data: ChartDataPoint[];
  loading: boolean;
}

export function UsageChart({ data, loading }: UsageChartProps) {
  const [RechartsComp, setRechartsComp] = useState<typeof import('recharts') | null>(null);

  useEffect(() => {
    import('recharts').then((mod) => setRechartsComp(mod));
  }, []);

  const hasData = data && data.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>近30天消耗趋势</CardTitle>
      </CardHeader>
      <CardContent>
        {loading || !RechartsComp ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
          </div>
        ) : !hasData ? (
          <div className="flex h-64 flex-col items-center justify-center text-stone-400">
            <svg
              className="mb-3 h-10 w-10 opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3v18h18M7 16l4-4 4 4 5-6"
              />
            </svg>
            <p className="text-sm">暂无数据</p>
          </div>
        ) : (
          <div className="h-64">
            <RechartsComp.ResponsiveContainer width="100%" height="100%">
              <RechartsComp.LineChart
                data={data}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
                <RechartsComp.CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e7e5e4"
                  vertical={false}
                />
                <RechartsComp.XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#a8a29e' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <RechartsComp.YAxis
                  tick={{ fontSize: 11, fill: '#a8a29e' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(0)}M`
                      : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}K`
                        : String(v)
                  }
                />
                <RechartsComp.Tooltip
                  formatter={(value) => {
                    const v = Number(value);
                    return [
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(2)}M tokens`
                        : v >= 1_000
                          ? `${(v / 1_000).toFixed(2)}K tokens`
                          : `${v} tokens`,
                      '消耗量',
                    ];
                  }}
                  labelStyle={{ color: '#44403c', fontSize: 12 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e7e5e4',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <RechartsComp.Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="#b45309"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#b45309' }}
                />
              </RechartsComp.LineChart>
            </RechartsComp.ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
