"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/components/lang-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getContentForLang, getIntlLocale } from "@/lib/content";

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
  onKeyFilterChange?: (keyName: string) => void;
  typeFilter?: "all" | "recharge" | "charge" | "refund" | "freeze";
  dateRange?: DateRange;
  accessToken?: string;
  apiKeys?: Array<{ id: string; key_prefix: string }>;
  keyFilter?: string;
};

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
  onKeyFilterChange,
  typeFilter = "all",
  dateRange = "30d",
  accessToken,
  apiKeys = [],
  keyFilter = "",
}: TransactionTableProps) {
  const { lang } = useLang();
  const locale = getIntlLocale(lang);
  const t = getContentForLang(lang).dashboard;
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exporting, setExporting] = useState(false);
  const txTypeConfig = useMemo(
    () => ({
      recharge: { label: t.transactionTable.filters.recharge, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      charge: { label: t.transactionTable.filters.charge, color: "bg-stone-100 text-stone-700 border-stone-200" },
      freeze: { label: t.transactionTable.filters.freeze, color: "bg-amber-100 text-amber-700 border-amber-200" },
      refund: { label: t.transactionTable.filters.refund, color: "bg-blue-100 text-blue-700 border-blue-200" }
    }),
    [t]
  );
  const statusConfig = useMemo(
    () => ({
      frozen: { label: t.transactionTable.statuses.frozen, color: "bg-amber-100 text-amber-700" },
      completed: { label: t.transactionTable.statuses.completed, color: "bg-emerald-100 text-emerald-700" },
      released: { label: t.transactionTable.statuses.released, color: "bg-stone-100 text-stone-500" },
      pending: { label: t.transactionTable.statuses.pending, color: "bg-orange-100 text-orange-700" },
      failed: { label: t.transactionTable.statuses.failed, color: "bg-red-100 text-red-700" }
    }),
    [t]
  );
  const dateRangeOptions = useMemo(
    () => [
      { value: "7d" as const, label: t.transactionTable.dateRange7d },
      { value: "30d" as const, label: t.transactionTable.dateRange30d },
      { value: "90d" as const, label: t.transactionTable.dateRange90d },
      { value: "custom" as const, label: t.transactionTable.dateRangeCustom }
    ],
    [t]
  );
  const amountFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      }),
    [locale]
  );
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      }),
    [locale]
  );
  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale]
  );

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
          'Cache-Control': 'no-store',
        },
        cache: 'no-store',
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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{t.transactionTable.title}</p>
        
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
                aria-label={t.common.dateFrom}
              />
              <span className="text-stone-400">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded-lg border border-stone-300 px-2 py-1 text-xs"
                aria-label={t.common.dateTo}
              />
              <button
                onClick={() => handleDateRangeChange("custom")}
                className="rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white"
              >
                {t.common.apply}
              </button>
            </div>
          )}

          {/* API Key Filter */}
          {apiKeys.length > 0 && (
            <select
              value={keyFilter}
              onChange={(e) => onKeyFilterChange?.(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs"
            >
              <option value="">{t.transactionTable.allKeys}</option>
              {apiKeys.map((key) => (
                <option key={key.id} value={key.key_prefix}>
                  {key.key_prefix}…
                </option>
              ))}
            </select>
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
                {type === "all" ? t.transactionTable.allTypes : txTypeConfig[type]?.label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={exporting || !accessToken}
            className="border-stone-300 text-xs"
          >
            {exporting ? t.transactionTable.exporting : t.transactionTable.exportCsv}
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] border border-stone-200">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_80px_100px_100px_80px] bg-[rgba(248,244,237,0.85)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <span>{t.transactionTable.time}</span>
          <span>{t.transactionTable.type}</span>
          <span className="text-right">{t.transactionTable.amount}</span>
          <span className="text-right">{t.transactionTable.balance}</span>
          <span className="text-center">{t.transactionTable.status}</span>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="grid grid-cols-[1fr_80px_100px_100px_80px] px-4 py-8 text-center text-sm text-stone-400">
            {t.common.loadingTransactionsTable}
          </div>
        ) : transactions.length === 0 ? (
          <div className="grid grid-cols-[1fr_80px_100px_100px_80px] px-4 py-8 text-center text-sm text-stone-400">
            {t.transactionTable.noTransactionsFound}
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-[1fr_80px_100px_100px_80px] items-center border-t border-stone-200 px-4 py-3 text-sm transition hover:bg-stone-50"
            >
              <span className="text-stone-600">
                {dateTimeFormatter.format(new Date(tx.createdAt))}
              </span>
              <span>
                <Badge className={`${txTypeConfig[tx.txType]?.color} text-xs border`}>
                  {txTypeConfig[tx.txType]?.label}
                </Badge>
              </span>
              <span className={`text-right font-medium ${
                tx.amount > 0 ? "text-emerald-600" : "text-stone-700"
              }`}>
                {tx.amount > 0 ? "+" : ""}{amountFormatter.format(tx.amount)}
              </span>
              <span className="text-right text-stone-500">
                {currencyFormatter.format(tx.balanceAfter)}
              </span>
              <span className="text-center">
                <Badge className={`${statusConfig[tx.status]?.color ?? "bg-stone-100 text-stone-600"} text-xs`}>
                  {statusConfig[tx.status]?.label ?? tx.status}
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
            {t.transactionTable.showing
              .replace("{start}", String(pagination.offset + 1))
              .replace("{end}", String(Math.min(pagination.offset + pagination.limit, pagination.totalTransactions)))
              .replace("{total}", String(pagination.totalTransactions))}
          </p>
          {onLoadMore && (
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              {t.transactionTable.loadMore}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
