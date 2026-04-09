"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mapAssignedInventoryKeys, selectVisibleInventoryKeys } from "@/lib/clawrouter-dashboard";
import { getSupabaseClient } from "@/lib/supabase";

const navItems = [
  "Dashboard",
  "API Keys",
  "Quick Start",
  "Models",
  "Usage",
  "Video / Seedance 2",
  "Top-up History",
  "Affiliate",
  "Profile",
];

function buildSummaryCards(balanceUsd: number, deliveredKeyCount: number) {
  return [
    { label: "Balance", value: `$${balanceUsd.toFixed(2)}`, note: "Available credits for managed routing" },
    { label: "Total Spent", value: "$0.00", note: "All-time spend across ClawRouter" },
    { label: "Today", value: "$0.00", note: "Current-day cost" },
    { label: "Total Tokens", value: "0", note: "Input + output tokens so far" },
    { label: "Avg Cost / Req", value: "$0.00", note: "Cost efficiency will appear here" },
    { label: "API Keys", value: String(deliveredKeyCount), note: "Delivered inventory keys currently active" },
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [balanceUsd, setBalanceUsd] = useState(0);
  const [topups, setTopups] = useState<Array<{ id: string; amount_usd: number; status: string; created_at: string }>>([]);
  const [deliveredKeys, setDeliveredKeys] = useState<Array<{ id: string; deliveryMode: "managed_key" | "inventory_key"; displayName: string; provider: string; plaintextKey: string | null; keyPrefix: string | null; faceValueUsd: number | null; salePriceUsd: number | null; status: string; createdAt: string | null }>>([]);
  const [topupState, setTopupState] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [seedanceSummary, setSeedanceSummary] = useState<{ totalPurchased: number; totalRemaining: number; totalUsed: number; activeKeys: number } | null>(null);
  const [seedanceKeys, setSeedanceKeys] = useState<Array<{ id: string; key_name: string; key_prefix: string; status: string; max_uses: number; remaining_uses: number; model_scope: string[] | null; created_at: string; last_used_at: string | null }>>([]);
  const [seedanceUsage, setSeedanceUsage] = useState<Array<{ id: string; model_name: string; status: string; used_units: number; created_at: string; external_task_id: string | null }>>([]);
  const [revokingSeedanceKey, setRevokingSeedanceKey] = useState<string | null>(null);
  const [videoTopupState, setVideoTopupState] = useState<string | null>(null);
  const [videoOrderId, setVideoOrderId] = useState<string | null>(null);
  const [creatingSeedanceKey, setCreatingSeedanceKey] = useState(false);
  const [createdSeedanceKey, setCreatedSeedanceKey] = useState<string | null>(null);
  const [seedanceActionError, setSeedanceActionError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async (token: string, options?: { refreshBilling?: boolean }) => {
    const accountUrl = options?.refreshBilling
      ? "/api/clawrouter/account?refreshBilling=1"
      : "/api/clawrouter/account";

    const accountResponse = await fetch(accountUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
      cache: "no-store",
    });

    const accountPayload = await accountResponse.json().catch(() => null);

    if (accountResponse.ok && accountPayload?.ok) {
      setBalanceUsd(Number(accountPayload.account?.creditBalanceUsd || 0));
      setTopups(accountPayload.topups || []);
      const currentAssignedInventory = mapAssignedInventoryKeys(accountPayload.assignedInventoryKeys || []);
      setDeliveredKeys(
        currentAssignedInventory.length
          ? currentAssignedInventory
          : selectVisibleInventoryKeys(accountPayload.deliveredKeys || [])
      );
    }

    const [seedanceBalanceRes, seedanceKeysRes, seedanceUsageRes] = await Promise.all([
      fetch("/api/seedance/resale/balance", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
      fetch("/api/seedance/resale/list-keys", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
      fetch("/api/seedance/resale/usage", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    ]);

    const seedanceBalance = await seedanceBalanceRes.json().catch(() => null);
    if (seedanceBalanceRes.ok && seedanceBalance?.ok) {
      setSeedanceSummary(seedanceBalance.summary);
    }

    const seedanceKeysPayload = await seedanceKeysRes.json().catch(() => null);
    if (seedanceKeysRes.ok && seedanceKeysPayload?.ok) {
      setSeedanceKeys(seedanceKeysPayload.keys || []);
    }

    const seedanceUsagePayload = await seedanceUsageRes.json().catch(() => null);
    if (seedanceUsageRes.ok && seedanceUsagePayload?.ok) {
      setSeedanceUsage(seedanceUsagePayload.usage || []);
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
      setVideoTopupState(params?.get("videoTopup") || null);
      setVideoOrderId(params?.get("orderId") || null);

      for (let i = 0; i < 8; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          setEmail(data.session.user.email || null);

          const token = data.session.access_token;
          if (token) {
            setAccessToken(token);
            await loadDashboardData(token, { refreshBilling });
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
      setAccessToken(session.access_token);
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

  async function handleCopyKey(keyId: string, plaintextKey: string | null) {
    if (!plaintextKey) return;
    try {
      await navigator.clipboard.writeText(plaintextKey);
      setCopiedKeyId(keyId);
      window.setTimeout(() => setCopiedKeyId((current) => (current === keyId ? null : current)), 1500);
    } catch {
      setCopiedKeyId(null);
    }
  }

  async function handleRevokeSeedanceKey(licenseId: string) {
    if (!accessToken) return;
    setRevokingSeedanceKey(licenseId);
    try {
      await fetch("/api/seedance/resale/revoke-key", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseId }),
      });
      await loadDashboardData(accessToken);
    } finally {
      setRevokingSeedanceKey(null);
    }
  }

  async function handleCreateSeedanceKey() {
    if (!accessToken || !videoOrderId) return;
    setCreatingSeedanceKey(true);
    setSeedanceActionError(null);
    setCreatedSeedanceKey(null);
    try {
      const response = await fetch("/api/seedance/resale/create-key", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: videoOrderId }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.license?.plaintextLicense) {
        throw new Error(payload?.error || "failed_to_create_seedance_key");
      }
      setCreatedSeedanceKey(payload.license.plaintextLicense);
      await loadDashboardData(accessToken);
    } catch (error: any) {
      setSeedanceActionError(error?.message || "Failed to create video key");
    } finally {
      setCreatingSeedanceKey(false);
    }
  }

  const summaryCards = buildSummaryCards(balanceUsd, deliveredKeys.length);

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
              <Button asChild className="w-full bg-coral hover:bg-coral/90"><Link href="/clawrouter/dashboard/video/add-credits">Add Video Credits</Link></Button>
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

          {videoTopupState === "success" ? (
            <Card className="rounded-[24px] border border-coral/40 bg-coral/10 p-5 shadow-none">
              <p className="text-sm font-semibold text-stone-950">Video credits added successfully</p>
              <p className="mt-2 text-sm text-stone-700">Your Seedance video credits are ready. Create a video API key now to start generating videos.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={handleCreateSeedanceKey} disabled={creatingSeedanceKey || !videoOrderId}>
                  {creatingSeedanceKey ? "Creating key..." : "Create video key"}
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/clawrouter/dashboard/video/add-credits">Buy more video credits</Link>
                </Button>
              </div>
              {createdSeedanceKey ? (
                <div className="mt-4 rounded-2xl border border-stone-300 bg-white/90 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Your new video key</p>
                  <div className="mt-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-800 break-all">{createdSeedanceKey}</div>
                  <div className="mt-3">
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(createdSeedanceKey)}>
                      Copy key
                    </Button>
                  </div>
                </div>
              ) : null}
              {seedanceActionError ? <p className="mt-3 text-sm text-rose-700">{seedanceActionError}</p> : null}
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <Card key={card.label} className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5 shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{card.label}</p>
                <p className="mt-3 text-2xl font-semibold text-stone-950">{card.value}</p>
                <p className="mt-2 text-sm text-stone-500">{card.note}</p>
              </Card>
            ))}
          </div>

          <Card className="rounded-[28px] border border-coral/30 bg-white/90 p-6 shadow-none">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">Video / Seedance 2</p>
                <h2 className="mt-2 text-lg font-semibold text-stone-950">Sell and manage video API access separately from routing credits</h2>
                <p className="mt-2 text-sm text-stone-600">Two supported models: Seedance 2.0 and Seedance 2.0 Fast. Your users get resale keys, not your upstream Ark key.</p>
              </div>
              <Badge className="rounded-full bg-coral/10 px-3 py-1 text-coral">Independent credits</Badge>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <Card className="rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4 shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Video credits</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{seedanceSummary ? seedanceSummary.totalRemaining : 0}</p>
                <p className="mt-1 text-sm text-stone-500">Remaining video credits</p>
              </Card>
              <Card className="rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4 shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Purchased</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{seedanceSummary ? seedanceSummary.totalPurchased : 0}</p>
                <p className="mt-1 text-sm text-stone-500">All purchased credits</p>
              </Card>
              <Card className="rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4 shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Used</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{seedanceSummary ? seedanceSummary.totalUsed : 0}</p>
                <p className="mt-1 text-sm text-stone-500">Credits already consumed</p>
              </Card>
              <Card className="rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4 shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Active keys</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{seedanceSummary ? seedanceSummary.activeKeys : 0}</p>
                <p className="mt-1 text-sm text-stone-500">Seedance resale keys</p>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="rounded-[24px] border border-stone-300/60 bg-white p-5 shadow-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-950">Video API keys</p>
                    <p className="mt-1 text-sm text-stone-500">Manage your Seedance 2 resale keys.</p>
                  </div>
                  <Button asChild variant="secondary">
                    <Link href="/clawrouter/dashboard/video/add-credits">Buy video credits</Link>
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {seedanceKeys.length ? seedanceKeys.map((key) => (
                    <div key={key.id} className="rounded-2xl border border-stone-200 bg-[rgba(248,244,237,0.55)] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-stone-950">{key.key_name}</p>
                          <p className="mt-1 font-mono text-xs text-stone-500">{key.key_prefix}••••••••••••••••</p>
                          <p className="mt-2 text-xs text-stone-500">Remaining {key.remaining_uses}/{key.max_uses} · {key.status}</p>
                          <p className="mt-1 text-xs text-stone-400">Models: {(key.model_scope || []).join(", ") || "Seedance 2.0 / Fast"}</p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => handleRevokeSeedanceKey(key.id)}
                          disabled={revokingSeedanceKey === key.id || key.status !== "active"}
                        >
                          {revokingSeedanceKey === key.id ? "Revoking..." : "Revoke"}
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-6 text-sm text-stone-500">No video keys yet. Buy video credits first, then create a key.</div>
                  )}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[24px] border border-stone-300/60 bg-white p-5 shadow-none">
                  <p className="text-sm font-semibold text-stone-950">Quickstart</p>
                  <p className="mt-2 text-sm text-stone-500">Use your Seedance resale key with these two models only. 1 credit = 1 second at 720p, text-to-video only, no video input:</p>
                  <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-xs text-stone-700">
                    doubao-seedance-2-0-260128<br />
                    doubao-seedance-2-0-fast-260128
                  </div>
                  <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-xs text-stone-700 whitespace-pre-wrap break-all">
{`curl -X POST https://clawlite.ai/api/seedance/resale/use-key \
  -H "Authorization: Bearer <clawrouter_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "seedanceLicense": "sdc_live_xxx",
    "model": "doubao-seedance-2-0-260128",
    "prompt": "A cinematic neon blue claw mark materializing from particles",
    "ratio": "16:9",
    "resolution": "720p",
    "duration": 5
  }'`}
                  </div>
                </Card>

                <Card className="rounded-[24px] border border-stone-300/60 bg-white p-5 shadow-none">
                  <p className="text-sm font-semibold text-stone-950">Recent video usage</p>
                  <div className="mt-4 space-y-3">
                    {seedanceUsage.length ? seedanceUsage.slice(0, 5).map((row) => (
                      <div key={row.id} className="rounded-2xl border border-stone-200 bg-[rgba(248,244,237,0.55)] p-4">
                        <p className="text-sm font-semibold text-stone-950">{row.model_name || "Seedance task"}</p>
                        <p className="mt-1 text-xs text-stone-500">Status: {row.status} · Credits used: {row.used_units}</p>
                        <p className="mt-1 text-xs text-stone-400">Task: {row.external_task_id || "pending"}</p>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-6 text-sm text-stone-500">No video usage yet.</div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
