"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildLoginHref, getSafeExternal, getSafeReturnTo } from "@/lib/auth-flow";
import { getSupabaseClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [message, setMessage] = useState("Finishing login...");

  useEffect(() => {
    async function finishLogin() {
      const params = new URLSearchParams(window.location.search);
      const returnTo = getSafeReturnTo(params.get("returnTo"));
      const external = getSafeExternal(params.get("external"));
      const loginFallback = (authError?: string | null, authErrorDescription?: string | null) =>
        buildLoginHref({ returnTo, external, authError, authErrorDescription });

      if (!supabase) {
        router.replace(loginFallback());
        return;
      }

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const queryError = url.searchParams.get("error");
      const queryErrorDescription = url.searchParams.get("error_description");
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const hashError = hash.get("error");
      const hashErrorDescription = hash.get("error_description");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const authError = queryError || hashError;
      const authErrorDescription = queryErrorDescription || hashErrorDescription;

      if (authError) {
        const fallbackError = /expired/i.test(authErrorDescription || authError) ? "expired" : "invalid";
        setMessage("Magic link is no longer valid. Redirecting to login...");
        setTimeout(() => router.replace(loginFallback(fallbackError, authErrorDescription)), 1200);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          const fallbackError = /expired/i.test(error.message || "") ? "expired" : "invalid";
          setMessage("Login failed. Redirecting to login...");
          setTimeout(() => router.replace(loginFallback(fallbackError, error.message)), 1200);
          return;
        }
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          const fallbackError = /expired/i.test(error.message || "") ? "expired" : "invalid";
          setMessage("Login failed. Redirecting to login...");
          setTimeout(() => router.replace(loginFallback(fallbackError, error.message)), 1200);
          return;
        }
      } else {
        setMessage("Magic link is missing or expired. Redirecting to login...");
        setTimeout(() => router.replace(loginFallback("expired")), 1200);
        return;
      }

      let settledUser = null;
      for (let i = 0; i < 8; i += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          settledUser = data.session.user;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (settledUser) {
        try {
          const rpcClient = supabase as any;
          await rpcClient.rpc("sync_auth_user_to_profile", {
            p_user_id: settledUser.id,
          });
        } catch (profileSyncError) {
          console.error("user profile sync failed", profileSyncError);
        }

        try {
          const rpcClient = supabase as any;
          await rpcClient.rpc("mark_waitlist_customer_converted", {
            p_email: settledUser.email,
            p_user_id: settledUser.id,
            p_confirmed_at: settledUser.email_confirmed_at ?? null,
            p_last_sign_in_at: settledUser.last_sign_in_at ?? null,
            p_source: "auth_callback",
          });
        } catch (conversionError) {
          console.error("waitlist conversion sync failed", conversionError);
        }

        if (external) {
          window.location.replace(external);
          return;
        }
        window.location.replace(returnTo);
        return;
      }

      setMessage("Session not found. Redirecting to login...");
      setTimeout(() => router.replace(loginFallback("invalid")), 1200);
    }

    finishLogin();
  }, [router, supabase]);

  return <main className="mx-auto max-w-2xl px-6 py-20 text-center text-ink/70">{message}</main>;
}
