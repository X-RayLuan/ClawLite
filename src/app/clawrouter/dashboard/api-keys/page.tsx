"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { useLang } from "@/components/lang-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getContentForLang, getIntlLocale } from "@/lib/content";
import { getSupabaseClient } from "@/lib/supabase";

type ApiKey = {
  id: string;
  accountId: string;
  name: string;
  keyPrefix: string;
  status: string;
  createdAt: string | null;
  lastUsedAt: string | null;
  plaintextSecret?: string | null;
};

// Simple custom modal (consistent with admin pages)
function SimpleModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-stone-300/70 bg-white p-6 shadow-elevated">
        {children}
      </div>
    </div>
  );
}

export default function ApiKeysPage() {
  const { lang } = useLang();
  const locale = getIntlLocale(lang);
  const t = getContentForLang(lang).dashboard.apiKeysPage;
  const navT = getContentForLang(lang).dashboard;
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [fullKeys, setFullKeys] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyResult, setNewKeyResult] = useState<ApiKey | null>(null);

  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navItems = useMemo(
    () => [
      { label: navT.nav.dashboard, href: "/clawrouter/dashboard" },
      { label: navT.nav.apiKeys, href: "/clawrouter/dashboard/api-keys", active: true },
      { label: navT.nav.quickStart, href: "/clawrouter/dashboard/quick-start" },
      { label: navT.nav.models, href: "/clawrouter/dashboard/models" },
      { label: navT.nav.usage, href: "/dashboard/usage" },
      { label: navT.nav.transactions, href: "/clawrouter/dashboard/transactions" },
      { label: navT.nav.affiliate, href: "/clawrouter/dashboard/affiliate" },
      { label: navT.nav.profile, href: "/clawrouter/dashboard/profile" },
    ],
    [navT]
  );

  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale]
  );

  const fetchKeys = useCallback(
    async (token: string) => {
      try {
        const res = await fetch("/api/clawrouter/keys", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload?.ok) {
          setKeys(payload.keys || []);
        } else {
          setError(t.errors.load);
        }
      } catch {
        setError(t.errors.load);
      } finally {
        setLoading(false);
      }
    },
    [t.errors.load]
  );

  useEffect(() => {
    if (!supabase) {
      router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fapi-keys");
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
          setAccessToken(data.session.access_token || null);
          if (data.session.access_token) {
            await fetchKeys(data.session.access_token);
          }
          setChecking(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fapi-keys");
      }
    }

    settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login?returnTo=%2Fclawrouter%2Fdashboard%2Fapi-keys");
        return;
      }
      setEmail(session.user.email || null);
      setAccessToken(session.access_token || null);
      if (session.access_token) {
        fetchKeys(session.access_token);
      }
      setChecking(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchKeys, router, supabase]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async (keyId: string, keyValue: string) => {
    try {
      await navigator.clipboard.writeText(keyValue);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = keyValue;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(keyId);
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => {
      setCopied(null);
      copiedTimeoutRef.current = null;
    }, 1500);
  }, []);

  const handleReveal = useCallback(
    async (keyId: string) => {
      if (!accessToken) return;
      setRevealingId(keyId);
      try {
        const res = await fetch(`/api/clawrouter/keys/${keyId}/reveal`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload?.ok && payload.plaintextSecret) {
          setFullKeys((prev) => ({ ...prev, [keyId]: payload.plaintextSecret }));
        } else {
          setError(t.errors.reveal);
        }
      } catch {
        setError(t.errors.reveal);
      } finally {
        setRevealingId(null);
      }
    },
    [accessToken, t.errors.reveal]
  );

  const handleDelete = useCallback(
    async (key: ApiKey) => {
      if (!accessToken) return;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/clawrouter/keys/${key.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload?.ok) {
          setKeys((prev) => prev.filter((k) => k.id !== key.id));
          setDeleteTarget(null);
        } else {
          setError(t.errors.delete);
        }
      } catch {
        setError(t.errors.delete);
      } finally {
        setSubmitting(false);
      }
    },
    [accessToken, t.errors.delete]
  );

  const handleRegenerate = useCallback(
    async (key: ApiKey) => {
      if (!window.confirm(t.confirmRegenerate)) return;
      if (!accessToken) return;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/clawrouter/keys`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
          body: JSON.stringify({ force: true }),
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload?.ok && payload.key) {
          // Refresh the key list
          const listRes = await fetch("/api/clawrouter/keys", {
            headers: { Authorization: `Bearer ${accessToken}`, "Cache-Control": "no-store" },
            cache: "no-store",
          });
          const listPayload = await listRes.json().catch(() => null);
          if (listPayload?.ok) {
            setKeys(listPayload.keys || []);
          }
          if (payload.key.plaintextSecret) {
            setFullKeys((prev) => ({ ...prev, [payload.key.id]: payload.key.plaintextSecret }));
          }
        } else {
          setError(t.errors.regenerate);
        }
      } catch {
        setError(t.errors.regenerate);
      } finally {
        setSubmitting(false);
      }
    },
    [accessToken, t.confirmRegenerate, t.errors.regenerate]
  );

  const handleCreate = useCallback(async () => {
    if (!accessToken) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/clawrouter/keys", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName || undefined }),
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload?.ok && payload.key) {
        setNewKeyName("");
        if (payload.created && payload.plaintextSecret) {
          // Brand-new key — show the reveal modal
          setNewKeyResult({ ...payload.key, plaintextSecret: payload.plaintextSecret });
          // Refresh list to pick up the new entry
          const listRes = await fetch("/api/clawrouter/keys", {
            headers: { Authorization: `Bearer ${accessToken}`, "Cache-Control": "no-store" },
            cache: "no-store",
          });
          const listPayload = await listRes.json().catch(() => null);
          if (listPayload?.ok) {
            setKeys(listPayload.keys || []);
          }
        } else {
          // Named key already existed (created=false) or no plaintext to show — just refresh list
          setCreateOpen(false);
          setNewKeyResult(null);
          const listRes = await fetch("/api/clawrouter/keys", {
            headers: { Authorization: `Bearer ${accessToken}`, "Cache-Control": "no-store" },
            cache: "no-store",
          });
          const listPayload = await listRes.json().catch(() => null);
          if (listPayload?.ok) {
            setKeys(listPayload.keys || []);
          }
        }
      } else {
        setError(t.errors.create);
      }
    } catch {
      setError(t.errors.create);
    } finally {
      setSubmitting(false);
    }
  }, [accessToken, newKeyName, t.errors.create]);

  const formatStatus = useCallback(
    (status: string) => {
      if (status === "active") return t.status.active;
      if (status === "revoked") return t.status.revoked;
      if (status === "inactive") return t.status.inactive;
      return status;
    },
    [t.status]
  );

  const getStatusBadgeVariant = (status: string) => {
    if (status === "active") return "default";
    if (status === "revoked") return "destructive";
    return "secondary";
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
        <span className="font-semibold text-stone-900">{navT.nav.apiKeys}</span>
      </div>

      {/* Mobile: Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64 h-full bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-stone-200 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
                CR
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-950">{navT.common.clawRouter}</p>
                <p className="text-xs text-stone-500">{email || navT.common.accountFallback}</p>
              </div>
            </div>
            <nav className="mt-5 space-y-1.5 px-3">
              {navItems.map((item) => {
                const isActive = item.active;
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
                {navT.nav.apiKeys}
              </Badge>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950">
                {t.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                {t.subtitle}
              </p>
            </div>
            <Button
              onClick={() => {
                setNewKeyResult(null);
                setNewKeyName("");
                setCreateOpen(true);
              }}
              className="bg-stone-900 hover:bg-stone-800 shrink-0"
            >
              {t.buttons.createNew}
            </Button>
          </div>

          {error ? (
            <Card className="rounded-[24px] border border-red-300/60 bg-red-50/90 p-5 shadow-none">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </Card>
          ) : null}

          <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-stone-100" />
                ))}
              </div>
            ) : keys.length === 0 ? (
              <div className="py-8 text-center text-sm text-stone-500">
                {t.noKeys}
              </div>
            ) : (
              <div className="overflow-hidden rounded-[22px] border border-stone-200">
                <div className="grid grid-cols-[1fr_1fr_100px_100px_180px] bg-[rgba(248,244,237,0.85)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  <span>{t.table.name}</span>
                  <span>{t.table.prefix}</span>
                  <span>{t.table.status}</span>
                  <span>{t.table.createdAt}</span>
                  <span className="text-right">{t.table.actions}</span>
                </div>
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="grid grid-cols-[1fr_1fr_100px_100px_180px] items-center border-t border-stone-200 px-4 py-3 text-sm"
                  >
                    <span className="truncate font-medium text-stone-900">{key.name}</span>
                    <span className="truncate font-mono text-stone-600">{key.keyPrefix}••••••••</span>
                    <Badge className={`w-fit text-xs ${
                      key.status === "active" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                      key.status === "revoked" ? "bg-red-100 text-red-700 border-red-300" :
                      "bg-stone-100 text-stone-600 border-stone-300"
                    }`}>
                      {formatStatus(key.status)}
                    </Badge>
                    <span className="text-xs text-stone-500">
                      {key.createdAt ? dateTimeFormatter.format(new Date(key.createdAt)) : "—"}
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      {fullKeys[key.id] ? (
                        <button
                          onClick={() => handleCopy(key.id, fullKeys[key.id])}
                          className="rounded-xl border border-stone-300 bg-white/80 px-3 py-1.5 text-xs text-stone-700 hover:bg-white"
                        >
                          {copied === key.id ? t.buttons.copied : t.buttons.copy}
                        </button>
                      ) : key.status === "active" ? (
                        <button
                          onClick={() => handleReveal(key.id)}
                          disabled={revealingId === key.id}
                          className="rounded-xl border border-stone-300 bg-white/80 px-3 py-1.5 text-xs text-stone-700 hover:bg-white disabled:opacity-50"
                        >
                          {revealingId === key.id ? t.buttons.revealing : t.buttons.reveal}
                        </button>
                      ) : null}
                      <button
                        onClick={() => setDeleteTarget(key)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
                      >
                        {t.buttons.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      {/* Create Key Modal */}
      <SimpleModal open={createOpen} onClose={() => { setCreateOpen(false); setNewKeyResult(null); }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">{t.createModal.title}</h2>
          <button onClick={() => { setCreateOpen(false); setNewKeyResult(null); }} className="rounded-full p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {newKeyResult && newKeyResult.plaintextSecret ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-300/60 bg-emerald-50/90 p-4">
              <p className="break-all font-mono text-sm text-emerald-900">{newKeyResult.plaintextSecret}</p>
            </div>
            <p className="text-sm text-emerald-700">{t.savedKeyNotice}</p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleCopy(newKeyResult.id, newKeyResult.plaintextSecret!)}
                className="border-stone-300 bg-white/90 text-stone-900"
              >
                {copied === newKeyResult.id ? t.buttons.copied : t.buttons.copy}
              </Button>
              <Button
                onClick={() => { setCreateOpen(false); setNewKeyResult(null); }}
                className="bg-stone-900 hover:bg-stone-800"
              >
                {t.buttons.done}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder={t.createModal.namePlaceholder}
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="rounded-2xl border-stone-300"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => { setCreateOpen(false); setNewKeyResult(null); }}
                className="border-stone-300 bg-white/90 text-stone-900"
              >
                {t.createModal.cancel}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={submitting}
                className="bg-stone-900 hover:bg-stone-800"
              >
                {submitting ? t.createModal.creating : t.createModal.create}
              </Button>
            </div>
          </div>
        )}
      </SimpleModal>

      {/* Delete Confirmation Modal */}
      <SimpleModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-red-900">{t.buttons.delete}</h2>
          <button onClick={() => setDeleteTarget(null)} className="rounded-full p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-4 text-sm text-stone-700">{t.confirmDelete}</p>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setDeleteTarget(null)}
            className="border-stone-300 bg-white/90 text-stone-900"
          >
            {t.createModal.cancel}
          </Button>
          <Button
            onClick={() => deleteTarget && handleDelete(deleteTarget)}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {submitting ? t.buttons.deleting : t.buttons.delete}
          </Button>
        </div>
      </SimpleModal>
    </main>
  );
}
