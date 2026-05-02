"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getContentForLang } from "@/lib/content";
import { useLang } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalAuthLink } from "@/components/external-auth-link";
import { DOWNLOAD_LOGIN_HREF } from "@/lib/auth-flow";
import { consumePendingPostLoginReturnTo } from "@/lib/post-login-return";
import { buildRootAuthCallbackRedirect } from "@/lib/root-auth-callback";
import { pricingConfig } from "@/lib/pricing";
import { getSupabaseClient } from "@/lib/supabase";
import Script from "next/script";

export default function HomePage() {
  const { lang } = useLang();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const pageContent = getContentForLang(lang);
  const hero = pageContent.hero;
  const setupSteps = pageContent.setup.steps.slice(0, 4);

  useEffect(() => {
    if (!supabase) return;

    const authCallbackRedirect = buildRootAuthCallbackRedirect(window.location.href);
    if (authCallbackRedirect) {
      window.location.replace(authCallbackRedirect);
      return;
    }

    const client = supabase;
    let mounted = true;

    const consumePendingReturnTo = () => {
      try {
        const pending = window.localStorage.getItem("clawlite-post-login-returnTo");
        const target = consumePendingPostLoginReturnTo(window.location.href, pending);
        window.localStorage.removeItem("clawlite-post-login-returnTo");
        return target;
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
      {/* Hero */}
      <section className="mx-auto grid max-w-[var(--fd-layout-width)] gap-10 px-4 pb-14 pt-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-8 xl:gap-20">
        <div className="space-y-6">
          <Badge>{hero.eyebrow}</Badge>

          <h1 className="font-display text-[clamp(1.8rem,10.5vw,3.4rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-stone-900">
            {hero.title}
            <span className="ml-3 inline-flex items-center align-middle">
              <Image src="/clawlitelogo.png" alt="clawlite logo" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" priority />
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-stone-500 md:text-xl">{hero.subtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={DOWNLOAD_LOGIN_HREF}>{hero.start}</Link>
            </Button>
          </div>

          <Card className="max-w-xl p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">New to OpenClaw?</p>
                <p className="mt-1 text-sm text-stone-500">Start with the guided setup page before you download.</p>
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
          <Card className="relative overflow-hidden p-5 sm:p-6">
            <div className="relative space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">{hero.previewTitle}</p>
              <div className="overflow-hidden rounded-xl border border-stone-300/70">
                <img src="/clawlite-install.gif" alt="clawlite install preview" className="h-auto w-full" />
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Setup Video */}
      <section className="mx-auto max-w-[var(--fd-layout-width)] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <div className="mb-6 text-center">
          <Badge>Setup Video</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-stone-900 sm:text-4xl lg:text-[3.15rem]">
            Watch: ClawLite Setup in 5 Minutes
          </h2>
        </div>
        <div className="overflow-hidden rounded-[2.2rem] border border-stone-300/70 shadow-soft">
          <video
            className="w-full"
            controls
            preload="metadata"
            playsInline
            poster=""
          >
            <source src="/clawlite-setup.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* Setup Steps */}
      <section className="mx-auto max-w-[var(--fd-layout-width)] px-4 pb-14 sm:px-6 lg:px-8">
        <Card className="p-5 sm:p-6 md:p-7">
          <div className="grid gap-4 md:grid-cols-4">
            {setupSteps.map((step) => (
              <div key={step.id} className="rounded-xl bg-white/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">{step.id}</p>
                <p className="mt-2 text-base font-semibold text-stone-900">{step.title}</p>
                <p className="mt-1 text-sm text-stone-500">{step.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Why ClawLite */}
      <section className="mx-auto max-w-[var(--fd-layout-width)] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <div className="mb-10 text-center">
          <Badge>Why ClawLite</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-stone-900 sm:text-4xl lg:text-[3.15rem]">
            Install fast. Run cheaper. Stay safe.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-stone-500">
            ClawLite gives you one-click setup, lower token costs, and a built-in SOUL Backup safety layer.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
              <span className="text-2xl">&#x26A1;</span>
            </div>
            <h3 className="font-display text-xl font-semibold leading-[1.05] text-stone-900">One-Click Install</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Go from zero to a working OpenClaw stack in minutes, without manual setup friction.
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
              <span className="text-2xl">&#x1F4B0;</span>
            </div>
            <h3 className="font-display text-xl font-semibold leading-[1.05] text-stone-900">Cheaper Token Routing</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Cut ongoing model spend with optimized routing and predictable usage control.
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
              <span className="text-2xl">&#x1F6E1;&#xFE0F;</span>
            </div>
            <h3 className="font-display text-xl font-semibold leading-[1.05] text-stone-900">SOUL Backup</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Versioned backup and restore for your OpenClaw brain, with safer rollback when changes go wrong.
            </p>
          </Card>
        </div>
      </section>

      {/* SOUL Backup Feature */}
      <section className="mx-auto max-w-[var(--fd-layout-width)] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <Card className="p-5 sm:p-6 md:p-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] lg:gap-14">
            <div>
              <Badge>SOUL Backup</Badge>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-stone-900 sm:text-4xl lg:text-[3.15rem]">
                Never lose your OpenClaw brain.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-500">
                Backup, diff, and restore your critical configs from the UI — so recovery is fast, visible, and auditable.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-stone-500">
                <li>&#x2022; One-click backup with integrity validation</li>
                <li>&#x2022; Diff preview before restore (sensitive fields masked)</li>
                <li>&#x2022; Failure alerts and audit trail for every action</li>
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

            <div className="rounded-xl border border-stone-300/70 bg-white/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Recovery Flow</p>
              <div className="mt-3 space-y-3 text-sm text-stone-600">
                <div className="rounded-xl bg-white/50 p-3">1. Choose backup version</div>
                <div className="rounded-xl bg-white/50 p-3">2. Review diff preview</div>
                <div className="rounded-xl bg-white/50 p-3">3. Confirm restore safely</div>
                <div className="rounded-xl bg-white/50 p-3">4. Verify + audit log</div>
              </div>
            </div>
          </div>
        </Card>
      </section>


      <Script id="chatpilot-config" strategy="beforeInteractive">
        {`window.chatpilotConfig = {
          chatbotId: "4bfc5c07ab9043b3a0d69b12b2e86b07",
          domain: "https://www.newoaks.ai",
          chatModeOnly: true
        }`}
      </Script>
      <Script id="chatpilot-embed" src="https://www.newoaks.ai/embed.min.js" strategy="afterInteractive" />

      {/* Verified Section */}
      <section className="mx-auto max-w-[var(--fd-layout-width)] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <div className="mb-10 text-center">
          <Badge>Done = Verified</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-stone-900 sm:text-4xl lg:text-[3.15rem]">
            Not just installed — proven to work.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-stone-500">
            ClawLite is the only OpenClaw installer that verifies every step, backs up your configs, and manages token billing for you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
              <span className="text-2xl">&#x26A1;</span>
            </div>
            <h3 className="font-display text-xl font-semibold leading-[1.05] text-stone-900">5 minutes. Zero DevOps. Verified.</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              One-click install. Every dependency verified. First query successful.
            </p>
            <div className="mt-4 space-y-1 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>Installation complete</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>Dependencies verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>API keys authenticated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>First query successful</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
              <span className="text-2xl">&#x1F4B0;</span>
            </div>
            <h3 className="font-display text-xl font-semibold leading-[1.05] text-stone-900">Managed token billing. Simple and transparent.</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Token pricing locked in at setup. No hidden fees, no surprises.
            </p>
            <div className="mt-4 space-y-1 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>Token pricing locked in</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>Real-time usage dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>Monthly savings report</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
              <span className="text-2xl">&#x1F512;</span>
            </div>
            <h3 className="font-display text-xl font-semibold leading-[1.05] text-stone-900">Your configs are assets. Verified safe.</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Automatic backups. Encrypted storage. One-click restore. Zero data loss.
            </p>
            <div className="mt-4 space-y-1 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>Automatic daily backups</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>Encrypted at rest (AES-256)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>One-click restore</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">&#x2713;</span>
                <span>Audit trail</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" asChild>
            <Link href={DOWNLOAD_LOGIN_HREF}>Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-[var(--fd-layout-width)] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <div className="mb-8">
          <Badge>Pricing</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-stone-900 sm:text-4xl lg:text-[3.15rem]">BYOK or ClawLite Tokens. Your choice.</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Flexible</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-stone-900">{pricingConfig.byok.label}</h3>
            <div className="mt-2 text-3xl font-semibold text-stone-900">{pricingConfig.byok.platformFee}</div>
            <p className="mt-2 text-sm text-stone-500">{pricingConfig.byok.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-500">
              <li>&#x2022; Connect your own OpenAI/Anthropic/other keys</li>
              <li>&#x2022; Full control over spend and provider choice</li>
              <li>&#x2022; Great for technical users and experiments</li>
            </ul>
          </Card>

          <Card className="border-2 !border-stone-900 p-5 shadow-elevated sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-900">Recommended</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-stone-900">{pricingConfig.tokens.label}</h3>
            <div className="mt-2 text-3xl font-semibold text-stone-900">{pricingConfig.tokens.pricingLabel}</div>
            <p className="mt-2 text-sm text-stone-500">{pricingConfig.tokens.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-500">
              <li>&#x2022; {pricingConfig.tokens.discountText}</li>
              <li>&#x2022; One-click setup, no provider key hunting</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/login?returnTo=%2Fdownloads">Get Started</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Hands-on Help</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-stone-900">{pricingConfig.remoteImplementation.label}</h3>
            <div className="mt-2 text-3xl font-semibold text-stone-900">{pricingConfig.remoteImplementation.price}</div>
            <p className="mt-2 text-sm text-stone-500">{pricingConfig.remoteImplementation.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-500">
              <li>&#x2022; Guided setup with a real operator</li>
              <li>&#x2022; Faster path to a working deployment</li>
              <li>&#x2022; Best for teams that want implementation help, not homework</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <ExternalAuthLink href={pricingConfig.remoteImplementation.stripeUrl}>{pricingConfig.remoteImplementation.ctaLabel}</ExternalAuthLink>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
