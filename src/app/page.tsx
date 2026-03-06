"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { content } from "@/lib/content";
import { useLang } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const { lang } = useLang();
  const hero = content[lang].hero;
  const setupSteps = content[lang].setup.steps.slice(0, 4);

  return (
    <main className="gradient-bg">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-14 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Badge className="border-coral/20 bg-coral/10 text-coral">{hero.eyebrow}</Badge>

          <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink md:text-6xl">
            {hero.title}
            <span className="ml-3 inline-flex items-center align-middle">
              <Image src="/lazyclawlogo.png" alt="LazyClaw logo" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" priority />
            </span>
          </h1>

          <p className="max-w-xl text-lg text-ink/70 md:text-xl">{hero.subtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="shadow-glow" asChild>
              <Link href="/setup?path=wizard#wizard">Start Onboarding Wizard</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/setup?path=installer#installer">Free Installer Download</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {hero.highlights.map((item) => (
              <div key={item} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm text-ink/80 shadow-soft">
                <span className="h-2 w-2 rounded-full bg-sea" />
                <span>{item}</span>
              </div>
            ))}
          </div>
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
                <img src="/lazyclaw-install.gif" alt="LazyClaw install preview" className="h-auto w-full" />
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

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="mb-5 text-center">
          <Badge className="border-coral/20 bg-coral/10 text-coral">Two Launch Paths</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            Choose your path: Onboarding Wizard or Installer.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-ink/70">
            Same OpenClaw engine. Two different ways to get productive fast.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-black/10 bg-white/90 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sea/10">
              <span className="text-2xl">🧭</span>
            </div>
            <h3 className="text-xl font-semibold text-ink">Path 1 — Onboarding Wizard</h3>
            <p className="mt-2 text-sm text-ink/70">
              Best for first-time users who want a guided setup flow and clear checkpoints.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Step-by-step setup with guardrails</li>
              <li>• API/provider setup guidance</li>
              <li>• Great for learning OpenClaw fundamentals</li>
            </ul>
            <div className="mt-6">
              <Button asChild>
                <Link href="/setup?path=wizard#wizard">Open Wizard</Link>
              </Button>
            </div>
          </Card>

          <Card className="border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-6 shadow-soft">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-coral/10">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-ink">Path 2 — ClawLite Installer</h3>
            <p className="mt-2 text-sm text-ink/70">
              Fastest path: install OpenClaw with the ClawLite installer on Windows or macOS.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Electron installer flow</li>
              <li>• Installs OpenClaw itself</li>
              <li>• Minimal manual configuration</li>
            </ul>
            <div className="mt-6">
              <Button asChild>
                <Link href="/setup?path=installer#installer">Use Installer</Link>
              </Button>
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
            <Link href="/setup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-5">
          <Badge className="border-coral/20 bg-coral/10 text-coral">Pricing</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink">BYOK or LazyClaw Tokens. Your choice.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">Flexible</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">BYOK</h3>
            <div className="mt-2 text-3xl font-semibold text-ink">$0 platform fee</div>
            <p className="mt-2 text-sm text-ink/65">Your key. Your usage. Your bill.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Connect your own OpenAI/Anthropic/other keys</li>
              <li>• Full control over spend and provider choice</li>
              <li>• Great for technical users and experiments</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-6 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Recommended</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">LazyClaw Tokens</h3>
            <div className="mt-2 text-3xl font-semibold text-ink">Usage-based</div>
            <p className="mt-2 text-sm text-ink/65">Managed billing for fast-moving teams.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• 50% discount from official API price</li>
              <li>• One-click setup, no provider key hunting</li>
              <li>• Token packs for predictable operations</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="https://openrouter.ezsite.ai" target="_blank">Get Tokens via EZRouter</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/setup">Start Setup</Link>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
