"use client";

import { Card } from "@/components/ui/card";

type UsageDataPoint = {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
};

type UsageChartProps = {
  title: string;
  data: UsageDataPoint[];
  loading?: boolean;
  type?: "requests" | "tokens" | "cost";
};

function SimpleBarChart({ data, type }: { data: UsageDataPoint[]; type: "requests" | "tokens" | "cost" }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-stone-400">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d[type]));
  const normalizedData = data.map((d) => ({
    ...d,
    normalizedHeight: maxValue > 0 ? (d[type] / maxValue) * 100 : 0,
  }));

  const formatValue = (value: number) => {
    if (type === "cost") return `$${value.toFixed(2)}`;
    if (type === "tokens") return value.toLocaleString();
    return value.toString();
  };

  return (
    <div className="mt-4 flex h-48 items-end gap-2">
      {normalizedData.map((d, i) => (
        <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-lg bg-stone-900/80 transition-all hover:bg-stone-900"
            style={{ height: `${Math.max(d.normalizedHeight, 4)}%` }}
          />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-lg bg-stone-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
            {formatValue(d[type])} on {d.date}
          </div>
          <span className="text-xs text-stone-500">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export function UsageChart({ title, data, loading, type = "requests" }: UsageChartProps) {
  return (
    <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{title}</p>
          <p className="mt-1 text-sm text-stone-600">
            {type === "requests" && "API requests over time"}
            {type === "tokens" && "Token consumption over time"}
            {type === "cost" && "Cost accumulation over time"}
          </p>
        </div>
        {data.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-semibold text-stone-950">
              {type === "requests" && data.reduce((sum, d) => sum + d.requests, 0).toLocaleString()}
              {type === "tokens" && (data.reduce((sum, d) => sum + d.tokens, 0) / 1000).toFixed(1) + "K"}
              {type === "cost" && `$${data.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}`}
            </p>
            <p className="text-xs text-stone-500">Total</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-4 flex h-48 items-center justify-center text-sm text-stone-400">
          Loading chart data...
        </div>
      ) : (
        <SimpleBarChart data={data} type={type} />
      )}
    </Card>
  );
}
