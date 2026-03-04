"use client";

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
  const setupSteps = content[lang].setup.steps.slice(0, 3);

  return (
    <main className="gradient-bg">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-14 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Badge className="border-coral/20 bg-coral/10 text-coral">{hero.eyebrow}</Badge>

          <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink md:text-6xl">
            {hero.title}
            <span className="ml-2 inline-block animate-floaty">🦞</span>
          </h1>

          <p className="max-w-xl text-lg text-ink/70 md:text-xl">{hero.subtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="shadow-glow" asChild>
              <Link href="/setup">{hero.start}</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/troubleshoot">{hero.secondary}</Link>
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
          <Card className="relative overflow-hidden border-black/10 bg-white/90">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sea/20 blur-3xl" />
            <div className="absolute -bottom-8 left-1/3 h-36 w-36 rounded-full bg-coral/20 blur-3xl" />
            <div className="relative space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">{hero.previewTitle}</p>

              {hero.previewSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-black/5 bg-white/85 p-4 backdrop-blur"
                >
                  <div className="mb-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-ink px-2 text-xs font-semibold text-white">
                    0{index + 1}
                  </div>
                  <p className="text-sm font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-sm text-ink/65">{step.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-4 rounded-3xl border border-black/5 bg-white/70 p-5 shadow-soft md:grid-cols-3 md:p-7">
          {setupSteps.map((step) => (
            <div key={step.id} className="rounded-2xl bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">{step.id}</p>
              <p className="mt-2 text-base font-semibold text-ink">{step.title}</p>
              <p className="mt-1 text-sm text-ink/65">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
