"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";

const navItems = [
  "Dashboard",
  "API Keys",
  "Quick Start",
  "Models",
  "Usage",
  "Top-up History",
  "Affiliate",
  "Profile",
];

function buildSummaryCards(balanceUsd: number, activeApiKeys: number) {
  return [
    { label: "Balance", value: `$${balanceUsd.toFixed(2)}`, note: "Available credits for managed routing" },
    { label: "Total Spent", value: "$0.00", note: "All-time spend across ClawRouter" },
    { label: "Today", value: "$0.00", note: "Current-day cost" },
    { label: "Total Tokens", value: "0", note: "Input + output tokens so far" },
    { label: "Avg Cost / Req", value: "$0.00", note: "Cost efficiency will appear here" },
    { label: "API Keys", value: String(activeApiKeys), note: "Managed keys currently active" },
  ];
}

const modelRows = [
  { model: "clawrouter/auto", provider: "Managed route", status: "Default" },
  { model: "Claude / GPT / Gemini class", provider: "Provider-routed", status: "Available" },
  { model: "BYOK fallback", provider: "Manual provider path", status: "Optional" },
];

const requestRows = [
  { time: "No requests yet", model: "—", provider: "—", cost: "$0.00" },
  { time: "Top up first", model: "—", provider: "—", cost: "$0.00" },
];

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
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [balanceUsd, setBalanceUsd] = useState(0);
  const [activeApiKeys, setActiveApiKeys] = useState(0);
  const [topups, setTopups] = useState<Array<{ id: string; amount_usd: number; status: string; created_at: string }>>([]);
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; keyPrefix: string; status: string; createdAt: string | null; plaintextSecret?: string | null }>>([]);
  const [topupState, setTopupState] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [keyError, setKeyError] = useState("");

  const loadDashboardData = useCallback(async (accessToken: string) => {
    const [accountResponse, keysResponse] = await Promise.all([
      fetch("/api/clawrouter/account", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
        cache: "no-store",
      }),
      fetch("/api/clawrouter/keys", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
        cache: "no-store",
      }),
    ]);

    const accountPayload = await accountResponse.json().catch(() => null);
    const keysPayload = await keysResponse.json().catch(() => null);

    if (accountResponse.ok && accountPayload?.ok) {
      setBalanceUsd(Number(accountPayload.account?.creditBalanceUsd || 0));
      setActiveApiKeys(Number(accountPayload.account?.activeApiKeys || 0));
      setTopups(accountPayload.topups || []);
    }

    if (keysResponse.ok && keysPayload?.ok) {
      setApiKeys(keysPayload.keys || []);
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
      for (let i = 0; i < 8; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          setEmail(data.session.user.email || null);

          const accessToken = data.session.access_token;
          if (accessToken) {
            await loadDashboardData(accessToken);
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
    return <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16 text-stone-600">Loading ClawRouter dashboard…</main>;
  }

  async function handleGenerateKey() {
    if (!supabase) return;
    setCreatingKey(true);
    setKeyError("");
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Please sign in again.");
      const response = await fetch("/api/clawrouter/keys", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || "failed_to_create_key");
      await loadDashboardData(accessToken);
      if (payload?.key) {
        setApiKeys((prev) => {
          const next = [payload.key, ...prev.filter((item) => item.id !== payload.key.id)];
          return next;
        });
      }
    } catch (error: any) {
      setKeyError(error?.message || "Failed to generate API key.");
    } finally {
      setCreatingKey(false);
    }
  }

  const summaryCards = buildSummaryCards(balanceUsd, activeApiKeys);

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] text-stone-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-[28px] border border-stone-300/60 bg-white/85 p-5 shadow-none">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
              CR
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-950">ClawRouter</p>
              <p className="text-xs text-stone-500">{email || "account"}</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5">
            {navItems.map((item, index) => (
              <div
                key={item}
                className={`rounded-2xl px-4 py-3 text-sm ${index === 0 ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="mt-6 rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Quick actions</p>
            <div className="mt-3 space-y-2">
              <Button asChild className="w-full bg-stone-900 hover:bg-stone-800"><Link href="/clawrouter/dashboard/add-credits">Add Credits</Link></Button>
              <Button
                variant="secondary"
                className="w-full border-stone-300 bg-white/80 text-stone-900 hover:bg-white"
                onClick={handleGenerateKey}
                disabled={creatingKey}
              >
                {creatingKey ? "Generating…" : "Generate API Key"}
              </Button>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          {topupState === "success" ? (
            <Card className="rounded-[24px] border border-emerald-300/60 bg-emerald-50/90 p-5 shadow-none">
              <p className="text-sm font-semibold text-emerald-900">Credits added successfully</p>
              <p className="mt-2 text-sm text-emerald-800">
                Stripe checkout returned successfully{topupAmount ? ` for $${topupAmount}` : ""}. If the balance below hasn’t updated yet, refresh once after the webhook settles.
              </p>
            </Card>
          ) : null}

          <div className="flex flex-col gap-4 rounded-[32px] border border-stone-300/60 bg-white/88 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="border-stone-300 bg-[rgba(248,244,237,0.9)] text-stone-700">Dashboard</Badge>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950">
                ClawRouter account workspace
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                This is the logged-in surface after “Get ClawRouter Access”: add credits, manage API keys, inspect available models, and track spend and usage in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-stone-900 hover:bg-stone-800"><Link href="/clawrouter/dashboard/add-credits">Add Credits</Link></Button>
              <Button variant="secondary" asChild className="border-stone-300 bg-white/80 text-stone-900 hover:bg-white">
                <Link href="/clawrouter">Back to sales page</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <Card key={card.label} className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5 shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{card.label}</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">{card.value}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{card.note}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartShell title="Usage by Model" subtitle="Breakdown appears here once requests start flowing through ClawRouter." />
            <ChartShell title="Usage by Provider" subtitle="Provider mix, spend share, and routing distribution will render here." />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">API Keys</p>
                  <h2 className="mt-2 text-xl font-semibold text-stone-950">Managed access keys</h2>
                </div>
                <Button className="bg-stone-900 hover:bg-stone-800" onClick={handleGenerateKey} disabled={creatingKey}>
                  {creatingKey ? "Generating…" : "Generate API Key"}
                </Button>
              </div>
              <div className="mt-5 rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.72)] p-4">
                {apiKeys.length ? (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="rounded-2xl bg-white/75 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-stone-950">{key.name}</p>
                            <p className="text-xs text-stone-500">{key.keyPrefix}••••••••</p>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">{key.status}</span>
                        </div>
                        {key.plaintextSecret ? (
                          <p className="mt-2 break-all text-xs text-emerald-700">New key: {key.plaintextSecret}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-stone-950">No active key displayed yet</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      After payment and activation, the first managed key should appear here. Long-term UX should reveal plaintext only once, then keep only key prefix and metadata visible.
                    </p>
                  </>
                )}
                {keyError ? <p className="mt-3 text-sm text-red-600">{keyError}</p> : null}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Models</p>
              <h2 className="mt-2 text-xl font-semibold text-stone-950">Available lanes</h2>
              <div className="mt-4 space-y-3">
                {modelRows.map((row) => (
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Top-up History</p>
              <div className="mt-5 space-y-3 rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.72)] p-4">
                {topups.length ? topups.map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-3 text-sm text-stone-800">
                    <div>
                      <p className="font-medium text-stone-950">${Number(row.amount_usd || 0).toFixed(2)} top-up</p>
                      <p className="text-xs text-stone-500">{new Date(row.created_at).toLocaleString()}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">{row.status}</span>
                  </div>
                )) : (
                  <p className="text-sm text-stone-600">No completed top-ups yet.</p>
                )}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Recent requests</p>
              <div className="mt-4 overflow-hidden rounded-[22px] border border-stone-200">
                <div className="grid grid-cols-[1.2fr_1fr_1fr_0.7fr] bg-[rgba(248,244,237,0.85)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  <span>Time</span>
                  <span>Model</span>
                  <span>Provider</span>
                  <span>Cost</span>
                </div>
                {requestRows.map((row, index) => (
                  <div key={index} className="grid grid-cols-[1.2fr_1fr_1fr_0.7fr] border-t border-stone-200 px-4 py-3 text-sm text-stone-700">
                    <span>{row.time}</span>
                    <span>{row.model}</span>
                    <span>{row.provider}</span>
                    <span>{row.cost}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
