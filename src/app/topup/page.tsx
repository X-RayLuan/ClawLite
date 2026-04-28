"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TOPUP_AMOUNTS = [5, 10, 20] as const;
type TopupAmount = (typeof TOPUP_AMOUNTS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

async function createCheckout(accountId: string, email: string, amount: number): Promise<{ checkoutUrl: string } | null> {
  try {
    const res = await fetch("/api/installer/topup/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, email, amount }),
    });
    const payload = await res.json().catch(() => null);
    if (res.ok && payload?.ok && payload.checkoutUrl) {
      return { checkoutUrl: payload.checkoutUrl };
    }
    return null;
  } catch {
    return null;
  }
}

async function checkBalanceAfterTopup(accountId: string): Promise<number> {
  try {
    const res = await fetch(`/api/installer/topup/check-status?accountId=${encodeURIComponent(accountId)}`);
    const payload = await res.json().catch(() => null);
    if (res.ok && payload?.ok) {
      return payload.balanceUsd ?? 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function TopupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountId = searchParams.get("accountId") || "";
  const email = searchParams.get("email") || "";
  const topupStatus = searchParams.get("topup");
  const cancelledAmount = searchParams.get("amount");

  const [selectedAmount, setSelectedAmount] = useState<TopupAmount | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    if (!selectedAmount || !accountId || !email) return;
    setCheckoutError(null);
    setLoading(true);

    const result = await createCheckout(accountId, email, selectedAmount);
    if (!result) {
      setCheckoutError("Failed to create checkout session. Please try again.");
      setLoading(false);
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = result.checkoutUrl;
  }, [selectedAmount, accountId, email]);

  const handleBackToDashboard = useCallback(async () => {
    if (!accountId) {
      router.push("/dashboard");
      return;
    }

    // Check if balance was updated (user returned from successful checkout)
    const newBalance = await checkBalanceAfterTopup(accountId);
    if (newBalance > 0) {
      router.push(`/dashboard?recheck=true&accountId=${encodeURIComponent(accountId)}&email=${encodeURIComponent(email)}`);
    } else {
      router.push("/dashboard");
    }
  }, [accountId, email, router]);

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)]">
      {/* Header */}
      <div className="border-b border-stone-200/60 bg-white/90 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="font-display text-lg font-semibold text-stone-950">Add Credits</span>
          <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-800">
            Back to installer
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">

        {/* ── Success Banner ──────────────────────────────────────────────── */}
        {topupStatus === "success" && (
          <Card className="rounded-[24px] border border-emerald-300/60 bg-emerald-50/90 p-6 shadow-none">
            <Badge className="border-emerald-300/60 bg-emerald-100 text-emerald-700 mb-2">Payment received</Badge>
            <h2 className="font-display text-xl font-semibold text-emerald-900">
              Payment successful!
            </h2>
            <p className="mt-2 text-sm text-emerald-700">
              Your credits have been added to your account. Return to the installer to complete setup.
            </p>
            <div className="mt-4 flex gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBackToDashboard}>
                Continue to installer
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/clawrouter/dashboard/add-credits">View in dashboard</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* ── Cancelled Banner ───────────────────────────────────────────── */}
        {topupStatus === "cancelled" && (
          <Card className="rounded-[24px] border border-amber-300/60 bg-amber-50/80 p-6 shadow-none">
            <Badge className="border-amber-300/60 bg-amber-100 text-amber-700 mb-2">Payment cancelled</Badge>
            <h2 className="font-display text-xl font-semibold text-stone-950">
              Payment was cancelled
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              No charges were made. You can try again whenever you&apos;re ready.
            </p>
          </Card>
        )}

        {/* ── Amount Selection ────────────────────────────────────────────── */}
        <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
          <h1 className="font-display text-2xl font-semibold text-stone-950">
            Choose top-up amount
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Select how much credit you&apos;d like to add to your account.
          </p>

          <div className="mt-6 space-y-3">
            {TOPUP_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`w-full rounded-2xl border px-5 py-4 text-left transition-all ${
                  selectedAmount === amount
                    ? "border-sea bg-sea/5 ring-2 ring-sea/40"
                    : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-xl font-semibold text-stone-950">
                      {formatCurrency(amount)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {amount === 5 ? "Starter pack" : amount === 10 ? "Most popular" : "Best value"}
                    </p>
                  </div>
                  {selectedAmount === amount && (
                    <div className="h-5 w-5 rounded-full bg-sea flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {checkoutError && (
            <div className="mt-4 rounded-xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-800">
              {checkoutError}
            </div>
          )}

          <Button
            className="mt-5 w-full bg-stone-900 hover:bg-stone-800"
            disabled={!selectedAmount || loading}
            onClick={handleCheckout}
          >
            {loading ? "Redirecting to checkout..." : selectedAmount ? `Pay ${formatCurrency(selectedAmount)}` : "Select an amount"}
          </Button>

          <p className="mt-3 text-center text-xs text-stone-400">
            Secure payment powered by Stripe. You&apos;ll be redirected to complete your purchase.
          </p>
        </Card>

        {/* ── What you get ───────────────────────────────────────────────── */}
        <Card className="rounded-[24px] border border-stone-200/60 bg-stone-50/70 p-6 shadow-none">
          <h3 className="font-semibold text-stone-800">What you get</h3>
          <ul className="mt-3 space-y-2">
            {[
              "Credits never expire",
              "Use with any ClawLite supported model",
              "Balance applies instantly after payment",
              "Full API access via your personal key",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="h-4 w-4 flex-shrink-0 text-sea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
export default function TopupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading...</div></div>}>
      <TopupPageInner />
    </Suspense>
  );
}
