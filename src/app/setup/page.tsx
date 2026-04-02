import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDollarSign, Download, KeyRound, Rocket, Shield, Smartphone, Sparkles, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DOWNLOAD_LOGIN_HREF } from "@/lib/auth-flow";

export const metadata = {
  title: "ClawLite Setup | OpenClaw one-click install",
  description:
    "OpenClaw, ready to use. Tokens, half the price. Install ClawLite in one path and choose BYOK or managed ClawLite tokens.",
};

const highlights = [
  {
    icon: Rocket,
    title: "One-click install",
    body: "Download, click, done. No Docker, no terminal command setup.",
  },
  {
    icon: CircleDollarSign,
    title: "Cheaper tokens",
    body: "Pay half the price of OpenAI/Anthropic official APIs. Same models, lower cost.",
  },
  {
    icon: KeyRound,
    title: "BYOK free",
    body: "Use your own API key. BYOK is free forever. Keep direct provider control.",
  },
  {
    icon: Shield,
    title: "Local-first control",
    body: "Runs on your machine. Keep sensitive workflows in your environment, no forced lock-in.",
  },
];

const trustAnchors = [
  "🌟 Open Source: Built on OpenClaw (12,000+ GitHub stars).",
  "🔓 No vendor lock-in: Bring your own key or switch providers anytime.",
  "☁️ Built for local-first usage and transparent operation.",
];

const faqs = [
  {
    question: "How is ClawLite different from OpenClaw?",
    answer:
      "ClawLite is a one-click installer and setup layer for OpenClaw. It keeps the same powerful AI agent, but lowers setup friction and cost to start.",
  },
  {
    question: "I already have OpenClaw. Should I use ClawLite?",
    answer:
      "Yes. ClawLite is ideal if you already have OpenClaw know-how but want faster setup and lower token costs.",
  },
  {
    question: "Is ClawLite really free?",
    answer:
      "Use your own API key with BYOK at no platform fee. If you use managed ClawLite tokens, pricing is designed to be half the cost of official API usage.",
  },
  {
    question: "Does ClawLite support local-first control?",
    answer:
      "Yes. Your runtime and local data remain under your control. ClawLite is designed to preserve a local-first operating model, with flexible provider choices.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function SetupPage() {
  return (
    <main className="gradient-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pb-20 md:pt-20">
        <Badge className="border-coral/20 bg-coral/10 text-coral">Quick start</Badge>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">Install ClawLite</p>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink md:text-6xl">
              OpenClaw, Ready to Use. Tokens, Half the Price.
            </h1>
            <p className="max-w-2xl text-lg text-ink/75 md:text-xl">
              One-click installer for Mac and Windows. Use your own API key for free, or buy tokens at half the cost.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="shadow-glow" asChild>
                <Link href="/downloads">Install ClawLite</Link>
              </Button>
              <Button size="lg" asChild variant="secondary">
                <Link href="/pricing">Try with BYOK</Link>
              </Button>
            </div>

            <p className="text-sm text-ink/60">Prefer auth first? Start here: <Link href={DOWNLOAD_LOGIN_HREF} className="underline decoration-sea/40 underline-offset-4">log in to continue</Link>.</p>
          </div>

          <Card className="border-coral/20 bg-white/80 p-6 shadow-soft">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-2 text-xl text-ink">
                <Sparkles className="h-5 w-5 text-coral" />
                First-time user promise
              </CardTitle>
              <CardDescription>
                10-second clarity goal: what to install, how to pay less, and where to start.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4 grid gap-4 p-0 text-sm text-ink/75">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-sea" />
                <div>
                  <p className="font-medium text-ink">Starter path</p>
                  <p>Choose install or BYOK, then run your first session.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-sea" />
                <div>
                  <p className="font-medium text-ink">Pricing clarity</p>
                  <p>No surprises, no hidden seat fee.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-sea" />
                <div>
                  <p className="font-medium text-ink">Control by default</p>
                  <p>Local-first setup with vendor freedom.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border-black/10 bg-white/95">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-ink">
                    <Icon className="h-5 w-5 text-sea" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.body}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-soft md:p-8">
          <h2 className="text-2xl font-semibold text-ink md:text-3xl">Trust anchors</h2>
          <p className="mt-2 text-sm text-ink/70">Reliable signals for first-time evaluators and IT buyers.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {trustAnchors.map((anchor) => (
              <div key={anchor} className="rounded-2xl bg-white p-4 text-sm text-ink/80 ring-1 ring-black/5">
                {anchor}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-soft md:p-10">
          <div className="mb-6">
            <Badge className="border-sea/20 bg-sea/10 text-sea">FAQ</Badge>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Short FAQ</h2>
          </div>

          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-black/8 bg-white/90 p-5">
                <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm text-ink/75">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-[2rem] bg-ink p-8 text-white md:p-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            <Smartphone className="h-4 w-4" />
            <span>Start now</span>
          </div>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Install. Use. Upgrade.</h2>
          <p className="mt-4 max-w-2xl text-white/80">
            Download ClawLite and get to your first session fast, then switch between BYOK and ClawLite tokens based on your usage.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" variant="secondary" className="bg-white text-ink hover:bg-white/90" asChild>
              <Link href="/downloads" className="inline-flex items-center">
                Install ClawLite <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" asChild className="border border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="/pricing">Try with BYOK</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
