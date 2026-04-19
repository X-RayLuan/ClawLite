"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSafeExternal, getSafeReturnTo } from "@/lib/auth-flow";
import { syncPostLoginClientState } from "@/lib/post-login-client";
import { pricingConfig } from "@/lib/pricing";
import { getSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const redirectingRef = useRef(false);

  const supabase = useMemo(() => getSupabaseClient(), []);
  const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const authError = params.get("authError");
  const authErrorDescription = params.get("authErrorDescription");

  let authErrorMessage = "";
  if (authError === "expired") {
    authErrorMessage = authErrorDescription || "A previous login link expired. Request a fresh 6-digit code to continue.";
  } else if (authError === "invalid") {
    authErrorMessage = authErrorDescription || "That login link is invalid. Request a fresh 6-digit code to continue.";
  } else if (authError) {
    authErrorMessage = authErrorDescription || "Login could not be completed. Request a fresh 6-digit code to continue.";
  }

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    const params = new URLSearchParams(window.location.search);
    const returnTo = getSafeReturnTo(params.get("returnTo"));
    const external = getSafeExternal(params.get("external"));
    let mounted = true;

    async function completeLogin(session: { user: { id: string; email?: string | null; email_confirmed_at?: string | null; last_sign_in_at?: string | null } }) {
      if (redirectingRef.current) return;
      redirectingRef.current = true;

      await syncPostLoginClientState({
        supabase: client as any,
        user: session.user,
        returnTo,
      });

      if (external) {
        window.location.replace(external);
        return;
      }

      router.replace(returnTo);
    }

    async function settleSession() {
      for (let i = 0; i < 8; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          await completeLogin(data.session as any);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    void settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" || !session?.user) {
        return;
      }

      void completeLogin(session as any);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  async function sendCode(emailValue: string) {
    setLoading(true);
    setError("");
    setMessage("");

    if (!emailValue || !emailValue.includes("@")) {
      setLoading(false);
      setError("Enter a valid email address.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const returnTo = getSafeReturnTo(params.get("returnTo"));
    const external = getSafeExternal(params.get("external"));

    try {
      window.localStorage.setItem("clawlite-post-login-returnTo", returnTo);
      if (external) window.localStorage.setItem("clawlite-post-login-external", external);
    } catch {
      // ignore storage failures
    }

    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailValue, returnTo }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to send login code. Please try again.");
      return;
    }

    setSentEmail(emailValue);
    setStep("code");
    setResendCooldown(60);
    setCode("");
    setMessage(`Code sent to ${emailValue}. Check your inbox (and spam folder).`);
  }

  async function onSubmitEmail(e: FormEvent) {
    e.preventDefault();
    await sendCode(email.trim().toLowerCase());
  }

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
    if (normalizedCode.length !== 6) {
      setLoading(false);
      setError("Enter the full 6-digit code.");
      return;
    }

    const returnTo = (() => {
      try {
        return window.localStorage.getItem("clawlite-post-login-returnTo") || "/clawrouter/dashboard";
      } catch {
        return "/clawrouter/dashboard";
      }
    })();
    const external = (() => {
      try {
        return window.localStorage.getItem("clawlite-post-login-external") || undefined;
      } catch {
        return undefined;
      }
    })();

    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sentEmail, code: normalizedCode, returnTo }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "invalid_or_expired_code"
        ? "This code is invalid or expired. Request a new one."
        : data.error || "Verification failed. Please try again.");
      return;
    }

    const data = await res.json();

    if (data.accessToken && data.refreshToken) {
      // Pass tokens to callback via hash — callback reads them and sets session
      const callbackUrl = new URL(data.redirectUrl || `${window.location.origin}/auth/callback`);
      callbackUrl.hash = `access_token=${data.accessToken}&refresh_token=${data.refreshToken}`;
      window.location.href = callbackUrl.toString();
      return;
    }

    // Fallback: redirect without tokens (relies on callback reading hash from magic link)
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }

    setError("Login failed. Please try again.");
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Login to ClawLite</h1>
      <p className="mt-3 text-ink/70">
        Login once to unlock installer downloads, your 50% EZROUTER token coupon, backup skills, and {pricingConfig.remoteImplementation.label.toLowerCase()} checkout.
      </p>

      <div className="mt-8 flex gap-3 text-sm">
        <div className={`rounded-full px-4 py-2 ${step === "email" ? "bg-ink text-white" : "bg-black/5 text-ink/65"}`}>
          Step 1: Enter email
        </div>
        <div className={`rounded-full px-4 py-2 ${step === "code" ? "bg-ink text-white" : "bg-black/5 text-ink/65"}`}>
          Step 2: Enter code
        </div>
      </div>

      <form onSubmit={step === "email" ? onSubmitEmail : onSubmitCode} className="mt-4 rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
        {authErrorMessage ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {authErrorMessage}
          </div>
        ) : null}

        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={step === "code"}
          className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-ink/30"
        />

        {step === "code" ? (
          <>
            <label className="mt-5 block text-sm font-medium text-ink">
              6-digit code
            </label>
            <p className="mt-1 text-xs text-ink/50">Enter the code sent to {sentEmail}</p>

            {/* 6-box OTP input */}
            <div className="mt-3 flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={code[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/, "");
                    if (val.length > 0) {
                      const next = code.split("");
                      next[i] = val[0];
                      const newCode = next.join("");
                      setCode(newCode);
                      // Auto-focus next box
                      const inputs = document.querySelectorAll<HTMLInputElement>(".otp-box");
                      if (i < 5 && inputs[i + 1]) {
                        inputs[i + 1].focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      e.preventDefault();
                      const chars = code.split("");
                      if (code[i]) {
                        // Current box has content — clear it
                        chars[i] = "";
                        setCode(chars.join(""));
                      } else if (i > 0) {
                        // Current box is empty — go to previous and clear it
                        chars[i - 1] = "";
                        setCode(chars.join(""));
                        const inputs = document.querySelectorAll<HTMLInputElement>(".otp-box");
                        inputs[i - 1].focus();
                      }
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    setCode(pasted);
                    const inputs = document.querySelectorAll<HTMLInputElement>(".otp-box");
                    inputs[Math.min(pasted.length, 5)].focus();
                  }}
                  className="otp-box flex h-14 w-0 flex-1 items-center justify-center rounded-2xl border-2 border-black/15 bg-white text-center text-2xl font-semibold tracking-widest text-ink shadow-sm transition-all placeholder:text-3xl placeholder:font-normal placeholder:tracking-normal placeholder:text-black/20 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                  style={{ WebkitAppearance: "none", appearance: "none" }}
                />
              ))}
            </div>

            <Button type="submit" className="mt-5 w-full" disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                  setMessage("");
                }}
                className="text-ink/65 underline-offset-4 hover:text-ink hover:underline"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={() => {
                  if (loading || resendCooldown > 0) return;
                  void sendCode(sentEmail);
                }}
                disabled={loading || resendCooldown > 0}
                className="text-ink/65 underline-offset-4 hover:text-ink hover:underline disabled:cursor-not-allowed disabled:text-ink/35"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
          </>
        ) : (
          <Button type="submit" className="mt-4 w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Code"}
          </Button>
        )}

        {message ? <p className="mt-3 text-sm text-sea">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </form>

      <p className="mt-5 text-sm text-ink/60">
        Back to <Link className="underline" href="/">Home</Link>
      </p>
    </main>
  );
}
