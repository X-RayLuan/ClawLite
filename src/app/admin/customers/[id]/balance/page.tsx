"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { TransactionTable, Transaction } from "@/components/balance/TransactionTable";

type AccountDetails = {
  id: string;
  email: string | null;
  plan: string;
  billing_status: string;
  credit_balance_usd: number;
  created_at: string;
};

type BalanceSummary = {
  balanceUsd: number;
  frozenBalanceUsd: number;
  availableBalanceUsd: number;
};

export default function AdminBalancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: customerId } = use(params);
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [balance, setBalance] = useState<BalanceSummary>({ balanceUsd: 0, frozenBalanceUsd: 0, availableBalanceUsd: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState("");
  const [adjustSuccess, setAdjustSuccess] = useState("");

  useEffect(() => {
    if (!supabase) {
      router.push("/admin/login?returnTo=/admin");
      return;
    }

    const client = supabase;
    let mounted = true;

    async function checkAdminAndLoad() {
      // Check admin auth
      const { data: { user } } = await client.auth.getUser();
      if (!user || !mounted) {
        router.push("/admin/login?returnTo=/admin");
        return;
      }

      // Load customer data
      try {
        const res = await fetch(`/api/admin/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAccount(data.account);
        }
      } catch (err) {
        console.error("Failed to load customer:", err);
      }

      // Load balance
      try {
        const res = await fetch(`/api/admin/customers/${customerId}/balance`, {
          headers: { Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBalance({
            balanceUsd: data.balance?.balanceUsd || 0,
            frozenBalanceUsd: data.balance?.frozenBalanceUsd || 0,
            availableBalanceUsd: data.balance?.availableBalanceUsd || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load balance:", err);
      }

      // Load transactions for this customer (not admin's own)
      try {
        const res = await fetch(`/api/admin/customers/${customerId}/transactions?limit=50`, {
          headers: { Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error("Failed to load transactions:", err);
      }

      setLoading(false);
    }

    checkAdminAndLoad();

    return () => { mounted = false; };
  }, [customerId, supabase, router]);

  async function handleAdjust() {
    if (!adjustAmount || !adjustReason.trim()) {
      setAdjustError("Please enter both amount and reason");
      return;
    }

    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      setAdjustError("Please enter a valid positive amount");
      return;
    }

    setAdjustLoading(true);
    setAdjustError("");
    setAdjustSuccess("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/customers/${customerId}/balance`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          amount: adjustType === "credit" ? amount : -amount,
          reason: adjustReason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to adjust balance");
      }

      setAdjustSuccess(`${adjustType === "credit" ? "Added" : "Deducted"} $${amount.toFixed(2)} successfully. New balance: $${data.newBalance?.toFixed(2)}`);
      setAdjustAmount("");
      setAdjustReason("");

      // Refresh balance
      const balanceRes = await fetch(`/api/admin/customers/${customerId}/balance`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance({
          balanceUsd: balanceData.balance?.balanceUsd || 0,
          frozenBalanceUsd: balanceData.balance?.frozenBalanceUsd || 0,
          availableBalanceUsd: balanceData.balance?.availableBalanceUsd || 0,
        });
      }
    } catch (err: any) {
      setAdjustError(err?.message || "Failed to adjust balance");
    } finally {
      setAdjustLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-stone-600">
        Loading customer details...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] text-stone-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/customers" className="text-sm text-stone-600 hover:text-stone-900">
            ← Back to Customers
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold text-stone-950">
            Balance Management
          </h1>
          {account && (
            <p className="mt-1 text-sm text-stone-600">
              Customer: {account.email || "No email"} ({account.id.slice(0, 8)}...)
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
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

            {/* Transactions */}
            <TransactionTable transactions={transactions} loading={loading} />
          </div>

          {/* Sidebar - Adjust Balance */}
          <div>
            <Card className="sticky top-8 rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
              <h2 className="text-lg font-semibold text-stone-950">Adjust Balance</h2>
              <p className="mt-1 text-sm text-stone-600">Manually credit or debit customer balance</p>

              <div className="mt-4 space-y-4">
                {/* Action Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdjustType("credit")}
                    className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      adjustType === "credit"
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Add (+)
                  </button>
                  <button
                    onClick={() => setAdjustType("debit")}
                    className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      adjustType === "debit"
                        ? "bg-red-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Deduct (−)
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm font-medium text-stone-700">Amount (USD)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-8 pr-4 text-stone-950 outline-none focus:border-stone-500"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-medium text-stone-700">Reason (Required)</label>
                  <textarea
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Enter reason for adjustment..."
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-stone-500"
                  />
                </div>

                {/* Error */}
                {adjustError && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{adjustError}</div>
                )}

                {/* Success */}
                {adjustSuccess && (
                  <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600">{adjustSuccess}</div>
                )}

                {/* Submit */}
                <Button
                  onClick={handleAdjust}
                  disabled={adjustLoading || !adjustAmount || !adjustReason.trim()}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50"
                >
                  {adjustLoading ? "Processing..." : `Confirm ${adjustType === "credit" ? "Credit" : "Debit"}`}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
