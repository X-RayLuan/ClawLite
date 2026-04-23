"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  status: string;
  createdAt: string | null;
  plaintextSecret?: string | null;
};

// Refs to preserve fullKey across re-fetch (avoids it being clobbered when API returns null plaintextSecret)
const fullKeyRef = { current: null as string | null };
const apiKeyRef = { current: null as ApiKey | null };

export function DownloadApiKeySection({ accessToken }: { accessToken: string }) {
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          // Preserve fullKey if the key ID hasn't changed (plaintextSecret is null on GET after creation)
          const isSameKey = apiKeyRef.current?.id && nextKey?.id && apiKeyRef.current.id === nextKey.id;
          const newFullKey = nextKey?.plaintextSecret ?? (isSameKey ? fullKeyRef.current : null);
          apiKeyRef.current = nextKey;
          fullKeyRef.current = newFullKey;
          setApiKey(nextKey);
          setFullKey(newFullKey);
          setJustCreated(Boolean(nextKey?.plaintextSecret));
          setError(null);
        } else {
          setError("Failed to load API key.");
        }
      } catch {
        if (mounted) setError("Failed to load API key.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchKey();
    return () => { mounted = false; };
  }, [accessToken]);

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
        const k: ApiKey = payload.key;
        fullKeyRef.current = k.plaintextSecret ?? null;
        apiKeyRef.current = k;
        setApiKey(k);
        setFullKey(k.plaintextSecret ?? null);
        setJustCreated(true);
        setError(null);
        return;
      }
      setError("Failed to generate key. Please try again.");
    } catch {
      setError("Failed to generate key. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [accessToken]);

  const handleRegenerate = useCallback(async () => {
    if (!window.confirm("This will deactivate your current key and create a new one. Continue?")) return;
    await handleGenerate();
  }, [handleGenerate]);

  const handleCopy = useCallback(async () => {
    if (!fullKey) return;
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(fullKey);
    } catch {
      // Fallback for environments where clipboard API fails silently
      try {
        const textarea = document.createElement("textarea");
        textarea.value = fullKey;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        setError("Failed to copy key. Please try selecting the text manually.");
        return;
      }
    }
    setCopied(true);
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      copiedTimeoutRef.current = null;
    }, 1500);
  }, [fullKey]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-coral/20 bg-coral/5 p-6 shadow-soft">
        <div className="h-4 w-32 animate-pulse rounded bg-coral/20" />
        <div className="mt-3 h-6 w-48 animate-pulse rounded bg-coral/20" />
        <div className="mt-4 h-10 w-36 animate-pulse rounded-xl bg-coral/20" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-coral/20 bg-coral/5 p-6 shadow-soft">
      {error ? (
        <div className="mb-4 rounded-xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">3</p>
      <h2 className="mt-2 text-lg font-semibold text-ink">
        {apiKey ? "Your ClawLite API Key" : "Get Your ClawLite API Key"}
      </h2>
      <p className="mt-2 text-sm text-ink/70">
        {apiKey
          ? "Use this key to authenticate your installer and route AI requests through ClawRouter."
          : "Generate your personal API key to activate the installer after purchase."}
      </p>

      {!apiKey ? (
        <Button className="mt-4" onClick={handleGenerate} disabled={submitting}>
          {submitting ? "Generating..." : "Generate API Key"}
        </Button>
      ) : justCreated && fullKey ? (
        <div className="mt-4 rounded-xl border border-emerald-300/60 bg-emerald-50/90 px-4 py-3">
          <p className="break-all font-mono text-sm text-emerald-900">{fullKey}</p>
          <p className="mt-2 text-xs text-emerald-700">Save this key — it is only shown once.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? "Copied" : "Copy Key"}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleRegenerate} disabled={submitting}>
              Regenerate
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate rounded-xl border border-black/10 bg-white px-3 py-2.5 font-mono text-sm text-ink">
              {apiKey.keyPrefix}••••••••••••••••
            </p>
            <Button variant="secondary" size="sm" onClick={handleCopy} disabled={!fullKey}>
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleRegenerate} disabled={submitting}>
              Regenerate
            </Button>
          </div>
          <p className="mt-2 text-xs text-ink/60">
            Full key only shown on first creation. Regenerate to get a new key.
          </p>
        </div>
      )}

      {apiKey?.createdAt && (
        <p className="mt-4 text-xs text-ink/50">Created {new Date(apiKey.createdAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}
