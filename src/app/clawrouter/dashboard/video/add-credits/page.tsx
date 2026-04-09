"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";

const plans = [
  { sku: "seedance_fast_20", name: "Seedance 2 Fast", credits: 20, price: 5, note: "$1 = 4 credits · 1 credit = 1 second at 720p" },
  { sku: "seedance_fast_40", name: "Seedance 2 Fast", credits: 40, price: 10, note: "$1 = 4 credits · Best for fast iterations" },
  { sku: "seedance_pro_15", name: "Seedance 2.0", credits: 15, price: 5, note: "$1 = 3 credits · 1 credit = 1 second at 720p" },
  { sku: "seedance_pro_30", name: "Seedance 2.0", credits: 30, price: 10, note: "$1 = 3 credits · Higher quality generations" },
];

export default function SeedanceAddCreditsPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loadingSku, setLoadingSku] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(sku: string) {
    setLoadingSku(sku);
    setError(null);
    try {
      if (!supabase) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fvideo%2Fadd-credits");
        return;
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fvideo%2Fadd-credits");
        return;
      }

      const response = await fetch("/api/seedance/resale/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sku }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || "failed_to_create_seedance_checkout");
      }

      window.location.href = payload.checkoutUrl;
    } catch (err: any) {
      setError(err?.message || "Failed to start checkout");
      setLoadingSku(null);
    }
  }

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] px-4 py-10 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">Video / Seedance 2</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">Add Video Credits</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">Buy independent video credits for Seedance 2.0 and Seedance 2.0 Fast. 1 credit = 1 second of 720p text-to-video generation (no video input). These credits are separate from your managed routing balance.</p>
        </div>

        {error ? (
          <Card className="rounded-[24px] border border-rose-300/60 bg-rose-50/90 p-5 shadow-none">
            <p className="text-sm font-semibold text-rose-900">Failed to start checkout</p>
            <p className="mt-2 text-sm text-rose-700">{error}</p>
          </Card>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Card key={plan.sku} className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{plan.name}</p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">${plan.price}</p>
              <p className="mt-1 text-sm text-stone-500">{plan.credits} video credits</p>
              <p className="mt-4 text-sm text-stone-600">{plan.note}</p>
              <Button className="mt-6 w-full" onClick={() => handleCheckout(plan.sku)} disabled={loadingSku === plan.sku}>
                {loadingSku === plan.sku ? "Redirecting..." : "Buy now"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
