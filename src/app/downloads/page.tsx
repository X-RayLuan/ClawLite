"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DownloadApiKeySection } from "@/components/ui/download-api-key-section";
import { MAC_INSTALLER_URL, WIN_INSTALLER_URL } from "@/lib/installer-links";
import { getSupabaseClient } from "@/lib/supabase";
import { useLang } from "@/components/lang-provider";
import { getContentForLang } from "@/lib/content";

export default function DownloadsPage() {
  const { lang } = useLang();
  const t = getContentForLang(lang).downloads;
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ email?: string; access_token?: string } | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    async function settleSession() {
      for (let i = 0; i < 5; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;
        if (data.session?.user) {
          setUser({
            email: data.session.user.email || "",
            access_token: data.session.access_token || undefined,
          });
          setLoading(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (mounted) {
        setLoading(false);
      }
    }

    settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((event: string, session: any) => {
      if (session?.user) {
        setUser({
          email: session.user.email || "",
          access_token: session.access_token || undefined,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  function handleDownload(platform: "mac" | "win") {
    if (user?.email) {
      navigator.clipboard.writeText(user.email).catch(() => {});
    }
    const url = platform === "mac" ? MAC_INSTALLER_URL : WIN_INSTALLER_URL;
    window.open(url, "_blank");
  }

  const isLoggedIn = !!user?.email;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      {/* Header: always show, different content for logged-in vs logged-out */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            {isLoggedIn ? t.pageTitle : t.publicPageTitle}
          </h1>
          {isLoggedIn && (
            <p className="mt-1 text-sm text-ink/65">
              {t.loggedInAs.replace("{email}", user.email!)}
            </p>
          )}
          {!isLoggedIn && (
            <p className="mt-1 text-sm text-ink/65">{t.publicPageDesc}</p>
          )}
        </div>

        {/* Auth buttons */}
        {isLoggedIn ? (
          <Link
            href="/clawrouter/dashboard"
            className="rounded-full bg-sea px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-sea/90 hover:shadow-lg"
          >
            {t.goToDashboard}
          </Link>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" asChild>
              <Link href="/login">{t.login}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t.register}</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Download cards */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">1</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{t.section1Title}</h2>
          <p className="mt-2 text-sm text-ink/70">{t.section1Desc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => handleDownload("mac")}>{t.downloadMac}</Button>
            <Button variant="secondary" onClick={() => handleDownload("win")}>{t.downloadWin}</Button>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">2</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{t.section2Title}</h2>
          <p className="mt-2 text-sm text-ink/70">{t.section2Desc}</p>
          <div className="mt-4">
            <Button asChild>
              <a
                href={process.env.NEXT_PUBLIC_BACKUP_SKILLS_URL || "https://github.com/X-RayLuan/soul-backup-skill"}
                target="_blank"
                rel="noreferrer"
              >
                {t.openBackupSkills}
              </a>
            </Button>
          </div>
        </section>
      </div>

      {/* API Key section — only shown when logged in */}
      {user?.access_token ? (
        <div className="mt-5">
          <DownloadApiKeySection accessToken={user.access_token} />
        </div>
      ) : null}
    </main>
  );
}
