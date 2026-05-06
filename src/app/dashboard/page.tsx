"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CLAWLITE_BASE_URL = "https://clawlite.ai/api/claude";

// ─── Types ────────────────────────────────────────────────────────────────────

type VerifyResult = {
  ok: boolean;
  apiKey: string;
  accountId: string;
  email: string;
  balanceUsd: number;
  currency: string;
  error?: string;
};

type BalanceResult = {
  ok: boolean;
  balance?: { total: number; frozen: number; available: number };
  error?: string;
};

type ConfigWriteResult =
  | { ok: true }
  | { ok: false; error: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

async function writeClawConfig(apiKey: string): Promise<ConfigWriteResult> {
  try {
    const config = {
      agents: {
        default: {
          provider: "clawlite",
          baseUrl: CLAWLITE_BASE_URL,
          apiKey,
        },
      },
    };

    const response = await fetch("/api/installer/config-write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "unknown" }));
      return { ok: false, error: err.error || "write_failed" };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "network_error" };
  }
}

async function checkBalance(apiKey: string): Promise<BalanceResult> {
  try {
    const res = await fetch("/api/claude/balance", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Cache-Control": "no-store",
      },
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (res.ok && payload?.ok) {
      return { ok: true, balance: payload.balance };
    }
    return { ok: false, error: payload?.error || "balance_check_failed" };
  } catch {
    return { ok: false, error: "network_error" };
  }
}

async function verifyOtp(email: string, code: string): Promise<VerifyResult> {
  try {
    const res = await fetch("/api/installer/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const payload = await res.json().catch(() => null);
    if (res.ok && payload?.ok) {
      return {
        ok: true,
        apiKey: payload.apiKey || "",
        accountId: payload.accountId || "",
        email: payload.email || email,
        balanceUsd: payload.balance ?? payload.balanceUsd ?? 0,
        currency: payload.currency || "USD",
      };
    }
    return { ok: false, apiKey: "", accountId: "", email, balanceUsd: 0, currency: "USD", error: payload?.error || "verify_failed" };
  } catch {
    return { ok: false, apiKey: "", accountId: "", email, balanceUsd: 0, currency: "USD", error: "network_error" };
  }
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, 1500);
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function InstallerDashboardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<"verify" | "ready" | "configuring" | "done">("verify");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [balanceUsd, setBalanceUsd] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [configError, setConfigError] = useState<string | null>(null);

  // ── Re-check balance after returning from topup ────────────────────────────
  const recheckParam = searchParams.get("recheck");
  const recheckAccountId = searchParams.get("accountId") || "";
  const recheckEmail = searchParams.get("email") || "";

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (recheckParam === "true" && recheckAccountId) {
      // User returned from topup — re-check balance
      setEmail(recheckEmail);
      setAccountId(recheckAccountId);
      setStep("ready");
      setBalanceLoading(true);
      fetch(`/api/installer/topup/check-status?accountId=${encodeURIComponent(recheckAccountId)}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((payload) => {
          if (payload?.ok) {
            setBalanceUsd(payload.balanceUsd ?? 0);
          }
        })
        .catch(() => {})
        .finally(() => setBalanceLoading(false));
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerify = useCallback(async () => {
    if (!email.trim() || !code.trim()) return;
    setVerifyError(null);
    setVerifying(true);

    const result = await verifyOtp(email.trim(), code.trim().replace(/\D/g, ""));

    if (!result.ok) {
      setVerifyError(result.error || "Verification failed");
      setVerifying(false);
      return;
    }

    setApiKey(result.apiKey);
    setAccountId(result.accountId);

    // Query balance if we have an API key
    if (result.apiKey) {
      setBalanceLoading(true);
      const balanceResult = await checkBalance(result.apiKey);
      setBalanceUsd(balanceResult.ok && balanceResult.balance ? balanceResult.balance.available : result.balanceUsd);
      setBalanceError(balanceResult.ok ? null : balanceResult.error || null);
      setBalanceLoading(false);
    } else {
      setBalanceUsd(result.balanceUsd);
    }

    setStep("ready");
    setVerifying(false);
  }, [email, code]);

  // ── Configure to Claw ──────────────────────────────────────────────────────
  const handleConfigure = useCallback(async () => {
    setConfigError(null);
    setStep("configuring");
    const result = await writeClawConfig(apiKey);
    if (!result.ok) {
      setConfigError(result.error || "Configuration failed");
      setStep("ready");
      return;
    }
    setStep("done");
  }, [apiKey]);

  // ── Go to topup ─────────────────────────────────────────────────────────────
  const handleTopup = useCallback(() => {
    router.push(`/topup?accountId=${encodeURIComponent(accountId)}&email=${encodeURIComponent(email)}`);
  }, [router, accountId, email]);

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)]">
      {/* Header */}
      <div className="border-b border-stone-200/60 bg-white/90 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="font-display text-lg font-semibold text-stone-950">ClawLite Installer</span>
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">Back to home</Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">

        {/* ── Step 1: Email + OTP Verification ─────────────────────────────── */}
        {step === "verify" && (
          <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
            <Badge className="border-sea/20 bg-sea/10 text-sea mb-3">Step 1</Badge>
            <h1 className="font-display text-2xl font-semibold text-stone-950">
              Verify your email
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Enter the email address you used during setup and the 6-digit code we sent you.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1.5">
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={verifying}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1.5">
                  Verification code
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={verifying}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="font-mono letter-spacing-wide text-base tracking-[0.3em]"
                />
              </div>

              {verifyError && (
                <div className="rounded-xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {verifyError}
                </div>
              )}

              <Button
                className="w-full bg-stone-900 hover:bg-stone-800"
                onClick={handleVerify}
                disabled={verifying || !email.trim() || code.replace(/\D/g, "").length < 6}
              >
                {verifying ? "Verifying..." : "Verify email"}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step 2: API Key + Balance / Configure ─────────────────────────── */}
        {step === "ready" && (
          <>
            {/* API Key Card */}
            <Card className="rounded-[24px] border border-coral/20 bg-coral/5 p-6 shadow-none">
              <Badge className="border-coral/20 bg-coral/10 text-coral mb-3">Your API Key</Badge>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Email</p>
              <p className="mt-0.5 text-sm text-stone-700">{email}</p>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 mb-2">
                  API Key (plaintext)
                </p>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-xl border border-black/10 bg-white px-3 py-2.5 font-mono text-sm text-stone-800">
                    {apiKey || "—"}
                  </code>
                  {apiKey && <CopyButton text={apiKey} />}
                </div>
                <p className="mt-2 text-xs text-stone-400">
                  Save this key now — it will not be shown again.
                </p>
              </div>
            </Card>

            {/* Balance Card */}
            <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-6 shadow-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Account Balance
                  </p>
                  {balanceLoading ? (
                    <div className="mt-2 h-8 w-24 animate-pulse rounded bg-stone-200" />
                  ) : (
                    <p className="mt-2 font-display text-3xl font-semibold text-stone-950">
                      {formatCurrency(balanceUsd)}
                    </p>
                  )}
                  {balanceError && (
                    <p className="mt-1 text-xs text-red-500">{balanceError}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {balanceUsd > 0 ? (
                    <Badge className="border-emerald-300/60 bg-emerald-50 text-emerald-700">
                      Balance available
                    </Badge>
                  ) : (
                    <Badge className="border-red-300/60 bg-red-50 text-red-600">
                      No balance
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Action: Configure or Topup */}
            {balanceUsd > 0 ? (
              <Card className="rounded-[24px] border border-emerald-300/60 bg-emerald-50/80 p-6 shadow-none">
                <h2 className="font-display text-xl font-semibold text-stone-950">
                  Ready to configure
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Your account has a balance. Click below to write the configuration to your Claw instance.
                </p>
                <Button
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleConfigure}
                >
                  Configure to Claw
                </Button>
              </Card>
            ) : (
              <Card className="rounded-[24px] border border-amber-300/60 bg-amber-50/80 p-6 shadow-none">
                <h2 className="font-display text-xl font-semibold text-stone-950">
                  No balance found
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Your account has no credits. Add funds to configure Claw with your API key.
                </p>
                <Button
                  className="mt-4 bg-amber-600 hover:bg-amber-700"
                  onClick={handleTopup}
                >
                  Add credits
                </Button>
              </Card>
            )}
          </>
        )}

        {/* ── Step 3: Configuring (loading) ────────────────────────────────── */}
        {step === "configuring" && (
          <Card className="rounded-[24px] border border-stone-300/60 bg-white/90 p-8 shadow-none text-center">
            <div className="mx-auto h-10 w-10 rounded-full border-4 border-stone-200 border-t-stone-900 animate-spin" />
            <h2 className="mt-4 font-display text-xl font-semibold text-stone-950">
              Writing configuration...
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Saving API key and base URL to your Claw config file.
            </p>
          </Card>
        )}

        {/* ── Step 4: Done ─────────────────────────────────────────────────── */}
        {step === "done" && (
          <Card className="rounded-[24px] border border-emerald-300/60 bg-emerald-50/90 p-8 shadow-none text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold text-emerald-900">
              Installation complete!
            </h2>
            <p className="mt-3 text-sm text-emerald-700">
              Your Claw is now configured with ClawLite. Restart Claw to start using it.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/clawrouter/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/downloads">Download Installer</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
export default function InstallerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading...</div></div>}>
      <InstallerDashboardPageInner />
    </Suspense>
  );
}
