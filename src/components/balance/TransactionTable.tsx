"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

type DateRange = "7d" | "30d" | "90d" | "custom";

type TransactionTableProps = {
  transactions: Transaction[];
  loading?: boolean;
  pagination?: {
    limit: number;
    offset: number;
    totalTransactions: number;
  };
  onLoadMore?: () => void;
  onTypeFilterChange?: (type: "all" | "recharge" | "charge" | "refund" | "freeze") => void;
  onDateRangeChange?: (range: DateRange, startDate?: string, endDate?: string) => void;
  typeFilter?: "all" | "recharge" | "charge" | "refund" | "freeze";
  dateRange?: DateRange;
  accessToken?: string;
};

const txTypeConfig: Record<string, { label: string; color: string }> = {
  recharge: { label: "Recharge", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  charge: { label: "Usage", color: "bg-stone-100 text-stone-700 border-stone-200" },
  freeze: { label: "Freeze", color: "bg-amber-100 text-amber-700 border-amber-200" },
  refund: { label: "Refund", color: "bg-blue-100 text-blue-700 border-blue-200" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  frozen: { label: "Processing", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  released: { label: "Released", color: "bg-stone-100 text-stone-500" },
  pending: { label: "Pending", color: "bg-orange-100 text-orange-700" },
};

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "custom", label: "Custom" },
];

function getDateRange(range: DateRange): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (range) {
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "custom":
      startDate.setDate(startDate.getDate() - 30);
      break;
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

export function TransactionTable({
  transactions,
  loading,
  pagination,
  onLoadMore,
  onTypeFilterChange,
  onDateRangeChange,
  typeFilter = "all",
  dateRange = "30d",
  accessToken,
}: TransactionTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleDateRangeChange = (range: DateRange) => {
    if (range === "custom") {
      if (customStartDate && customEndDate) {
        onDateRangeChange?.("custom", new Date(customStartDate).toISOString(), new Date(customEndDate).toISOString());
      }
    } else {
      const { startDate, endDate } = getDateRange(range);
      onDateRangeChange?.(range, startDate, endDate);
    }
  };

  const handleExport = async () => {
    if (!accessToken) return;
    
    setExporting(true);
    try {
      const { startDate, endDate } = getDateRange(dateRange);
      const params = new URLSearchParams({
        startDate,
        endDate,
        type: typeFilter,
      });
      
      const response = await fetch(`/api/export/transactions?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Transaction History</p>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Filter */}
          <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  dateRange === option.value
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Custom Date Inputs */}
          {dateRange === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="rounded-lg border border-stone-300 px-2 py-1 text-xs"
              />
              <span className="text-stone-400">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded-lg border border-stone-300 px-2 py-1 text-xs"
              />
              <button
                onClick={() => handleDateRangeChange("custom")}
                className="rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white"
              >
                Apply
              </button>
            </div>
          )}

          {/* Type Filter */}
          <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
            {(["all", "recharge", "charge", "refund"] as const).map((type) => (
              <button
                key={type}
                onClick={() => onTypeFilterChange?.(type)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  typeFilter === type
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {type === "all" ? "All" : txTypeConfig[type]?.label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting || !accessToken}
            className="border-stone-300 text-xs"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
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
        ) : transactions.length === 0 ? (
          <div className="grid grid-cols-[1fr_80px_100px_100px_80px] px-4 py-8 text-center text-sm text-stone-400">
            No transactions found
          </div>
        ) : (
          transactions.map((tx) => (
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
