"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type UsageEvent = {
  id: string;
  key_name: string | null;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost: number | null;
  status: string;
  created_at: string;
};

type UsageTableProps = {
  events: UsageEvent[];
  loading?: boolean;
  limit?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  success: { label: "Success", color: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
};

export function UsageTable({ events, loading, limit, onLoadMore, hasMore }: UsageTableProps) {
  return (
    <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">API Usage Details</p>
        {limit && <span className="text-xs text-stone-400">Top {limit}</span>}
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] border border-stone-200">
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] bg-[rgba(248,244,237,0.85)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <span>Time</span>
          <span>Model</span>
          <span className="text-right">Input</span>
          <span className="text-right">Output</span>
          <span className="text-right">Cost</span>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] px-4 py-8 text-center text-sm text-stone-400">
            Loading usage...
          </div>
        ) : events.length === 0 ? (
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] px-4 py-8 text-center text-sm text-stone-400">
            No API requests yet
          </div>
        ) : (
          <>
            {events.map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] items-center border-t border-stone-200 px-4 py-3 text-sm transition hover:bg-stone-50"
              >
                <span className="text-stone-600">
                  {new Date(event.created_at).toLocaleString()}
                </span>
                <span className="font-medium text-stone-900">
                  {event.model}
                </span>
                <span className="text-right text-stone-600">
                  {event.tokens_in > 0 ? event.tokens_in.toLocaleString() : "-"}
                </span>
                <span className="text-right text-stone-600">
                  {event.tokens_out > 0 ? event.tokens_out.toLocaleString() : "-"}
                </span>
                <span className={`text-right font-medium ${
                  event.cost && event.cost > 0 ? "text-red-600" : "text-stone-400"
                }`}>
                  {event.cost != null ? `-$${event.cost.toFixed(4)}` : "$0.00"}
                </span>
              </div>
            ))}
            
            {hasMore && onLoadMore && (
              <div className="border-t border-stone-200 px-4 py-3 text-center">
                <button
                  onClick={onLoadMore}
                  disabled={loading}
                  className="text-xs text-stone-500 hover:text-stone-700 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
