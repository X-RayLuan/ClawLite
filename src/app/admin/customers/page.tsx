'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';

export interface Customer {
  id: string;
  email: string;
  balance: number;
  created_at: string;
  last_active: string;
  plan: string;
  billing_status: string;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const PAGE_SIZE = 20;

function Drawer({ open, onClose, customer, onBalanceAdjust }: {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onBalanceAdjust: (customer: Customer) => void;
}) {
  if (!open || !customer) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-stone-200 bg-white shadow-elevated">
        <div className="sticky top-0 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-stone-900">客户详情</h2>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">邮箱</p>
              <p className="mt-1 font-medium text-stone-900">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">当前余额</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{formatCurrency(customer.balance)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">注册时间</p>
              <p className="mt-1 text-stone-700">{formatDate(customer.created_at)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">最后活跃</p>
              <p className="mt-1 text-stone-700">{formatDate(customer.last_active)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">套餐计划</p>
              <p className="mt-1">
                <Badge className={cn(
                  'border',
                  customer.plan === 'pro' ? 'border-coral/20 bg-coral/10 text-coral' :
                  customer.plan === 'team' ? 'border-sea/20 bg-sea/10 text-sea' :
                  'border-stone-300/70 bg-stone-100 text-stone-600'
                )}>
                  {customer.plan || 'free'}
                </Badge>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">账单状态</p>
              <p className="mt-1 text-stone-700">{customer.billing_status || '—'}</p>
            </div>
          </div>
          <div className="border-t border-stone-200 pt-4">
            <Button className="w-full" onClick={() => onBalanceAdjust(customer)}>
              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              调整余额
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function BalanceAdjustModal({ open, onClose, customer, onSuccess }: {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSuccess: (newBalance: number) => void;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val)) { setError('请输入有效金额'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/customers/${customer?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance_adjustment: val, note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '调整失败');
      onSuccess(val);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally { setSubmitting(false); }
  };

  if (!open || !customer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-stone-300/70 bg-white p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">调整余额</h2>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-4 text-sm text-stone-500">当前余额：<span className="font-semibold text-stone-900">{formatCurrency(customer.balance)}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">调整金额（正数增加，负数减少）</label>
            <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="例如: 10.00 或 -5.00" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">备注（可选）</label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="调整原因…" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>取消</Button>
            <Button type="submit" disabled={submitting}>{submitting ? '调整中…' : '确认调整'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { isAuthenticated, checking } = useAdminAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchCustomers = useCallback(async (pg: number, searchTerm: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), page_size: String(PAGE_SIZE) });
      if (searchTerm) params.set('search', searchTerm);
      const res = await fetch(`/api/admin/customers?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` },
      });
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.data?.customers || []);
        setPagination(json.data?.pagination || null);
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (checking) return;
    if (!isAuthenticated) return;
    fetchCustomers(page, search);
  }, [checking, isAuthenticated, page, search, fetchCustomers]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => { setPage(1); fetchCustomers(1, val); }, 400);
    setSearchTimer(timer);
  };

  const openCustomer = (c: Customer) => { setSelectedCustomer(c); setShowDrawer(true); };
  const closeDrawer = () => { setShowDrawer(false); setSelectedCustomer(null); };

  const handleBalanceAdjust = (_c: Customer) => {
    setShowAdjustModal(true);
  };

  const handleBalanceSuccess = (adjustment: number) => {
    if (!selectedCustomer) return;
    const newBalance = selectedCustomer.balance + adjustment;
    const updated = { ...selectedCustomer, balance: newBalance };
    setSelectedCustomer(updated);
    setCustomers(cs => cs.map(c => c.id === updated.id ? updated : c));
  };

  const totalPages = pagination?.total_pages || 1;

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
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <Badge className="border-coral/20 bg-coral/10 text-coral">管理后台</Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">客户管理</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 sm:text-base">
          查看所有注册客户信息，支持搜索和余额管理。
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>客户列表</CardTitle>
            <Input
              placeholder="搜索邮箱…"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full sm:w-64"
            />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">邮箱</th>
                    <th className="py-3 pr-4 text-right font-semibold text-stone-600">余额</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">套餐</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">注册时间</th>
                    <th className="py-3 text-left font-semibold text-stone-600">最后活跃</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-stone-100">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="py-3 pr-4">
                            <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        {search ? '未找到匹配的客户' : '暂无客户'}
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr
                        key={c.id}
                        className="cursor-pointer border-b border-stone-100 transition-colors hover:bg-stone-50"
                        onClick={() => openCustomer(c)}
                      >
                        <td className="py-3 pr-4 font-medium text-stone-900">{c.email}</td>
                        <td className="py-3 pr-4 text-right font-medium text-ink">{formatCurrency(c.balance)}</td>
                        <td className="py-3 pr-4">
                          <Badge className={cn('border',
                            c.plan === 'pro' ? 'border-coral/20 bg-coral/10 text-coral' :
                            c.plan === 'team' ? 'border-sea/20 bg-sea/10 text-sea' :
                            'border-stone-300/70 bg-stone-100 text-stone-600'
                          )}>
                            {c.plan || 'free'}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-stone-500">{formatDate(c.created_at)}</td>
                        <td className="py-3 text-stone-500">{formatDate(c.last_active)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && (pagination?.total || 0) > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-stone-400">共 {pagination?.total} 条</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="h-8 w-8 p-0">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={cn('h-8 w-8 p-0 text-xs', pageNum !== page && 'text-stone-600')}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-8 w-8 p-0">
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

      <Drawer
        open={showDrawer}
        onClose={closeDrawer}
        customer={selectedCustomer}
        onBalanceAdjust={handleBalanceAdjust}
      />

      <BalanceAdjustModal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        customer={selectedCustomer}
        onSuccess={handleBalanceSuccess}
      />
    </main>
  );
}
