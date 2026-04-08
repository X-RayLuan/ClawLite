"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import {
  getCouponExperience,
  getPartnerCouponConfig,
  normalizePartnerSlug,
  PARTNER_REFERRAL_COOKIE,
} from "@/lib/partner-referral";

const MAC_LINK = "https://github.com/X-RayLuan/ClawLite-Installer/releases/latest/download/clawlite.dmg";
const WIN_LINK = "https://github.com/X-RayLuan/ClawLite-Installer/releases/latest/download/clawlite-setup.exe";

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
  const [copied, setCopied] = useState(false);
  const [partnerSlug, setPartnerSlug] = useState<string | null>(null);

  const backupUrl = process.env.NEXT_PUBLIC_BACKUP_SKILLS_URL || "https://github.com/X-RayLuan/soul-backup-skill";
  const couponExperience = useMemo(() => getCouponExperience(partnerSlug), [partnerSlug]);
  const couponCode = couponExperience.couponCode;

  useEffect(() => {
    const currentReturnTo = typeof window !== "undefined"
      ? `${pathname || "/downloads"}${window.location.search || ""}`
      : (pathname || "/downloads");
    setLoginHref(`/login?returnTo=${encodeURIComponent(currentReturnTo)}`);

    const queryPartner = normalizePartnerSlug(
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("partner") : null
    );
    if (queryPartner && getPartnerCouponConfig(queryPartner)) {
      document.cookie = `${PARTNER_REFERRAL_COOKIE}=${queryPartner}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
      setPartnerSlug(queryPartner);
      return;
    }

    const cookiePartner = normalizePartnerSlug(
      document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${PARTNER_REFERRAL_COOKIE}=`))
        ?.split("=")
        .slice(1)
        .join("=")
    );
    if (cookiePartner && getPartnerCouponConfig(cookiePartner)) {
      setPartnerSlug(cookiePartner);
      return;
    }

    setPartnerSlug(null);
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
          try {
            const { data: profile } = await (client as any)
              .from("user_profiles")
              .select("partner_slug")
              .eq("user_id", user.id)
              .maybeSingle();
            if (mounted && profile?.partner_slug && getPartnerCouponConfig(profile.partner_slug)) {
              setPartnerSlug(normalizePartnerSlug(profile.partner_slug));
            }
          } catch {
            // ignore profile lookup failures; cookie/query fallback still works
          }
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

  async function copyCoupon() {
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload(platform: "mac" | "win") {
    if (email) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    const base = platform === "mac" ? MAC_LINK : WIN_LINK;
    window.open(getDownloadLink(base, platform, email), "_blank");
  }

  if (loading) {
    return <main className="mx-auto max-w-6xl px-6 py-16 text-ink/70">Checking login status...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Your ClawLite Access</h1>
      <p className="mt-2 text-sm text-ink/65">Logged in as {email}</p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
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

        <section className="rounded-2xl border border-coral/20 bg-coral/5 p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">3</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">Get ClawRouter Access</h2>
          <p className="mt-2 text-sm text-ink/70">Add credits to your ClawRouter account to start using managed AI routing with cheaper token pricing.</p>
          {couponExperience.partner ? (
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-coral/80">
              Referred by {couponExperience.partner.displayName}
            </p>
          ) : null}
          <div className="mt-4">
            <Button asChild>
              <a href="https://clawlite.ai/clawrouter/dashboard" target="_blank" rel="noreferrer">Get ClawRouter Tokens →</a>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
