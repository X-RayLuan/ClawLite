"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { useLang } from "@/components/lang-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getContentForLang, getIntlLocale } from "@/lib/content";
import { getSupabaseClient } from "@/lib/supabase";

type AffiliateStats = {
  totalReferrals: number;
  pendingReferrals: number;
  pendingCommission: number;
  totalCommission: number;
};

type Commission = {
  amount: number;
  status: string;
  created_at: string;
  referredEmail?: string;
};

export default function AffiliatePage() {
  const { lang } = useLang();
  const locale = getIntlLocale(lang);
  const navT = getContentForLang(lang).dashboard;
  const t = getContentForLang(lang).dashboard.affiliatePage;
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [stats, setStats] = useState<AffiliateStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    pendingCommission: 0,
    totalCommission: 0,
  });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navItems = useMemo(
    () => [
      { label: navT.nav.dashboard, href: "/clawrouter/dashboard" },
      { label: navT.nav.apiKeys, href: "/clawrouter/dashboard/api-keys" },
      { label: navT.nav.quickStart, href: "/clawrouter/dashboard/quick-start" },
      { label: navT.nav.models, href: "/clawrouter/dashboard/models" },
      { label: navT.nav.usage, href: "/clawrouter/dashboard/usage" },
      { label: navT.nav.transactions, href: "/clawrouter/dashboard/transactions" },
      { label: navT.nav.affiliate, href: "/clawrouter/dashboard/affiliate", active: true },
      { label: navT.nav.profile, href: "/clawrouter/dashboard/profile" },
    ],
    [navT]
  );

  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale]
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const fetchAffiliateData = useCallback(
    async (accessToken: string) => {
      try {
        const res = await fetch("/api/clawrouter/affiliate", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload?.ok) {
          setReferralCode(payload.referralCode || "");
          setReferralLink(payload.referralLink || "");
          setStats(payload.stats || {});
          setCommissions(payload.commissions || []);
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
      router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Faffiliate");
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
            await fetchAffiliateData(token);
          }
          setChecking(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Faffiliate");
      }
    }

    settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Faffiliate");
        return;
      }
      setEmail(session.user.email || null);
      const token = session.access_token;
      if (token) {
        fetchAffiliateData(token);
      }
      setChecking(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchAffiliateData, router, supabase]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = referralCode;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      copiedTimeoutRef.current = null;
    }, 1500);
  }, [referralCode]);

  const handleClaim = useCallback(
    async (accessToken: string) => {
      setClaiming(true);
      try {
        const res = await fetch("/api/clawrouter/affiliate/claim", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload?.ok) {
          setClaimSuccess(true);
        } else {
          setError(t.claimError);
        }
      } catch {
        setError(t.claimError);
      } finally {
        setClaiming(false);
      }
    },
    [t.claimError]
  );

  const formatStatus = (status: string) => {
    if (status === "pending") return t.statuses.pending;
    if (status === "approved") return t.statuses.approved;
    if (status === "paid") return t.statuses.paid;
    if (status === "rejected") return t.statuses.rejected;
    return status;
  };

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
                {navT.nav.affiliate}
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

          {claimSuccess ? (
            <Card className="rounded-[24px] border border-emerald-300/60 bg-emerald-50/90 p-5 shadow-none">
              <p className="text-sm font-medium text-emerald-800">{t.claimSuccess}</p>
            </Card>
          ) : null}

          {/* Referral Code Section */}
          <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              {t.referralCode}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 truncate rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-sm text-stone-900">
                {referralCode || "—"}
              </div>
              <Button
                onClick={handleCopyCode}
                variant="secondary"
                className="shrink-0 border-stone-300 bg-white/90 text-stone-900 hover:bg-white"
              >
                {copied ? t.copied : t.copyCode}
              </Button>
            </div>
            {referralLink && (
              <p className="mt-2 text-xs text-stone-400 truncate">
                {referralLink}
              </p>
            )}
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                {t.stats.referredUsers}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
                {stats.totalReferrals}
              </h2>
            </Card>
            <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-5 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                {t.stats.earnedCommission}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-emerald-700">
                {currencyFormatter.format(stats.totalCommission)}
              </h2>
            </Card>
            <Card className="rounded-[24px] border border-amber-300/60 bg-amber-50/90 p-5 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
                {t.stats.pendingCommission}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-amber-700">
                {currencyFormatter.format(stats.pendingCommission)}
              </h2>
              {stats.pendingCommission > 0 && (
                <Button
                  onClick={() => {
                    supabase?.auth.getSession().then(({ data }) => {
                      if (data.session?.access_token) {
                        handleClaim(data.session.access_token);
                      }
                    });
                  }}
                  disabled={claiming}
                  className="mt-3 bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  {claiming ? t.claiming : t.claim}
                </Button>
              )}
            </Card>
          </div>

          {/* Referral Records */}
          <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              {t.records.title}
            </p>
            {loading ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-2xl bg-stone-100" />
                ))}
              </div>
            ) : commissions.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">{t.records.noRecords}</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-[22px] border border-stone-200">
                <div className="grid grid-cols-[1fr_1fr_100px_120px] bg-[rgba(248,244,237,0.85)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  <span>{t.records.time}</span>
                  <span>{t.records.amount}</span>
                  <span>{t.records.status}</span>
                </div>
                {commissions.map((comm, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_100px_120px] border-t border-stone-200 px-4 py-3 text-sm"
                  >
                    <span className="text-stone-500">
                      {dateTimeFormatter.format(new Date(comm.created_at))}
                    </span>
                    <span className="font-medium text-stone-900">
                      {currencyFormatter.format(Number(comm.amount))}
                    </span>
                    <span>
                      <Badge className={`text-xs ${
                        comm.status === "paid" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                        comm.status === "pending" ? "bg-stone-100 text-stone-700 border-stone-300" :
                        "bg-red-100 text-red-700 border-red-300"
                      }`}>
                        {formatStatus(comm.status)}
                      </Badge>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}
