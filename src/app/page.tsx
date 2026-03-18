"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { content } from "@/lib/content";
import { useLang } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalAuthLink } from "@/components/external-auth-link";
import { DOWNLOAD_LOGIN_HREF } from "@/lib/auth-flow";
import { pricingConfig } from "@/lib/pricing";
import { getSupabaseClient } from "@/lib/supabase";

export default function HomePage() {
  const { lang } = useLang();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const hero = content[lang].hero;
  const setupSteps = content[lang].setup.steps.slice(0, 4);

  useEffect(() => {
    if (!supabase) return;

    const client = supabase;
    let mounted = true;

    const consumePendingReturnTo = () => {
      try {
        const pending = window.localStorage.getItem("clawlite-post-login-returnTo");
        if (!pending || !pending.startsWith("/")) return null;
        window.localStorage.removeItem("clawlite-post-login-returnTo");
        return pending;
      } catch {
        return null;
      }
    };

    async function settleSession() {
      for (let i = 0; i < 8; i += 1) {
        const { data } = await client.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          const pending = consumePendingReturnTo();
          if (pending) {
            router.replace(pending);
          }
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    settleSession();

    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const pending = consumePendingReturnTo();
        if (pending) {
          router.replace(pending);
        }
        return;
      }

      if (event === "INITIAL_SESSION") {
        return;
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <main className="gradient-bg">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-14 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Badge className="border-coral/20 bg-coral/10 text-coral">{hero.eyebrow}</Badge>

          <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink md:text-6xl">
            {hero.title}
            <span className="ml-3 inline-flex items-center align-middle">
              <Image src="/clawlitelogo.png" alt="clawlite logo" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" priority />
            </span>
          </h1>

          <p className="max-w-xl text-lg text-ink/70 md:text-xl">{hero.subtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="shadow-glow" asChild>
              <Link href={DOWNLOAD_LOGIN_HREF}>{hero.start}</Link>
            </Button>
          </div>

          <Card className="max-w-xl border-sea/20 bg-sea/5 p-4 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">New to OpenClaw?</p>
                <p className="mt-1 text-sm text-ink/75">Start with the guided setup page before you download.</p>
              </div>
              <Button asChild variant="secondary">
                <Link href="/setup">See Setup Guide</Link>
              </Button>
            </div>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative"
        >
          <div className="hero-grid-glow absolute -inset-6 -z-10 rounded-[2rem]" />
          <Card className="relative overflow-hidden border-black/10 bg-white/90 p-4">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sea/20 blur-3xl" />
            <div className="absolute -bottom-8 left-1/3 h-36 w-36 rounded-full bg-coral/20 blur-3xl" />
            <div className="relative space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">{hero.previewTitle}</p>
              <div className="overflow-hidden rounded-2xl border border-black/5 bg-black/5">
                <img src="/clawlite-install.gif" alt="clawlite install preview" className="h-auto w-full" />
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-4 rounded-3xl border border-black/5 bg-white/70 p-5 shadow-soft md:grid-cols-4 md:p-7">
          {setupSteps.map((step) => (
            <div key={step.id} className="rounded-2xl bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">{step.id}</p>
              <p className="mt-2 text-base font-semibold text-ink">{step.title}</p>
              <p className="mt-1 text-sm text-ink/65">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="mb-6 text-center">
          <Badge className="border-sea/20 bg-sea/10 text-sea">Why ClawLite</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            Install fast. Run cheaper. Stay safe.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-ink/70">
            ClawLite gives you one-click setup, lower token costs, and a built-in SOUL Backup safety layer.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-black/10 bg-white/90 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sea/10">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-ink">One-Click Install</h3>
            <p className="mt-2 text-sm text-ink/70">
              Go from zero to a working OpenClaw stack in minutes, without manual setup friction.
            </p>
          </Card>

          <Card className="border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-6 shadow-soft">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-coral/10">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-ink">Cheaper Token Routing</h3>
            <p className="mt-2 text-sm text-ink/70">
              Cut ongoing model spend with optimized routing and predictable usage control.
            </p>
          </Card>

          <Card className="border-black/10 bg-white/90 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sea/10">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold text-ink">SOUL Backup</h3>
            <p className="mt-2 text-sm text-ink/70">
              Versioned backup and restore for your OpenClaw brain, with safer rollback when changes go wrong.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-6 rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <Badge className="border-coral/20 bg-coral/10 text-coral">SOUL Backup</Badge>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
              Never lose your OpenClaw brain.
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-ink/70">
              Backup, diff, and restore your critical configs from the UI — so recovery is fast, visible, and auditable.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-ink/75">
              <li>• One-click backup with integrity validation</li>
              <li>• Diff preview before restore (sensitive fields masked)</li>
              <li>• Failure alerts and audit trail for every action</li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/login">Enable SOUL Backup</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/login">View Backup Docs</Link>
              </Button>
            </div>
          </div>

          <Card className="border-black/10 bg-black/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">Recovery Flow</p>
            <div className="mt-3 space-y-3 text-sm text-ink/75">
              <div className="rounded-xl bg-white/80 p-3">1. Choose backup version</div>
              <div className="rounded-xl bg-white/80 p-3">2. Review diff preview</div>
              <div className="rounded-xl bg-white/80 p-3">3. Confirm restore safely</div>
              <div className="rounded-xl bg-white/80 p-3">4. Verify + audit log</div>
            </div>
          </Card>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-8 text-center">
          <Badge className="border-sea/20 bg-sea/10 text-sea">Done = Verified</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            Not just installed — proven to work.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-ink/70">
            ClawLite is the only OpenClaw installer that verifies every step, backs up your configs, and guarantees 40% cheaper tokens.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-black/10 bg-white/90 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sea/10">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-ink">5 minutes. Zero DevOps. Verified.</h3>
            <p className="mt-2 text-sm text-ink/70">
              One-click install. Every dependency verified. First query successful.
            </p>
            <div className="mt-4 space-y-1 text-xs text-ink/60">
              <div className="flex items-center gap-2">
                <span className="text-sea">✓</span>
                <span>Installation complete</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sea">✓</span>
                <span>Dependencies verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sea">✓</span>
                <span>API keys authenticated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sea">✓</span>
                <span>First query successful</span>
              </div>
            </div>
          </Card>

          <Card className="border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-6 shadow-glow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-coral/10">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-ink">40% cheaper tokens. Verified savings.</h3>
            <p className="mt-2 text-sm text-ink/70">
              Not a promise. A verified 40% savings on every single call.
            </p>
            <div className="mt-4 space-y-1 text-xs text-ink/60">
              <div className="flex items-center gap-2">
                <span className="text-coral">✓</span>
                <span>Token pricing locked in</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-coral">✓</span>
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-coral">✓</span>
                <span>Real-time usage dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-coral">✓</span>
                <span>Monthly savings report</span>
              </div>
            </div>
          </Card>

          <Card className="border-black/10 bg-white/90 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sea/10">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold text-ink">Your configs are assets. Verified safe.</h3>
            <p className="mt-2 text-sm text-ink/70">
              Automatic backups. Encrypted storage. One-click restore. Zero data loss.
            </p>
            <div className="mt-4 space-y-1 text-xs text-ink/60">
              <div className="flex items-center gap-2">
                <span className="text-sea">✓</span>
                <span>Automatic daily backups</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sea">✓</span>
                <span>Encrypted at rest (AES-256)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sea">✓</span>
                <span>One-click restore</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sea">✓</span>
                <span>Audit trail</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" className="shadow-glow" asChild>
            <Link href={DOWNLOAD_LOGIN_HREF}>Get Started Free</Link>
          </Button>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-5">
          <Badge className="border-coral/20 bg-coral/10 text-coral">Pricing</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink">BYOK or ClawLite Tokens. Your choice.</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">Flexible</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">{pricingConfig.byok.label}</h3>
            <div className="mt-2 text-3xl font-semibold text-ink">{pricingConfig.byok.platformFee}</div>
            <p className="mt-2 text-sm text-ink/65">{pricingConfig.byok.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Connect your own OpenAI/Anthropic/other keys</li>
              <li>• Full control over spend and provider choice</li>
              <li>• Great for technical users and experiments</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-6 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Recommended</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">{pricingConfig.tokens.label}</h3>
            <div className="mt-2 text-3xl font-semibold text-ink">{pricingConfig.tokens.pricingLabel}</div>
            <p className="mt-2 text-sm text-ink/65">{pricingConfig.tokens.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• {pricingConfig.tokens.discountText}</li>
              <li>• One-click setup, no provider key hunting</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/login?returnTo=%2Fdownloads">Get 50% Discount Token Coupon</Link>
              </Button>
            </div>
          </article>

          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">Hands-on Help</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">{pricingConfig.remoteImplementation.label}</h3>
            <div className="mt-2 text-3xl font-semibold text-ink">{pricingConfig.remoteImplementation.price}</div>
            <p className="mt-2 text-sm text-ink/65">{pricingConfig.remoteImplementation.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Guided setup with a real operator</li>
              <li>• Faster path to a working deployment</li>
              <li>• Best for teams that want implementation help, not homework</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <ExternalAuthLink href={pricingConfig.remoteImplementation.stripeUrl}>{pricingConfig.remoteImplementation.ctaLabel}</ExternalAuthLink>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
