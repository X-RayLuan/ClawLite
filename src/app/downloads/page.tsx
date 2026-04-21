"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DownloadApiKeySection } from "@/components/ui/download-api-key-section";
import { MAC_INSTALLER_URL, WIN_INSTALLER_URL } from "@/lib/installer-links";
import { getSupabaseClient } from "@/lib/supabase";

function getDownloadLink(base: string, platform: "mac" | "win", email: string) {
  if (!email) return base;
  return `/api/installer-download?email=${encodeURIComponent(email)}&platform=${platform}`;
}

export default function DownloadsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loginHref, setLoginHref] = useState(`/login?returnTo=${encodeURIComponent(pathname || "/downloads")}`);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);


  const backupUrl = process.env.NEXT_PUBLIC_BACKUP_SKILLS_URL || "https://github.com/X-RayLuan/soul-backup-skill";

  useEffect(() => {
    const currentReturnTo = typeof window !== "undefined"
      ? `${pathname || "/downloads"}${window.location.search || ""}`
      : (pathname || "/downloads");
    setLoginHref(`/login?returnTo=${encodeURIComponent(currentReturnTo)}`);
  }, [pathname]);

  useEffect(() => {
    if (!supabase) {
      router.replace(loginHref);
      return;
    }

    const client = supabase;
    let mounted = true;

    async function settleSession() {
      for (let i = 0; i < 8; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        const user = data.session?.user;
        if (user) {
          setEmail(user.email || "");
          setAccessToken(data.session?.access_token || null);
          setLoading(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (mounted) {
        router.replace(loginHref);
      }
    }

    settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setEmail(session.user.email || "");
        setAccessToken(session.access_token || null);
        setLoading(false);
        return;
      }

      // Supabase can emit an initial empty session while client storage is still hydrating.
      // Avoid bouncing a freshly logged-in user back to /login on that transient event.
      if (event === "INITIAL_SESSION") {
        return;
      }

      if (event === "SIGNED_OUT") {
        router.replace(loginHref);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loginHref, router, supabase]);



  function handleDownload(platform: "mac" | "win") {
    if (email) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    const base = platform === "mac" ? MAC_INSTALLER_URL : WIN_INSTALLER_URL;
    window.open(getDownloadLink(base, platform, email), "_blank");
  }

  if (loading) {
    return <main className="mx-auto max-w-6xl px-6 py-16 text-ink/70">Checking login status...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Your ClawLite Access</h1>
      <div className="mt-2 flex items-center gap-3">
        <p className="text-sm text-ink/65">Logged in as {email}</p>
        <Link href="/clawrouter/dashboard" className="text-sm font-medium text-sea underline underline-offset-2 hover:text-sea/80">
          Go to Dashboard →
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">1</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">Free Download Installer</h2>
          <p className="mt-2 text-sm text-ink/70">Download the latest ClawLite installer for macOS or Windows.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => handleDownload("mac")}>Download macOS</Button>
            <Button variant="secondary" onClick={() => handleDownload("win")}>Download Windows</Button>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">2</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">Backup Skills</h2>
          <p className="mt-2 text-sm text-ink/70">Get the soul-backup-skill to protect configs and make recovery easier.</p>
          <div className="mt-4">
            <Button asChild>
              <a href={backupUrl} target="_blank" rel="noreferrer">Open Backup Skills</a>
            </Button>
          </div>
        </section>


      </div>

      {accessToken ? (
        <div className="mt-5">
          <DownloadApiKeySection accessToken={accessToken} />
        </div>
      ) : null}
    </main>
  );
}
