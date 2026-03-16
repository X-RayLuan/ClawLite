"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSafeExternal, getSafeReturnTo } from "@/lib/auth-flow";
import { pricingConfig } from "@/lib/pricing";
import { getSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const supabase = useMemo(() => getSupabaseClient(), []);
  const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const authError = params.get("authError");
  const authErrorDescription = params.get("authErrorDescription");

  let authErrorMessage = "";
  if (authError === "expired") {
    authErrorMessage = authErrorDescription || "That magic link expired. Request a fresh login link to continue to the download page.";
  } else if (authError === "invalid") {
    authErrorMessage = authErrorDescription || "That magic link is invalid. Request a fresh login link to continue to the download page.";
  } else if (authError) {
    authErrorMessage = authErrorDescription || "Login could not be completed. Request a fresh login link to continue.";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!supabase) {
      setLoading(false);
      setError("Supabase is not configured yet. Please set environment variables first.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const returnTo = getSafeReturnTo(params.get("returnTo"));
    const external = getSafeExternal(params.get("external"));

    try {
      window.localStorage.setItem("clawlite-post-login-returnTo", returnTo);
    } catch {
      // ignore storage failures
    }
    const callbackParams = new URLSearchParams();
    callbackParams.set("returnTo", returnTo);
    if (external) callbackParams.set("external", external);
    const redirectTo = `${window.location.origin}/auth/callback?${callbackParams.toString()}`;
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message || "Failed to send login email.");
      return;
    }

    setMessage("Magic link sent. Check your inbox and click the link to continue.");
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Login to ClawLite</h1>
      <p className="mt-3 text-ink/70">
        Login once to unlock installer downloads, backup skills, your EZROUTER coupon, and {pricingConfig.remoteImplementation.label.toLowerCase()} checkout.
      </p>

      <form onSubmit={onSubmit} className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
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
          className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-ink/30"
        />

        <Button type="submit" className="mt-4 w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Magic Link"}
        </Button>

        {message ? <p className="mt-3 text-sm text-sea">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </form>

      <p className="mt-5 text-sm text-ink/60">
        Back to <Link className="underline" href="/">Home</Link>
      </p>
    </main>
  );
}
