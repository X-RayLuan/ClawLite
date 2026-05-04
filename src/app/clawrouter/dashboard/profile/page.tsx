"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { useLang } from "@/components/lang-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getContentForLang, getIntlLocale } from "@/lib/content";
import { getSupabaseClient } from "@/lib/supabase";

type AccountInfo = {
  id: string;
  email: string | null;
  plan: string;
  billingStatus: string;
  creditBalanceUsd: number;
  activeApiKeys: number;
  displayName?: string;
};

export default function ProfilePage() {
  const { lang } = useLang();
  const locale = getIntlLocale(lang);
  const navT = getContentForLang(lang).dashboard;
  const t = getContentForLang(lang).dashboard.profilePage;
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);

  const navItems = useMemo(
    () => [
      { label: navT.nav.dashboard, href: "/clawrouter/dashboard" },
      { label: navT.nav.apiKeys, href: "/clawrouter/dashboard/api-keys" },
      { label: navT.nav.quickStart, href: "/clawrouter/dashboard/quick-start" },
      { label: navT.nav.models, href: "/clawrouter/dashboard/models" },
      { label: navT.nav.usage, href: "/clawrouter/dashboard/usage" },
      { label: navT.nav.transactions, href: "/clawrouter/dashboard/transactions" },
      { label: navT.nav.affiliate, href: "/clawrouter/dashboard/affiliate" },
      { label: navT.nav.profile, href: "/clawrouter/dashboard/profile", active: true },
    ],
    [navT]
  );

  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale]
  );

  const fetchAccount = useCallback(
    async (accessToken: string) => {
      try {
        const res = await fetch("/api/clawrouter/account", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload?.ok) {
          setAccount(payload.account || null);
          setDisplayName(payload.account?.displayName || "");
          setEmail(payload.account?.email || null);
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
      router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fprofile");
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
            await fetchAccount(token);
          }
          setChecking(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fprofile");
      }
    }

    settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fprofile");
        return;
      }
      setEmail(session.user.email || null);
      const token = session.access_token;
      if (token) {
        fetchAccount(token);
      }
      setChecking(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchAccount, router, supabase]);

  const handleUpdateDisplayName = useCallback(
    async (accessToken: string) => {
      setUpdating(true);
      setError(null);
      setUpdateSuccess(false);
      try {
        const res = await fetch("/api/clawrouter/account", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
          body: JSON.stringify({ display_name: displayName }),
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload?.ok) {
          setUpdateSuccess(true);
          setAccount((prev) => (prev ? { ...prev, displayName } : prev));
        } else {
          setError(t.updateError);
        }
      } catch {
        setError(t.updateError);
      } finally {
        setUpdating(false);
      }
    },
    [displayName, t.updateError]
  );

  if (checking) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16 text-stone-600">
        {navT.common.loadingDashboard}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] text-stone-950">
      {/* Mobile: Top navigation bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] flex items-center gap-3 border-b border-stone-200/60 bg-white/90 px-4 py-3">
        <Link
          href="/clawrouter/dashboard"
          className="rounded-xl border border-stone-300 bg-white/80 p-2 text-stone-700 hover:bg-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="font-semibold text-stone-900">{navT.nav.profile}</span>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:pt-0 pt-16">
        <aside className="hidden lg:block rounded-[28px] border border-stone-300/60 bg-white/85 p-5 shadow-none">
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
                {navT.nav.profile}
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
          ) : null}

          {updateSuccess ? (
            <Card className="rounded-[24px] border border-emerald-300/60 bg-emerald-50/90 p-5 shadow-none">
              <p className="text-sm font-medium text-emerald-800">{t.updateSuccess}</p>
            </Card>
          ) : null}

          {/* Basic Info */}
          <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              {t.basicInfo}
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{t.email}</p>
                  <p className="mt-1 text-sm text-stone-900">{email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{t.accountId}</p>
                  <p className="mt-1 truncate font-mono text-sm text-stone-900">{account?.id || "—"}</p>
                </div>
              </div>
              {account?.plan && (
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">Plan</p>
                    <p className="mt-1 text-sm capitalize text-stone-900">{account.plan}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Display Name */}
          <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              {t.displayName}
            </p>
            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <Input
                  placeholder={t.displayNamePlaceholder}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      supabase?.auth.getSession().then(({ data }) => {
                        if (data.session?.access_token) {
                          handleUpdateDisplayName(data.session.access_token);
                        }
                      });
                    }
                  }}
                  className="rounded-2xl border-stone-300"
                />
              </div>
              <Button
                onClick={() => {
                  supabase?.auth.getSession().then(({ data }) => {
                    if (data.session?.access_token) {
                      handleUpdateDisplayName(data.session.access_token);
                    }
                  });
                }}
                disabled={updating}
                className="shrink-0 bg-stone-900 hover:bg-stone-800"
              >
                {updating ? t.updating : t.updateDisplayName}
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-[28px] border border-red-200/60 bg-red-50/80 p-6 shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
              {t.dangerZone}
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium text-stone-900">{t.deleteAccount}</p>
              <p className="mt-1 text-sm text-stone-600">{t.deleteAccountDesc}</p>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
