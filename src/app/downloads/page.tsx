"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

export default function DownloadsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const loginHref = `/login?returnTo=${encodeURIComponent(pathname || "/downloads")}`;

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [partnerSlug, setPartnerSlug] = useState<string | null>(null);

  const backupUrl = process.env.NEXT_PUBLIC_BACKUP_SKILLS_URL || "https://github.com/X-RayLuan/soul-backup-skill";
  const couponExperience = useMemo(() => getCouponExperience(partnerSlug), [partnerSlug]);
  const couponCode = couponExperience.couponCode;

  useEffect(() => {
    const queryPartner = normalizePartnerSlug(searchParams?.get("partner"));
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
  }, [searchParams]);

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
            <Button asChild>
              <a href={MAC_LINK} target="_blank" rel="noreferrer">Download macOS</a>
            </Button>
            <Button asChild variant="secondary">
              <a href={WIN_LINK} target="_blank" rel="noreferrer">Download Windows</a>
            </Button>
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
            <p>2. Click “Get Tokens via EZRouter”</p>
            <p>3. Register/login at openrouter.ezsite.ai</p>
            <p>4. Select Add Credit</p>
            <p>5. {couponExperience.redeemStepText}</p>
            <p>6. Checkout</p>
          </div>
        </section>
      </div>
    </main>
  );
}
