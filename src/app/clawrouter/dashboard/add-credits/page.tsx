"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { PromoCodeInput } from "@/components/recharge/PromoCodeInput";

const presetAmounts = [
  { amount: 5, enabled: true, recommended: true },
  { amount: 10, enabled: false, recommended: false },
  { amount: 20, enabled: false, recommended: false },
  { amount: 50, enabled: false, recommended: false },
  { amount: 100, enabled: false, recommended: false },
];

export default function AddCreditsPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [checking, setChecking] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fadd-credits");
      return;
    }

    const client = supabase;
    let mounted = true;

    async function settleSession() {
      for (let i = 0; i < 8; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          setChecking(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fadd-credits");
      }
    }

    settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fadd-credits");
      }

      setChecking(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (checking) {
    return <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-16 text-stone-600">Loading add credits…</main>;
  }

  const resolvedAmount = selectedAmount;

  // Calculate final amount with promo
  const getFinalAmount = () => {
    if (promoResult?.valid && promoResult?.discountType === "percentage") {
      return resolvedAmount * (1 - (promoResult.discountValue || 0) / 100);
    }
    if (promoResult?.valid && promoResult?.discountType === "fixed") {
      return Math.max(0, resolvedAmount - (promoResult.discountValue || 0));
    }
    return resolvedAmount;
  };

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData } = await supabase!.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch("/api/clawrouter/topup/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: getFinalAmount(),
          promoCode: promoCode || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.rawMessage || payload?.error || "failed_to_create_topup_checkout");
      }

      window.location.href = payload.checkoutUrl;
    } catch (err: any) {
      setError(err?.message || "Could not create Stripe checkout session.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] px-4 py-10 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" asChild className="px-0 text-stone-700 hover:bg-transparent hover:text-stone-950">
            <Link href="/clawrouter/dashboard">← Back to Dashboard</Link>
          </Button>
          <Badge className="border-stone-300 bg-white/80 text-stone-700">Credits</Badge>
        </div>

        <Card className="mt-6 rounded-[32px] border border-stone-300/60 bg-white/92 p-7 shadow-none sm:p-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-5xl">
              Add Credits
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
              Select a top-up amount to add credits to your ClawRouter account. Credits never expire and can be used for API requests across all supported models.
            </p>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-stone-700">Select Amount</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {presetAmounts.map((preset) => {
                const active = selectedAmount === preset.amount;
                return (
                  <button
                    key={preset.amount}
                    type="button"
                    onClick={() => {
                      if (!preset.enabled) return;
                      setSelectedAmount(preset.amount);
                    }}
                    disabled={!preset.enabled}
                    className={`relative rounded-2xl border px-4 py-4 text-base font-semibold transition ${
                      active
                        ? "border-stone-900 bg-stone-900 text-white"
                        : preset.enabled
                          ? "border-stone-300 bg-[rgba(248,244,237,0.72)] text-stone-900 hover:border-stone-400"
                          : "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                    }`}
                  >
                    ${preset.amount}
                    {preset.recommended && !active && (
                      <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Best
                      </span>
                    )}
                    {!preset.enabled && (
                      <span className="mt-1 block text-xs font-normal">Coming soon</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <PromoCodeInput
            onValidChange={(code, result) => {
              setPromoCode(code);
              setPromoResult(result);
            }}
          />

          {/* Order Summary */}
          {promoResult?.valid && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Original amount</span>
                <span className="text-stone-500">${resolvedAmount.toFixed(2)}</span>
              </div>
              {promoResult.discountType === "percentage" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600">Discount ({promoResult.discountValue}%)</span>
                  <span className="text-emerald-600">-${(resolvedAmount * (promoResult.discountValue / 100)).toFixed(2)}</span>
                </div>
              )}
              {promoResult.discountType === "fixed" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600">Discount</span>
                  <span className="text-emerald-600">-${promoResult.discountValue.toFixed(2)}</span>
                </div>
              )}
              {promoResult.discountType === "bonus" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600">Bonus credits</span>
                  <span className="text-emerald-600">+${promoResult.discountValue.toFixed(2)}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-emerald-200 pt-2 text-base font-semibold">
                <span>Final amount</span>
                <span className="text-emerald-700">${getFinalAmount().toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            className="mt-8 h-14 w-full rounded-2xl bg-stone-900 text-base font-semibold hover:bg-stone-800"
            disabled={resolvedAmount <= 0 || loading}
            onClick={handleCheckout}
          >
            {loading ? "Opening Stripe…" : `Pay $${getFinalAmount().toFixed(2)} with Stripe`}
          </Button>

          {error ? <p className="mt-4 text-center text-sm text-red-600">{error}</p> : null}

          <p className="mt-4 text-center text-sm text-stone-500">
            Secure payment via Stripe. Credits never expire.
          </p>
        </Card>
      </div>
    </main>
  );
}
