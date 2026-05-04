"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getContentForLang, getIntlLocale } from "@/lib/content";
import { getSupabaseClient } from "@/lib/supabase";
import { TransactionTable, Transaction } from "@/components/balance/TransactionTable";

type DateRange = "7d" | "30d" | "90d" | "custom";

type BalanceSummary = {
  balanceUsd: number;
  frozenBalanceUsd: number;
  availableBalanceUsd: number;
};

export default function TransactionsPage() {
  const { lang } = useLang();
  const locale = getIntlLocale(lang);
  const t = getContentForLang(lang).dashboard;
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
    [locale]
  );
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [balance, setBalance] = useState<BalanceSummary>({ balanceUsd: 0, frozenBalanceUsd: 0, availableBalanceUsd: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "recharge" | "charge" | "refund" | "freeze">("all");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, totalTransactions: 0 });
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; key_prefix: string }>>([]);
  const [keyFilter, setKeyFilter] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { label: t.nav.dashboard, href: '/clawrouter/dashboard' },
      { label: t.nav.apiKeys, href: '/clawrouter/dashboard/api-keys' },
      { label: t.nav.quickStart, href: '/clawrouter/dashboard/quick-start' },
      { label: t.nav.models, href: '/clawrouter/dashboard/models' },
      { label: t.nav.usage, href: '/clawrouter/dashboard/usage' },
      { label: t.nav.transactions, href: '/clawrouter/dashboard/transactions', active: true },
      { label: t.nav.affiliate, href: '/clawrouter/dashboard/affiliate' },
      { label: t.nav.profile, href: '/clawrouter/dashboard/profile' },
    ],
    [t]
  );

  const getDateRange = useCallback((range: DateRange): { startDate: string; endDate: string } => {
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
        if (customStartDate) {
          startDate.setTime(new Date(customStartDate).getTime());
        } else {
          startDate.setDate(startDate.getDate() - 30);
        }
        if (customEndDate) {
          endDate.setTime(new Date(customEndDate).getTime());
        }
        break;
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [customStartDate, customEndDate]);

  const loadTransactions = useCallback(async (offset = 0, range?: DateRange) => {
    setLoading(true);
    try {
      const currentRange = range || dateRange;
      const { startDate, endDate } = getDateRange(currentRange);
      
      const params = new URLSearchParams({
        limit: String(pagination.limit),
        offset: String(offset),
        startDate,
        endDate,
      });
      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }
      if (keyFilter) {
        params.set("keyName", keyFilter);
      }

      const res = await fetch(`/api/usage/records?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const mapped: Transaction[] = (data.transactions || []).map((tx: any) => ({
          id: tx.id,
          txType: tx.txType,
          amount: tx.amount,
          balanceBefore: tx.balanceBefore,
          balanceAfter: tx.balanceAfter,
          status: tx.status,
          description: tx.description,
          eventId: tx.eventId,
          createdAt: tx.createdAt,
        }));

        if (offset === 0) {
          setTransactions(mapped);
        } else {
          setTransactions((prev) => [...prev, ...mapped]);
        }
        setPagination((prev) => ({
          ...prev,
          offset,
          totalTransactions: data.pagination?.totalTransactions || mapped.length,
        }));
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, pagination.limit, typeFilter, dateRange, keyFilter, getDateRange]);

  const loadApiKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/clawrouter/keys", {
        headers: { Authorization: `Bearer ${accessToken}`, "Cache-Control": "no-store" },
      });
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.keys || []);
      }
    } catch (err) {
      console.error("Failed to load API keys:", err);
    }
  }, [accessToken]);

  const loadBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/usage/summary", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.balance) {
          setBalance({
            balanceUsd: Number(data.balance.balanceUsd ?? 0),
            frozenBalanceUsd: Number(data.balance.frozenBalanceUsd ?? 0),
            availableBalanceUsd: Number(data.balance.availableBalanceUsd ?? 0),
          });
        }
      }
    } catch (err) {
      console.error("Failed to load balance:", err);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!supabase) {
      router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Ftransactions");
      return;
    }

    const client = supabase;
    let mounted = true;

    async function init() {
      for (let i = 0; i < 8; i++) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          setEmail(data.session.user.email || null);
          const token = data.session.access_token;
          setAccessToken(token);
          if (token) {
            await Promise.all([
              loadBalance(),
              loadApiKeys(),
              loadTransactions(0),
            ]);
          }
          setChecking(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Ftransactions");
      }
    }

    init();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Ftransactions");
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, loadBalance, loadApiKeys, loadTransactions]);

  // Reload when filters change
  useEffect(() => {
    if (!checking && accessToken) {
      loadTransactions(0);
    }
  }, [typeFilter, dateRange, keyFilter, checking, accessToken, loadTransactions]);

  const handleLoadMore = () => {
    if (accessToken) {
      loadTransactions(pagination.offset + pagination.limit);
    }
  };

  if (checking) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16 text-stone-600">
        {t.common.loadingTransactions}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] text-stone-950">
      {/* Mobile: Top navigation bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] flex items-center gap-3 border-b border-stone-200/60 bg-white/90 px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-stone-300 bg-white/80 p-2 text-stone-700 hover:bg-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-stone-900">{t.nav.transactions}</span>
      </div>

      {/* Mobile: Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64 h-full bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-stone-200 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
                CR
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-950">{t.common.clawRouter}</p>
                <p className="text-xs text-stone-500">{email || t.common.accountFallback}</p>
              </div>
            </div>
            <nav className="mt-5 space-y-1.5 px-3">
              {navItems.map((item) => {
                const isActive = item.active;
                if (item.href) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`block rounded-2xl px-4 py-3 text-sm ${isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <div
                    key={item.label}
                    className={`rounded-2xl px-4 py-3 text-sm ${isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
                  >
                    {item.label}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:pt-0 pt-16">
        <aside className="hidden lg:block rounded-[28px] border border-stone-300/60 bg-white/85 p-5 shadow-none">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
              CR
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-950">{t.common.clawRouter}</p>
              <p className="text-xs text-stone-500">{email || t.common.accountFallback}</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.active;
              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm ${isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div
                  key={item.label}
                  className={`rounded-2xl px-4 py-3 text-sm ${isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
                >
                  {item.label}
                </div>
              );
            })}
          </nav>
        </aside>

        <section className="space-y-6">
          {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" asChild className="px-0 text-stone-700 hover:bg-transparent hover:text-stone-950">
              <Link href="/clawrouter/dashboard">← {t.common.backToDashboard}</Link>
            </Button>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950">
              {t.transactionsPage.title}
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              {t.transactionsPage.subtitle}
            </p>
          </div>
          <Badge className="border-stone-300 bg-white/80 text-stone-700">
            {t.transactionsPage.balance.replace("{amount}", currencyFormatter.format(balance.availableBalanceUsd))}
          </Badge>
        </div>

        {/* Balance Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="rounded-[24px] border border-emerald-300/60 bg-gradient-to-br from-emerald-50/80 to-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">{t.balance.available}</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{currencyFormatter.format(balance.availableBalanceUsd)}</p>
          </Card>
          <Card className="rounded-[24px] border border-amber-300/60 bg-gradient-to-br from-amber-50/80 to-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">{t.balance.frozen}</p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">{currencyFormatter.format(balance.frozenBalanceUsd)}</p>
          </Card>
          <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{t.balance.total}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">{currencyFormatter.format(balance.balanceUsd)}</p>
          </Card>
        </div>

        {/* Transaction Table with Filters */}
        <div className="mt-6">
          <TransactionTable
            transactions={transactions}
            loading={loading}
            pagination={pagination}
            onLoadMore={handleLoadMore}
            onTypeFilterChange={setTypeFilter}
            onDateRangeChange={(range, start, end) => {
              setDateRange(range);
            }}
            onKeyFilterChange={setKeyFilter}
            typeFilter={typeFilter}
            dateRange={dateRange}
            accessToken={accessToken || undefined}
            apiKeys={apiKeys}
            keyFilter={keyFilter}
          />
        </div>
        </section>
      </div>
    </main>
  );
}
