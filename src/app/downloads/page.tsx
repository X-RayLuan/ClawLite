"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";

const MAC_LINK = "https://github.com/X-RayLuan/ClawLite-Installer/releases/latest/download/clawlite.dmg";
const WIN_LINK = "https://github.com/X-RayLuan/ClawLite-Installer/releases/latest/download/clawlite-setup.exe";

export default function DownloadsPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const backupUrl = process.env.NEXT_PUBLIC_BACKUP_SKILLS_URL || "https://github.com/X-RayLuan/soul-backup-skill";
  const couponCode = process.env.NEXT_PUBLIC_EZROUTER_COUPON_CODE || "WELCOMEEZROUTER2X";

  useEffect(() => {
    if (!supabase) {
      router.replace("/login");
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      const user = data.session?.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email || "");
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

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
      <h1 className="font-display text-3xl font-semibold text-ink">Downloads & Benefits</h1>
      <p className="mt-2 text-sm text-ink/65">Logged in as {email}</p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Installer</h2>
          <p className="mt-2 text-sm text-ink/70">Download the latest ClawLite installer.</p>
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
          <h2 className="text-lg font-semibold text-ink">Backup Skills</h2>
          <p className="mt-2 text-sm text-ink/70">Access soul backup skill for safer OpenClaw recovery.</p>
          <div className="mt-4">
            <Button asChild>
              <a href={backupUrl} target="_blank" rel="noreferrer">Open Backup Skills</a>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-coral/20 bg-coral/5 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">EZROUTER Coupon</h2>
          <p className="mt-2 text-sm text-ink/70">50% welcome discount code.</p>
          <div className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-3 font-mono text-sm text-ink">{couponCode}</div>
          <Button className="mt-3" variant="secondary" onClick={copyCoupon}>
            {copied ? "Copied" : "Copy Coupon"}
          </Button>
        </section>
      </div>
    </main>
  );
}
