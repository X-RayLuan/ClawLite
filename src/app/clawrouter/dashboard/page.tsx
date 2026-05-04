"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { useLang } from "@/components/lang-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getContentForLang, getIntlLocale } from "@/lib/content";
import { getSupabaseClient } from "@/lib/supabase";

import { ApiKeyCard } from "./components/ApiKeyCard";
import { BalanceAlert } from "@/components/balance/BalanceAlert";

type BalanceSummary = {
  balanceUsd: number;
  frozenBalanceUsd: number;
  availableBalanceUsd: number;
};

type UsageSummary = {
  totalRequests: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCost: number;
  todayCost: number;
  lastRequestAt: string | null;
};

type UsageEvent = {
  id: string;
  key_name: string | null;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost: number | null;
  status: string;
  created_at: string;
};

type DashboardContent = ReturnType<typeof getContentForLang>["dashboard"];

function interpolate(template: string, values: Record<string, string | number>) {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

function formatTopupStatus(status: string, t: DashboardContent) {
  if (status === "completed") {
    return t.common.statusCompleted;
  }
  if (status === "pending") {
    return t.common.statusPending;
  }
  if (status === "failed") {
    return t.common.statusFailed;
  }
  if (status === "frozen") {
    return t.common.statusFrozen;
  }
  return status;
}

function BalanceBadge({
  amount,
  formatCurrency
}: {
  amount: number;
  formatCurrency: (value: number) => string;
}) {
  if (amount < 0.1) {
    return <span className="text-red-500 font-semibold">{formatCurrency(amount)}</span>;
  }
  if (amount < 1) {
    return <span className="text-orange-500 font-semibold">{formatCurrency(amount)}</span>;
  }
  return <span className="text-stone-950">{formatCurrency(amount)}</span>;
}

function BalanceCard({
  balance,
  t,
  formatCurrency
}: {
  balance: BalanceSummary;
  t: DashboardContent;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="rounded-[24px] border border-emerald-300/60 bg-gradient-to-br from-emerald-50/80 to-white/90 p-5 shadow-none">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">{t.balance.available}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
          <BalanceBadge amount={balance.availableBalanceUsd} formatCurrency={formatCurrency} />
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">{t.balance.availableDescription}</p>
      </Card>
      <Card className="rounded-[24px] border border-amber-300/60 bg-gradient-to-br from-amber-50/80 to-white/90 p-5 shadow-none">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">{t.balance.frozen}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-amber-700">
          {formatCurrency(balance.frozenBalanceUsd)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">{t.balance.frozenDescription}</p>
      </Card>
      <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5 shadow-none">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{t.balance.totalBalance}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
          {formatCurrency(balance.balanceUsd)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">{t.balance.totalBalanceDescription}</p>
      </Card>
    </div>
  );
}

function buildSummaryCards(
  activeApiKeyCount: number,
  usage: UsageSummary,
  t: DashboardContent,
  formatCurrencyPrecise: (value: number) => string,
  formatNumber: (value: number) => string
) {
  const avgCostPerReq = usage.totalRequests > 0 ? usage.totalCost / usage.totalRequests : 0;
  return [
    { label: t.summary.totalSpent, value: formatCurrencyPrecise(usage.totalCost), note: t.summary.totalSpentNote },
    { label: t.summary.today, value: formatCurrencyPrecise(usage.todayCost), note: t.summary.todayNote },
    { label: t.summary.totalTokens, value: formatNumber(usage.totalTokensIn + usage.totalTokensOut), note: t.summary.totalTokensNote },
    { label: t.summary.avgCostPerRequest, value: formatCurrencyPrecise(avgCostPerReq), note: t.summary.avgCostPerRequestNote },
    { label: t.summary.apiKeys, value: formatNumber(activeApiKeyCount), note: t.summary.apiKeysNote },
  ];
}

function UsageRow({
  event,
  formatDateTime,
  formatCurrencyPrecise
}: {
  event: UsageEvent;
  formatDateTime: (value: string) => string;
  formatCurrencyPrecise: (value: number) => string;
}) {
  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr_0.7fr] border-t border-stone-200 px-4 py-3 text-sm text-stone-700">
      <span>{formatDateTime(event.created_at)}</span>
      <span className="font-medium">{event.model}</span>
      <span>{event.key_name ? `${event.key_name.slice(0, 8)}…` : "—"}</span>
      <span className={event.cost && event.cost > 0 ? "text-red-600" : "text-stone-600"}>
        {event.cost != null ? `-${formatCurrencyPrecise(event.cost)}` : formatCurrencyPrecise(0)}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr_0.7fr] border-t border-stone-200 px-4 py-6 text-sm text-stone-500">
      <span>{message}</span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

function ChartShell({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{title}</p>
      <p className="mt-2 text-sm text-stone-600">{subtitle}</p>
      <div className="mt-6 grid h-52 grid-cols-8 items-end gap-2 rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.75)] p-4">
        {[28, 44, 36, 64, 40, 52, 34, 58].map((height, index) => (
          <div key={index} className="rounded-full bg-stone-900/85" style={{ height: `${height}%` }} />
        ))}
      </div>
    </Card>
  );
}

export default function ClawRouterDashboardPage() {
  const { lang } = useLang();
  const locale = getIntlLocale(lang);
  const t = getContentForLang(lang).dashboard;
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const navItems = useMemo(
    () => [
      { label: t.nav.dashboard, href: "/clawrouter/dashboard" },
      { label: t.nav.apiKeys, href: "/clawrouter/dashboard/api-keys" },
      { label: t.nav.quickStart, href: "/clawrouter/dashboard/quick-start" },
      { label: t.nav.models, href: "/clawrouter/dashboard/models" },
      { label: t.nav.usage, href: "/clawrouter/dashboard/usage" },
      { label: t.nav.transactions, href: "/clawrouter/dashboard/transactions" },
      { label: t.nav.affiliate, href: "/clawrouter/dashboard/affiliate" },
      { label: t.nav.profile, href: "/clawrouter/dashboard/profile" }
    ],
    [t]
  );
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
  const preciseCurrencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      }),
    [locale]
  );
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale]
  );
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [balance, setBalance] = useState<BalanceSummary>({ balanceUsd: 0, frozenBalanceUsd: 0, availableBalanceUsd: 0 });
  const [usageSummary, setUsageSummary] = useState<UsageSummary>({ totalRequests: 0, totalTokensIn: 0, totalTokensOut: 0, totalCost: 0, todayCost: 0, lastRequestAt: null });
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const [activeApiKeys, setActiveApiKeys] = useState(0);
  const [topups, setTopups] = useState<Array<{ id: string; amount_usd: number; status: string; created_at: string }>>([]);
  const [topupState, setTopupState] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadDashboardData = useCallback(async (accessToken: string, options?: { refreshBilling?: boolean }) => {
    const accountUrl = options?.refreshBilling
      ? "/api/clawrouter/account?refreshBilling=1"
      : "/api/clawrouter/account";

    const accountResponse = await fetch(accountUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Cache-Control": "no-store",
      },
      cache: "no-store",
    });

    const accountPayload = await accountResponse.json().catch(() => null);

    if (accountResponse.ok && accountPayload?.ok) {
      setTopups(accountPayload.topups || []);
      setActiveApiKeys(Number(accountPayload.account?.activeApiKeys || 0));
    }

    // Fetch balance and usage from new usage summary API
    try {
      const summaryRes = await fetch("/api/usage/summary", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
        cache: "no-store",
      });
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json().catch(() => null);
        if (summaryData?.balance) {
          setBalance({
            balanceUsd: Number(summaryData.balance.balanceUsd ?? 0),
            frozenBalanceUsd: Number(summaryData.balance.frozenBalanceUsd ?? 0),
            availableBalanceUsd: Number(summaryData.balance.availableBalanceUsd ?? 0),
          });
        }
        if (summaryData?.summary) {
          setUsageSummary({
            totalRequests: Number(summaryData.summary.totalRequests ?? 0),
            totalTokensIn: Number(summaryData.summary.totalTokensIn ?? 0),
            totalTokensOut: Number(summaryData.summary.totalTokensOut ?? 0),
            totalCost: Number(summaryData.summary.totalCost ?? 0),
            todayCost: Number(summaryData.summary.todayCost ?? 0),
            lastRequestAt: summaryData.summary.lastRequestAt ?? null,
          });
        }
      } else if (accountResponse.ok && accountPayload?.ok) {
        setBalance((prev) => ({
          ...prev,
          balanceUsd: Number(accountPayload.account?.creditBalanceUsd || 0),
          availableBalanceUsd: Number(accountPayload.account?.creditBalanceUsd || 0),
        }));
      }

      // Fetch real usage events for recent requests table
      try {
        const recordsRes = await fetch("/api/usage/records?limit=10", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });
        if (recordsRes.ok) {
          const recordsData = await recordsRes.json().catch(() => null);
          if (recordsData?.usageEvents && Array.isArray(recordsData.usageEvents)) {
            setUsageEvents(recordsData.usageEvents.slice(0, 10));
          }
        }
      } catch {
        // Silently fail for usage events
      }
    } catch {
      // Fall back to account balance if usage summary fails
      if (accountResponse.ok && accountPayload?.ok) {
        setBalance((prev) => ({
          ...prev,
          balanceUsd: Number(accountPayload.account?.creditBalanceUsd || 0),
          availableBalanceUsd: Number(accountPayload.account?.creditBalanceUsd || 0),
        }));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setTopupState(params.get("topup"));
      setTopupAmount(params.get("amount"));
    }

    if (!supabase) {
      router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard");
      return;
    }

    const client = supabase;
    let mounted = true;

    async function settleSession() {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const refreshBilling = params?.get("topup") === "success";

      for (let i = 0; i < 8; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          setEmail(data.session.user.email || null);

          const accessToken = data.session.access_token;
          if (accessToken) {
            await loadDashboardData(accessToken, { refreshBilling });
          }

          setChecking(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard");
      }
    }

    settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard");
        return;
      }

      setEmail(session.user.email || null);
      setChecking(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadDashboardData, router, supabase]);

  if (checking) {
    return <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16 text-stone-600">{t.common.loadingDashboard}</main>;
  }

  const summaryCards = buildSummaryCards(
    activeApiKeys,
    usageSummary,
    t,
    (value) => preciseCurrencyFormatter.format(value),
    (value) => numberFormatter.format(value)
  );
  const formattedTopupAmount =
    topupAmount && Number.isFinite(Number(topupAmount)) ? currencyFormatter.format(Number(topupAmount)) : topupAmount;
  const successAmount = formattedTopupAmount
    ? interpolate(t.page.topupSuccessAmount, { amount: formattedTopupAmount })
    : "";

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
        <span className="font-semibold text-stone-900">{t.nav.dashboard}</span>
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
              {navItems.map((item, index) => {
                const isActive = index === 0;
                if (item.href) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`block rounded-2xl px-4 py-3 text-sm ${isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <div
                    key={item.label}
                    className={`rounded-2xl px-4 py-3 text-sm ${isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}
                  >
                    {item.label}
                  </div>
                );
              })}
            </nav>
            <div className="mt-6 mx-3 rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{t.common.quickActions}</p>
              <div className="mt-3 space-y-2">
                <Button asChild className="w-full bg-stone-900 hover:bg-stone-800">
                  <Link href="/clawrouter/dashboard/add-credits" onClick={() => setSidebarOpen(false)}>{t.common.addCredits}</Link>
                </Button>
                <div className="w-full rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-center text-sm text-stone-600">
                  {t.page.quickActionsHint}
                </div>
              </div>
            </div>
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
            {navItems.map((item, index) => {
              const isActive = index === 0;
              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm ${isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div
                  key={item.label}
                  className={`rounded-2xl px-4 py-3 text-sm ${isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}
                >
                  {item.label}
                </div>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{t.common.quickActions}</p>
            <div className="mt-3 space-y-2">
              <Button asChild className="w-full bg-stone-900 hover:bg-stone-800">
                <Link href="/clawrouter/dashboard/add-credits">{t.common.addCredits}</Link>
              </Button>
              <div className="w-full rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-center text-sm text-stone-600">
                {t.page.quickActionsHint}
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          {topupState === "success" ? (
            <Card className="rounded-[24px] border border-emerald-300/60 bg-emerald-50/90 p-5 shadow-none">
              <p className="text-sm font-semibold text-emerald-900">{t.page.topupSuccessTitle}</p>
              <p className="mt-2 text-sm text-emerald-800">
                {interpolate(t.page.topupSuccessBody, { amount: successAmount })}
              </p>
            </Card>
          ) : null}

          <BalanceAlert
            availableBalanceUsd={balance.availableBalanceUsd}
            frozenBalanceUsd={balance.frozenBalanceUsd}
          />

          <div className="flex flex-col gap-4 rounded-[32px] border border-stone-300/60 bg-white/88 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="border-stone-300 bg-[rgba(248,244,237,0.9)] text-stone-700">{t.common.dashboard}</Badge>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950">
                {t.page.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                {t.page.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-stone-900 hover:bg-stone-800">
                <Link href="/clawrouter/dashboard/add-credits">{t.common.addCredits}</Link>
              </Button>
              <Button variant="secondary" asChild className="border-stone-300 bg-white/80 text-stone-900 hover:bg-white">
                <Link href="/clawrouter">{t.common.backToSalesPage}</Link>
              </Button>
            </div>
          </div>

          <BalanceCard balance={balance} t={t} formatCurrency={(value) => currencyFormatter.format(value)} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <Card key={card.label} className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5 shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{card.label}</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">{card.value}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{card.note}</p>
              </Card>
            ))}
          </div>

          <ApiKeyCard />

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartShell title={t.page.usageByModelTitle} subtitle={t.page.usageByModelSubtitle} />
            <ChartShell title={t.page.usageByProviderTitle} subtitle={t.page.usageByProviderSubtitle} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{t.page.modelsLabel}</p>
              <h2 className="mt-2 text-xl font-semibold text-stone-950">{t.page.modelsTitle}</h2>
              <div className="mt-4 space-y-3">
                {t.page.modelRows.map((row) => (
                  <div key={row.model} className="rounded-[20px] border border-stone-200 bg-[rgba(248,244,237,0.7)] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-stone-950">{row.model}</p>
                        <p className="text-xs text-stone-500">{row.provider}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">{row.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{t.page.topupHistoryTitle}</p>
              <div className="mt-5 space-y-3 rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.72)] p-4">
                {topups.length ? topups.map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-3 text-sm text-stone-800">
                    <div>
                      <p className="font-medium text-stone-950">{`${currencyFormatter.format(Number(row.amount_usd || 0))} ${t.common.topUp}`}</p>
                      <p className="text-xs text-stone-500">{dateTimeFormatter.format(new Date(row.created_at))}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
                      {formatTopupStatus(row.status, t)}
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-stone-600">{t.page.noTopupsYet}</p>
                )}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{t.page.recentRequestsTitle}</p>
              <div className="mt-4 overflow-hidden rounded-[22px] border border-stone-200">
                <div className="grid grid-cols-[1.2fr_1fr_1fr_0.7fr] bg-[rgba(248,244,237,0.85)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  <span>{t.page.recentRequestsHeaders.time}</span>
                  <span>{t.page.recentRequestsHeaders.model}</span>
                  <span>{t.page.recentRequestsHeaders.key}</span>
                  <span>{t.page.recentRequestsHeaders.cost}</span>
                </div>
                {usageEvents.length > 0 ? (
                  usageEvents.map((event) => (
                    <UsageRow
                      key={event.id}
                      event={event}
                      formatDateTime={(value) => dateTimeFormatter.format(new Date(value))}
                      formatCurrencyPrecise={(value) => preciseCurrencyFormatter.format(value)}
                    />
                  ))
                ) : (
                  <EmptyState message={t.page.recentRequestsEmpty} />
                )}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
