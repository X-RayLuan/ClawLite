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

  return (
    <main className="gradient-bg">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          <Badge>{hero.eyebrow}</Badge>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            {hero.title} <span className="inline-block animate-floaty">🦞</span>
          </h1>
          <p className="text-lg text-ink/70">{hero.subtitle}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/setup">{hero.start}</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/troubleshoot">{hero.secondary}</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {hero.highlights.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-ink/70">
                <span className="h-2 w-2 rounded-full bg-sea" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <Card className="relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sea/20 blur-2xl" />
            <div className="absolute -bottom-10 left-0 h-40 w-40 rounded-full bg-coral/20 blur-3xl" />
            <div className="relative space-y-6">
              <div className="text-sm font-semibold text-ink/60">{hero.previewTitle}</div>
              <div className="space-y-4">
                {hero.previewSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white/80 p-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{step.title}</p>
                      <p className="text-sm text-ink/60">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
