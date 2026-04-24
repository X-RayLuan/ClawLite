"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { useLang } from "@/components/lang-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getContentForLang } from "@/lib/content";
import { getSupabaseClient } from "@/lib/supabase";

type Model = {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
};

type Quota = {
  monthlyRequests: number | null;
  monthlyTokens: number | null;
  rpmLimit: number | null;
};

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4-turbo": { input: 10, output: 30 },
  "claude-3-5-sonnet-20241022": { input: 3, output: 15 },
  "claude-3-5-haiku-20241022": { input: 0.8, output: 4 },
  "deepseek-chat": { input: 0.1, output: 0.3 },
  "deepseek-reasoner": { input: 0.55, output: 2.19 },
  "o3": { input: 10, output: 40 },
  "o4-mini": { input: 1.1, output: 4.4 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
  "gemini-1.5-pro": { input: 1.25, output: 5 },
};

export default function ModelsPage() {
  const { lang } = useLang();
  const navT = getContentForLang(lang).dashboard;
  const t = getContentForLang(lang).dashboard.modelsPage;
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navItems = useMemo(
    () => [
      { label: navT.nav.dashboard, href: "/clawrouter/dashboard" },
      { label: navT.nav.apiKeys, href: "/clawrouter/dashboard/api-keys" },
      { label: navT.nav.quickStart, href: "/clawrouter/dashboard/quick-start" },
      { label: navT.nav.models, href: "/clawrouter/dashboard/models", active: true },
      { label: navT.nav.usage, href: "/clawrouter/dashboard/usage" },
      { label: navT.nav.transactions, href: "/clawrouter/dashboard/transactions" },
      { label: navT.nav.affiliate, href: "/clawrouter/dashboard/affiliate" },
      { label: navT.nav.profile, href: "/clawrouter/dashboard/profile" },
    ],
    [navT]
  );

  const fetchModels = useCallback(
    async (accessToken: string) => {
      try {
        const res = await fetch("/api/clawrouter/models", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload?.ok) {
          setModels(payload.models || []);
          setQuota(payload.quota || null);
          setPlan(payload.plan || "free");
        } else {
          setError(t.loadError);
        }
      } catch {
        setError(t.loadError);
      } finally {
        setLoading(false);
      }
    },
    [t.loadError]
  );

  useEffect(() => {
    if (!supabase) {
      router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fmodels");
      return;
    }

    const client = supabase;
    let mounted = true;

    async function settleSession() {
      for (let i = 0; i < 8; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          setEmail(data.session.user.email || null);
          const token = data.session.access_token;
          if (token) {
            await fetchModels(token);
          }
          setChecking(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fmodels");
      }
    }

    settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fmodels");
        return;
      }
      setEmail(session.user.email || null);
      const token = session.access_token;
      if (token) {
        fetchModels(token);
      }
      setChecking(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchModels, router, supabase]);

  const groupedModels = useMemo(() => {
    const groups: Record<string, Model[]> = {
      openai: [],
      anthropic: [],
      minimax: [],
      google: [],
      deepseek: [],
    };
    for (const model of models) {
      if (groups[model.provider]) {
        groups[model.provider].push(model);
      } else {
        groups.openai.push(model);
      }
    }
    return groups;
  }, [models]);

  const providerLabels: Record<string, string> = {
    openai: t.providers.openai,
    anthropic: t.providers.anthropic,
    minimax: t.providers.minimax,
    google: t.providers.google,
    deepseek: "DeepSeek",
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  if (checking) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16 text-stone-600">
        {navT.common.loadingDashboard}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] text-stone-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-[28px] border border-stone-300/60 bg-white/85 p-5 shadow-none">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
              CR
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-950">{navT.common.clawRouter}</p>
              <p className="text-xs text-stone-500">{email || navT.common.accountFallback}</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => {
              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm ${item.active ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div
                  key={item.label}
                  className={`rounded-2xl px-4 py-3 text-sm ${item.active ? "bg-stone-900 text-white" : "text-stone-700"}`}
                >
                  {item.label}
                </div>
              );
            })}
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[32px] border border-stone-300/60 bg-white/88 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="border-stone-300 bg-[rgba(248,244,237,0.9)] text-stone-700">
                {navT.nav.models}
              </Badge>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950">
                {t.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                {t.subtitle}
              </p>
            </div>
          </div>

          {error ? (
            <Card className="rounded-[24px] border border-red-300/60 bg-red-50/90 p-5 shadow-none">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </Card>
          ) : loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5 shadow-none">
                  <div className="h-6 w-24 animate-pulse rounded bg-stone-200" />
                  <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-12 animate-pulse rounded-2xl bg-stone-100" />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : models.length === 0 ? (
            <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-8 shadow-none text-center">
              <p className="text-sm text-stone-500">{t.noModels}</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(groupedModels).map(([provider, providerModels]) => {
                if (providerModels.length === 0) return null;
                return (
                  <Card
                    key={provider}
                    className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5 shadow-none"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-600">
                        {providerLabels[provider] || provider}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {providerModels.map((model) => {
                        const pricing = MODEL_PRICING[model.id];
                        return (
                          <div
                            key={model.id}
                            className="rounded-2xl border border-stone-200 bg-[rgba(248,244,237,0.6)] p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-stone-900 truncate">{model.name}</p>
                                <p className="text-xs text-stone-400 truncate">{model.id}</p>
                              </div>
                              <Badge className="border-emerald-200 bg-emerald-50/90 text-emerald-700 shrink-0 text-xs">
                                {t.available}
                              </Badge>
                            </div>
                            {pricing && (
                              <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
                                <div>
                                  <span className="font-medium text-stone-700">{t.input}</span>
                                  <span className="ml-1">{formatPrice(pricing.input)}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-stone-700">{t.output}</span>
                                  <span className="ml-1">{formatPrice(pricing.output)}</span>
                                </div>
                                <span className="text-stone-400">{t.per1m}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {quota && (
            <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Your Quota</p>
              <div className="mt-3 flex flex-wrap gap-6">
                {quota.monthlyTokens && (
                  <div>
                    <p className="text-2xl font-semibold text-stone-950">{quota.monthlyTokens.toLocaleString()}</p>
                    <p className="text-xs text-stone-500">Monthly tokens</p>
                  </div>
                )}
                {quota.monthlyRequests && (
                  <div>
                    <p className="text-2xl font-semibold text-stone-950">{quota.monthlyRequests.toLocaleString()}</p>
                    <p className="text-xs text-stone-500">Monthly requests</p>
                  </div>
                )}
                {quota.rpmLimit && (
                  <div>
                    <p className="text-2xl font-semibold text-stone-950">{quota.rpmLimit}</p>
                    <p className="text-xs text-stone-500">Requests/minute</p>
                  </div>
                )}
                <div>
                  <p className="text-2xl font-semibold capitalize text-stone-950">{plan}</p>
                  <p className="text-xs text-stone-500">Plan</p>
                </div>
              </div>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
