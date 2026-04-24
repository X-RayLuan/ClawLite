"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/lang-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getContentForLang, getIntlLocale } from "@/lib/content";
import { getSupabaseClient } from "@/lib/supabase";
import { PromoCodeInput } from "@/components/recharge/PromoCodeInput";

const PRICE_IDS: Record<number, string> = {
  5: "price_1TK04kLnt527OBZbk7XVPEK5",
  10: "price_1TOIkpLnt527OBZb4upTT9X2",
  20: "price_1TOIlsLnt527OBZbSRb1ZhbT",
  50: "price_1TOIpTLnt527OBZbAxPozkF5",
  100: "price_1TOIpyLnt527OBZbk3oeb51n",
};

export default function AddCreditsPage() {
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
    return <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-16 text-stone-600">{t.common.loadingAddCredits}</main>;
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
        throw new Error(t.addCreditsPage.signInAgain);
      }

      const response = await fetch("/api/clawrouter/topup/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: selectedAmount,
          priceId: PRICE_IDS[selectedAmount],
          promoCode: promoCode || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.rawMessage || payload?.error || "failed_to_create_topup_checkout");
      }

      window.location.href = payload.checkoutUrl;
    } catch (err: any) {
      setError(err?.message || t.addCreditsPage.checkoutError);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] px-4 py-10 text-stone-950 sm:px-6 lg:px-8 pt-16 lg:pt-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" asChild className="px-0 text-stone-700 hover:bg-transparent hover:text-stone-950">
            <Link href="/clawrouter/dashboard">← {t.common.backToDashboard}</Link>
          </Button>
          <Badge className="border-stone-300 bg-white/80 text-stone-700">{t.common.credits}</Badge>
        </div>

        <Card className="mt-6 rounded-[32px] border border-stone-300/60 bg-white/92 p-7 shadow-none sm:p-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-5xl">
              {t.addCreditsPage.title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
              {t.addCreditsPage.subtitle}
            </p>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-stone-700">{t.addCreditsPage.selectAmount}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {Object.entries(PRICE_IDS).map(([amount, priceId]) => {
                const amountNum = Number(amount);
                const active = selectedAmount === amountNum;
                const isRecommended = amountNum === 5;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSelectedAmount(amountNum)}
                    className={`relative rounded-2xl border px-4 py-4 text-base font-semibold transition ${
                      active
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 bg-[rgba(248,244,237,0.72)] text-stone-900 hover:border-stone-400"
                    }`}
                  >
                    {currencyFormatter.format(amountNum)}
                    {isRecommended && !active && (
                      <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {t.addCreditsPage.bestValue}
                      </span>
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
                <span className="text-stone-600">{t.addCreditsPage.originalAmount}</span>
                <span className="text-stone-500">{currencyFormatter.format(resolvedAmount)}</span>
              </div>
              {promoResult.discountType === "percentage" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600">{`${t.addCreditsPage.discount} (${promoResult.discountValue}%)`}</span>
                  <span className="text-emerald-600">-{currencyFormatter.format(resolvedAmount * (promoResult.discountValue / 100))}</span>
                </div>
              )}
              {promoResult.discountType === "fixed" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600">{t.addCreditsPage.discount}</span>
                  <span className="text-emerald-600">-{currencyFormatter.format(promoResult.discountValue)}</span>
                </div>
              )}
              {promoResult.discountType === "bonus" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600">{t.addCreditsPage.bonusCredits}</span>
                  <span className="text-emerald-600">+{currencyFormatter.format(promoResult.discountValue)}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-emerald-200 pt-2 text-base font-semibold">
                <span>{t.addCreditsPage.finalAmount}</span>
                <span className="text-emerald-700">{currencyFormatter.format(getFinalAmount())}</span>
              </div>
            </div>
          )}

          <Button
            className="mt-8 h-14 w-full rounded-2xl bg-stone-900 text-base font-semibold hover:bg-stone-800"
            disabled={resolvedAmount <= 0 || loading}
            onClick={handleCheckout}
          >
            {loading
              ? t.addCreditsPage.openingStripe
              : t.addCreditsPage.payWithStripe.replace("{amount}", currencyFormatter.format(getFinalAmount()))}
          </Button>

          {error ? <p className="mt-4 text-center text-sm text-red-600">{error}</p> : null}

          <p className="mt-4 text-center text-sm text-stone-500">
            {t.addCreditsPage.securePayment}
          </p>
        </Card>
      </div>
    </main>
  );
}
