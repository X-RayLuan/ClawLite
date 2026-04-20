"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { TransactionTable, Transaction } from "@/components/balance/TransactionTable";

type DateRange = "7d" | "30d" | "90d" | "custom";

type BalanceSummary = {
  balanceUsd: number;
  frozenBalanceUsd: number;
  availableBalanceUsd: number;
};

export default function TransactionsPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
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
  }, [accessToken, pagination.limit, typeFilter, dateRange, getDateRange]);

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
  }, [supabase, router, loadBalance, loadTransactions]);

  // Reload when filters change
  useEffect(() => {
    if (!checking && accessToken) {
      loadTransactions(0);
    }
  }, [typeFilter, dateRange, checking, accessToken, loadTransactions]);

  const handleLoadMore = () => {
    if (accessToken) {
      loadTransactions(pagination.offset + pagination.limit);
    }
  };

  if (checking) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16 text-stone-600">
        Loading transactions...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] text-stone-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" asChild className="px-0 text-stone-700 hover:bg-transparent hover:text-stone-950">
              <Link href="/clawrouter/dashboard">← Back to Dashboard</Link>
            </Button>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950">
              Transaction History
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              View all your account balance transactions including recharges, charges, and refunds.
            </p>
          </div>
          <Badge className="border-stone-300 bg-white/80 text-stone-700">
            Balance: ${balance.availableBalanceUsd.toFixed(2)}
          </Badge>
        </div>

        {/* Balance Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="rounded-[24px] border border-emerald-300/60 bg-gradient-to-br from-emerald-50/80 to-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Available</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">${balance.availableBalanceUsd.toFixed(2)}</p>
          </Card>
          <Card className="rounded-[24px] border border-amber-300/60 bg-gradient-to-br from-amber-50/80 to-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">Frozen</p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">${balance.frozenBalanceUsd.toFixed(2)}</p>
          </Card>
          <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">${balance.balanceUsd.toFixed(2)}</p>
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
            typeFilter={typeFilter}
            dateRange={dateRange}
            accessToken={accessToken || undefined}
          />
        </div>
      </div>
    </main>
  );
}
