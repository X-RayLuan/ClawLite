"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Transaction = {
  id: string;
  txType: "recharge" | "charge" | "freeze" | "refund";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: "frozen" | "completed" | "released" | "pending";
  description: string | null;
  eventId: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

type TransactionTableProps = {
  transactions: Transaction[];
  loading?: boolean;
  pagination?: {
    limit: number;
    offset: number;
    totalTransactions: number;
  };
  onLoadMore?: () => void;
  typeFilter?: "all" | "recharge" | "charge" | "refund" | "freeze";
  onTypeFilterChange?: (type: "all" | "recharge" | "charge" | "refund" | "freeze") => void;
};

const txTypeConfig = {
  recharge: { label: "Recharge", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  charge: { label: "Usage", color: "bg-stone-100 text-stone-700 border-stone-200" },
  freeze: { label: "Freeze", color: "bg-amber-100 text-amber-700 border-amber-200" },
  refund: { label: "Refund", color: "bg-blue-100 text-blue-700 border-blue-200" },
};

const statusConfig = {
  frozen: { label: "Processing", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  released: { label: "Released", color: "bg-stone-100 text-stone-500" },
  pending: { label: "Pending", color: "bg-orange-100 text-orange-700" },
};

export function TransactionTable({
  transactions,
  loading,
  pagination,
  onLoadMore,
  typeFilter = "all",
  onTypeFilterChange,
}: TransactionTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredTransactions = typeFilter === "all"
    ? transactions
    : transactions.filter((tx) => tx.txType === typeFilter);

  return (
    <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Transaction History</p>
        <div className="flex gap-1">
          {(["all", "recharge", "charge", "refund"] as const).map((type) => (
            <button
              key={type}
              onClick={() => onTypeFilterChange?.(type)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                typeFilter === type
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {type === "all" ? "All" : txTypeConfig[type]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] border border-stone-200">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_80px_100px_100px_80px] bg-[rgba(248,244,237,0.85)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <span>Time</span>
          <span>Type</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Balance</span>
          <span className="text-center">Status</span>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="grid grid-cols-[1fr_80px_100px_100px_80px] px-4 py-8 text-center text-sm text-stone-400">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="grid grid-cols-[1fr_80px_100px_100px_80px] px-4 py-8 text-center text-sm text-stone-400">
            No transactions yet
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-[1fr_80px_100px_100px_80px] items-center border-t border-stone-200 px-4 py-3 text-sm transition hover:bg-stone-50"
            >
              <span className="text-stone-600">
                {new Date(tx.createdAt).toLocaleString()}
              </span>
              <span>
                <Badge className={`${txTypeConfig[tx.txType]?.color} text-xs border`}>
                  {txTypeConfig[tx.txType]?.label}
                </Badge>
              </span>
              <span className={`text-right font-medium ${
                tx.amount > 0 ? "text-emerald-600" : "text-stone-700"
              }`}>
                {tx.amount > 0 ? "+" : ""}{tx.amount.toFixed(4)}
              </span>
              <span className="text-right text-stone-500">
                ${tx.balanceAfter.toFixed(4)}
              </span>
              <span className="text-center">
                <Badge className={`${statusConfig[tx.status]?.color} text-xs`}>
                  {statusConfig[tx.status]?.label}
                </Badge>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalTransactions > pagination.limit && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.totalTransactions)} of {pagination.totalTransactions}
          </p>
          {onLoadMore && (
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
