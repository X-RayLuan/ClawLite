"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DownloadApiKeySection } from "@/components/ui/download-api-key-section";
import { MAC_INSTALLER_URL, WIN_INSTALLER_URL } from "@/lib/installer-links";
import {
  getCouponExperience,
  getPartnerCouponConfig,
  normalizePartnerSlug,
  PARTNER_REFERRAL_COOKIE,
} from "@/lib/partner-referral";
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
          setAccessToken(data.session?.access_token || null);
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

  async function copyCoupon() {
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

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
      <p className="mt-2 text-sm text-ink/65">Logged in as {email}</p>

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

        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">3</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{couponExperience.headline}</h2>
          <p className="mt-2 text-sm text-ink/70">{couponExperience.body}</p>
          {couponExperience.partner ? (
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-coral/80">
              Referred by {couponExperience.partner.displayName}
            </p>
          ) : null}
          <div className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-3 font-mono text-sm text-ink">{couponCode}</div>
          <Button className="mt-3" variant="secondary" onClick={copyCoupon}>
            {copied ? "Copied" : "Copy Promo Code"}
          </Button>
          <div className="mt-4 space-y-2 text-sm text-ink/75">
            <p className="font-medium text-ink">How to redeem:</p>
            <p>1. Go to ClawLite.ai → Pricing</p>
            <p>2. Click "Get Tokens via EZRouter"</p>
            <p>3. Register/login at openrouter.ezsite.ai</p>
            <p>4. Select Add Credit</p>
            <p>5. {couponExperience.redeemStepText}</p>
            <p>6. Checkout</p>
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
