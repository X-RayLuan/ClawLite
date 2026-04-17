'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface UsageRecord {
  id: string;
  time: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

interface UsageTableProps {
  records: UsageRecord[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function exportToCSV(records: UsageRecord[]) {
  const headers = ['时间', '模型', 'Input Tokens', 'Output Tokens', '费用 (USD)'];
  const rows = records.map((r) => [
    r.time,
    r.model,
    r.inputTokens,
    r.outputTokens,
    r.cost.toFixed(6),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `usage-records-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function UsageTable({
  records,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  dateRange,
  onDateRangeChange,
}: UsageTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>消耗明细</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">筛选</span>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="w-36"
            />
            <span className="text-xs text-stone-400">至</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="w-36"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportToCSV(records)}
            disabled={loading || records.length === 0}
          >
            <svg
              className="mr-1.5 h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-4M7 10l5 5 5-5M12 15V3"
              />
            </svg>
            导出 CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="py-3 pr-4 text-left font-semibold text-stone-600">时间</th>
                <th className="py-3 pr-4 text-left font-semibold text-stone-600">模型</th>
                <th className="py-3 pr-4 text-right font-semibold text-stone-600">Input Tokens</th>
                <th className="py-3 pr-4 text-right font-semibold text-stone-600">Output Tokens</th>
                <th className="py-3 text-right font-semibold text-stone-600">费用</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3 pr-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-stone-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    暂无记录
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-stone-100 transition-colors hover:bg-stone-50"
                  >
                    <td className="py-3 pr-4 text-stone-600">{formatDate(record.time)}</td>
                    <td className="py-3 pr-4 font-medium text-stone-900">{record.model}</td>
                    <td className="py-3 pr-4 text-right text-stone-600">
                      {formatNumber(record.inputTokens)}
                    </td>
                    <td className="py-3 pr-4 text-right text-stone-600">
                      {formatNumber(record.outputTokens)}
                    </td>
                    <td className="py-3 text-right font-medium text-stone-900">
                      {formatCurrency(record.cost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              共 {total} 条，第 {page} / {totalPages} 页
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="h-8 w-8 p-0"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={cn('h-8 w-8 p-0 text-xs', pageNum !== page && 'text-stone-600')}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="h-8 w-8 p-0"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
