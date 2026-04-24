"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/lang-provider";
import { getContentForLang } from "@/lib/content";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  status: string;
  createdAt: string | null;
  plaintextSecret?: string | null;
  hasEncryptedSecret?: boolean;
};

const LOCAL_STORAGE_KEY = "clawrouter_api_key_full";

export function DownloadApiKeySection({ accessToken }: { accessToken: string }) {
  const { lang } = useLang();
  const t = getContentForLang(lang).downloads.apiKey;
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiKeyRef = useRef<ApiKey | null>(null);
  const fullKeyRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiKeyRef.current = apiKey;
  }, [apiKey]);

  useEffect(() => {
    fullKeyRef.current = fullKey;
  }, [fullKey]);

  const syncApiKey = useCallback((nextKey: ApiKey | null, options?: { revealFullKey?: boolean }) => {
    const previousApiKey = apiKeyRef.current;
    const previousFullKey = fullKeyRef.current;
    const isSameKey = !!previousApiKey?.id && !!nextKey?.id && previousApiKey.id === nextKey.id;
    let nextFullKey = nextKey?.plaintextSecret ?? (isSameKey ? previousFullKey : null);

    // Fallback: try to read from localStorage if we have an apiKey but no fullKey
    if (!nextFullKey && nextKey?.id) {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const storedData = JSON.parse(stored);
          if (storedData.id === nextKey.id) {
            nextFullKey = storedData.fullKey;
          }
        }
      } catch {
        // ignore localStorage errors
      }
    }

    setApiKey(nextKey);
    setFullKey(nextFullKey);
    setJustCreated(Boolean(options?.revealFullKey && nextFullKey));
    setError(null);
  }, []);

  // Fetch existing key
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
          const nextKey: ApiKey | null = payload.keys?.[0] ?? null;
          syncApiKey(nextKey, { revealFullKey: Boolean(nextKey?.plaintextSecret) });
        } else {
          setError(t.loadError);
        }
      } catch {
        if (mounted) setError(t.loadError);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchKey();
    return () => { mounted = false; };
  }, [accessToken, syncApiKey, t.loadError]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/clawrouter/keys", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (res.ok && payload?.ok && payload.key) {
        syncApiKey(payload.key, { revealFullKey: true });
        // Persist full key to localStorage for subsequent loads
        if (payload.key?.plaintextSecret) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
              id: payload.key.id,
              fullKey: payload.key.plaintextSecret,
            }));
          } catch {
            // ignore localStorage errors
          }
        }
        return;
      }
      setError(t.generateError);
    } catch {
      setError(t.generateError);
    } finally {
      setSubmitting(false);
    }
  }, [accessToken, syncApiKey, t.generateError]);

  const handleRegenerate = useCallback(async () => {
    if (!window.confirm(t.confirmRegenerate)) return;
    await handleGenerate();
  }, [handleGenerate, t.confirmRegenerate]);

  const handleReveal = useCallback(async () => {
    if (!accessToken || !apiKeyRef.current?.id) return;
    setRevealing(true);
    setError(null);
    try {
      const res = await fetch(`/api/clawrouter/keys/${apiKeyRef.current.id}/reveal`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (res.ok && payload?.ok && payload.plaintextSecret) {
        setFullKey(payload.plaintextSecret);
        setJustCreated(false);
        // Persist to localStorage for next load
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
            id: apiKeyRef.current!.id,
            fullKey: payload.plaintextSecret,
          }));
        } catch {
          // ignore
        }
        return;
      }
      if (res.status === 410) {
        setError(t.oldKeyError);
      } else {
        setError(t.revealError);
      }
    } catch {
      setError(t.revealError);
    } finally {
      setRevealing(false);
    }
  }, [accessToken, t.revealError, t.oldKeyError]);

  const handleCopy = useCallback(async () => {
    const keyToCopy = fullKeyRef.current ?? fullKey;
    if (!keyToCopy) return;
    try {
      await navigator.clipboard.writeText(keyToCopy);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = keyToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        setError(t.copyError);
        return;
      }
    }
    setCopied(true);
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      copiedTimeoutRef.current = null;
    }, 1500);
  }, [fullKey, t.copyError]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-coral/20 bg-coral/5 p-6 shadow-soft">
        <div className="h-4 w-32 animate-pulse rounded bg-coral/20" />
        <div className="mt-3 h-6 w-48 animate-pulse rounded bg-coral/20" />
        <div className="mt-4 h-10 w-36 animate-pulse rounded-xl bg-coral/20" />
      </div>
    );
  }

  const pageT = getContentForLang(lang).downloads;

  return (
    <div className="rounded-2xl border border-coral/20 bg-coral/5 p-6 shadow-soft">
      {error ? (
        <div className="mb-4 rounded-xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">3</p>
      <h2 className="mt-2 text-lg font-semibold text-ink">
        {apiKey ? t.titleWithKey : t.titleWithoutKey}
      </h2>
      <p className="mt-2 text-sm text-ink/70">
        {apiKey ? t.descWithKey : t.descWithoutKey}
      </p>

      {!apiKey ? (
        <Button className="mt-4" onClick={handleGenerate} disabled={submitting}>
          {submitting ? t.generating : t.generate}
        </Button>
      ) : justCreated && fullKey ? (
        <div className="mt-4 rounded-xl border border-emerald-300/60 bg-emerald-50/90 px-4 py-3">
          <p className="break-all font-mono text-sm text-emerald-900">{fullKey}</p>
          <p className="mt-2 text-xs text-emerald-700">{t.saveOnce}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? t.copied : t.copyKey}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleRegenerate} disabled={submitting}>
              {submitting ? t.regenerating : t.regenerate}
            </Button>
          </div>
        </div>
      ) : fullKey ? (
        <div className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-3">
          <p className="break-all font-mono text-sm text-ink">{fullKey}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? t.copied : t.copyKey}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleRegenerate} disabled={submitting}>
              {submitting ? t.regenerating : t.regenerate}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate rounded-xl border border-black/10 bg-white px-3 py-2.5 font-mono text-sm text-ink">
              {apiKey.keyPrefix}••••••••••••••••
            </p>
            {apiKey.hasEncryptedSecret ? (
              <Button variant="secondary" size="sm" onClick={handleReveal} disabled={revealing}>
                {revealing ? t.revealing : t.show}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" disabled>
                {t.copy}
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleRegenerate} disabled={submitting}>
              {submitting ? t.regenerating : t.regenerate}
            </Button>
          </div>
          <p className="mt-2 text-xs text-ink/60">
            {apiKey.hasEncryptedSecret
              ? t.hintHasEncrypted
              : t.hintNoEncrypted}
          </p>
        </div>
      )}

      {apiKey?.createdAt && (
        <p className="mt-4 text-xs text-ink/50">
          {t.created.replace("{date}", new Date(apiKey.createdAt).toLocaleDateString())}
        </p>
      )}
    </div>
  );
}
