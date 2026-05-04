"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLang } from "@/components/lang-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export function ApiKeyCard() {
  const { lang } = useLang();
  const locale = getIntlLocale(lang);
  const t = getContentForLang(lang).dashboard;
  const supabase = getSupabaseClient();
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiKeyRef = useRef<ApiKey | null>(null);
  const fullKeyRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const formatDate = useCallback(
    (value: string) =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium"
      }).format(new Date(value)),
    [locale]
  );

  const formatStatus = useCallback(
    (status: string) => {
      if (status === "active") {
        return t.apiKey.statusActive;
      }
      if (status === "disabled") {
        return t.apiKey.statusDisabled;
      }
      return status;
    },
    [t]
  );

  useEffect(() => {
    apiKeyRef.current = apiKey;
  }, [apiKey]);

  useEffect(() => {
    fullKeyRef.current = fullKey;
  }, [fullKey]);

  const syncApiKey = useCallback((nextApiKey: ApiKey | null, options?: { revealFullKey?: boolean }) => {
    const previousApiKey = apiKeyRef.current;
    const previousFullKey = fullKeyRef.current;
    const isSameKey = !!previousApiKey?.id && !!nextApiKey?.id && previousApiKey.id === nextApiKey.id;
    const nextFullKey = nextApiKey?.plaintextSecret ?? (isSameKey ? previousFullKey : null);

    setApiKey(nextApiKey);
    setFullKey(nextFullKey);
    setJustCreated(Boolean(options?.revealFullKey && nextFullKey));
    setLoadError(null);
  }, []);

  const showErrorToast = useCallback((message: string) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setToastError(message);
    errorTimeoutRef.current = setTimeout(() => {
      setToastError(null);
      errorTimeoutRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setLoadError(t.apiKey.connectError);
      return;
    }

    const client = supabase;
    let mounted = true;

    async function getToken() {
      for (let i = 0; i < 8; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.access_token) {
          setAccessToken(data.session.access_token);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        setLoading(false);
        setLoadError(t.apiKey.sessionError);
      }
    }

    getToken();

    return () => {
      mounted = false;
    };
  }, [supabase, t]);

  useEffect(() => {
    if (!accessToken) return;

    let mounted = true;
    setLoading(true);

    async function fetchKey() {
      try {
        const res = await fetch("/api/clawrouter/keys", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });

        const payload = await res.json().catch(() => null);
        if (!mounted) return;

        if (res.ok && payload?.ok) {
          const nextKey = payload.keys?.[0] ?? null;
          syncApiKey(nextKey, { revealFullKey: Boolean(nextKey?.plaintextSecret) });
          return;
        }

        setLoadError(t.apiKey.loadError);
      } catch {
        if (mounted) {
          setLoadError(t.apiKey.loadError);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchKey();

    return () => {
      mounted = false;
    };
  }, [accessToken, syncApiKey, t]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleCreateOrRefresh = useCallback(async () => {
    if (!accessToken) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/clawrouter/keys", {
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
        syncApiKey(payload.key, {
          revealFullKey: Boolean(payload.created && payload.key.plaintextSecret),
        });
        return;
      }

      showErrorToast(t.apiKey.generateError);
    } catch {
      showErrorToast(t.apiKey.generateError);
    } finally {
      setSubmitting(false);
    }
  }, [accessToken, showErrorToast, syncApiKey, t]);

  const handleRegenerate = useCallback(async () => {
    if (!window.confirm(t.apiKey.confirmRegenerate)) {
      return;
    }

    await handleCreateOrRefresh();
  }, [handleCreateOrRefresh, t]);

  const handleCopy = useCallback(async () => {
    if (!fullKey) return;

    try {
      await navigator.clipboard.writeText(fullKey);
      setCopied(true);

      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }

      copiedTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copiedTimeoutRef.current = null;
      }, 1500);
    } catch {
      showErrorToast(t.apiKey.copyError);
    }
  }, [fullKey, showErrorToast, t]);

  if (loading) {
    return (
      <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-stone-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
            <div className="h-3 w-48 animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      </Card>
    );
  }

  if (loadError && !apiKey) {
    return (
      <Card className="rounded-[28px] border border-red-300/60 bg-red-50/90 p-6 shadow-none">
        <p className="text-sm font-medium text-red-800">{loadError}</p>
      </Card>
    );
  }

  if (!apiKey) {
    return (
      <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
        {toastError ? (
          <div className="mb-4 rounded-2xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-800">
            {toastError}
          </div>
        ) : null}
        <p className="text-sm text-stone-600">{t.apiKey.empty}</p>
        <Button onClick={handleCreateOrRefresh} className="mt-4" disabled={submitting || !accessToken}>
          {submitting ? t.apiKey.generating : t.apiKey.generate}
        </Button>
      </Card>
    );
  }

  const canCopy = !!fullKey;

  return (
    <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
      {toastError ? (
        <div className="mb-4 rounded-2xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-800">
          {toastError}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{t.apiKey.label}</p>
          <h2 className="mt-2 text-xl font-semibold text-stone-950">{t.apiKey.title}</h2>
        </div>
        <Badge className="border-stone-300 bg-emerald-50/90 text-emerald-700">{formatStatus(apiKey.status)}</Badge>
      </div>

      {justCreated && fullKey ? (
        <div className="mt-5 rounded-xl border border-emerald-300/60 bg-emerald-50/90 px-4 py-3">
          <p className="break-all font-mono text-sm text-emerald-900">{fullKey}</p>
          <p className="mt-2 text-xs text-emerald-700">{t.apiKey.saveOnce}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={handleCopy}
              className="border-stone-300 bg-white/90 text-stone-900 hover:bg-white"
              disabled={!canCopy}
            >
              {copied ? t.apiKey.copied : t.apiKey.copyKey}
            </Button>
            <Button
              variant="secondary"
              onClick={handleRegenerate}
              className="border-stone-300 bg-white/90 text-stone-900 hover:bg-white"
              disabled={submitting}
            >
              {submitting ? t.apiKey.regenerating : t.apiKey.regenerate}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="min-w-0 flex-1 truncate rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 font-mono text-sm text-stone-700">
              {apiKey.keyPrefix}••••••••••••••••
            </p>
            <Button
              variant="secondary"
              onClick={handleCopy}
              className="border-stone-300 bg-white/90 text-stone-900 hover:bg-white"
              disabled={!canCopy}
            >
              {copied ? t.apiKey.copied : t.apiKey.copy}
            </Button>
            <Button
              variant="secondary"
              onClick={handleRegenerate}
              className="border-stone-300 bg-white/90 text-stone-900 hover:bg-white"
              disabled={submitting}
            >
              {submitting ? t.apiKey.regenerating : t.apiKey.regenerate}
            </Button>
          </div>
          {!canCopy ? (
            <p className="mt-2 text-xs text-stone-500">
              {t.apiKey.noFullKey}
            </p>
          ) : null}
        </div>
      )}

      {apiKey.createdAt && (
        <p className="mt-4 text-xs text-stone-500">
          {t.apiKey.created.replace("{date}", formatDate(apiKey.createdAt))}
        </p>
      )}
    </Card>
  );
}
