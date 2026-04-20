"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { TransactionTable, Transaction } from "@/components/balance/TransactionTable";

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
  const [balance, setBalance] = useState<BalanceSummary>({ balanceUsd: 0, frozenBalanceUsd: 0, availableBalanceUsd: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "recharge" | "charge" | "refund" | "freeze">("all");
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, totalTransactions: 0 });

  const loadTransactions = useCallback(async (accessToken: string, offset = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(pagination.limit),
        offset: String(offset),
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
  }, [pagination.limit, typeFilter]);

  const loadBalance = useCallback(async (accessToken: string) => {
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
  }, []);

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
          const accessToken = data.session.access_token;
          if (accessToken) {
            await Promise.all([
              loadBalance(accessToken),
              loadTransactions(accessToken, 0),
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

  // Reload when filter changes
  useEffect(() => {
    if (!checking && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.access_token) {
          loadTransactions(data.session.access_token, 0);
        }
      });
    }
  }, [typeFilter, checking, supabase, loadTransactions]);

  const handleLoadMore = () => {
    if (!checking && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.access_token) {
          loadTransactions(data.session.access_token, pagination.offset + pagination.limit);
        }
      });
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

        {/* Transaction Table */}
        <div className="mt-6">
          <TransactionTable
            transactions={transactions}
            loading={loading}
            pagination={pagination}
            onLoadMore={handleLoadMore}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
          />
        </div>

        {/* Export Button */}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" className="border-stone-300">
            Export CSV (Coming soon)
          </Button>
        </div>
      </div>
    </main>
  );
}
