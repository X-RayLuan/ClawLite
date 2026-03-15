"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

function getSafeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/")) return "/downloads";
  if (value.startsWith("//")) return "/downloads";
  return value;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [message, setMessage] = useState("Finishing login...");

  useEffect(() => {
    async function finishLogin() {
      const params = new URLSearchParams(window.location.search);
      const returnTo = getSafeReturnTo(params.get("returnTo"));

      if (!supabase) {
        router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }

      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setMessage("Login failed. Please try again.");
          setTimeout(() => router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`), 1200);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        router.replace(returnTo);
        return;
      }

      setMessage("Session not found. Redirecting to login...");
      setTimeout(() => router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`), 1200);
    }

    finishLogin();
  }, [router, supabase]);

  return <main className="mx-auto max-w-2xl px-6 py-20 text-center text-ink/70">{message}</main>;
}
