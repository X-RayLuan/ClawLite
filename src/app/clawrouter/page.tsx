"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalAuthLink } from "@/components/external-auth-link";
import { pricingConfig } from "@/lib/pricing";
import { getSupabaseClient } from "@/lib/supabase";

const stats = [
  { value: "30–50%", label: "lower cost positioning" },
  { value: "3", label: "core AI workload lanes" },
  { value: "24/7", label: "account-ready access path" },
  { value: "1", label: "router for all model calls" },
];

const featureRows = [
  {
    eyebrow: "AI Video Routing",
    title: "Route generation-heavy video workloads without building a provider maze.",
    body:
      "Use one router surface for video generation access instead of wiring separate model vendors and payment flows one by one. ClawRouter is designed to simplify what your agent, team, and billing path need to know.",
    bullets: ["Single buying path", "Cleaner model switching", "Faster activation"],
    tone: "blue",
  },
  {
    eyebrow: "AI Image Routing",
    title: "Keep image generation flexible while preserving one account-level control point.",
    body:
      "From product visuals to workflow automations, ClawRouter is positioned as the clean layer between your app and the underlying model mix — so users see one experience instead of provider sprawl.",
    bullets: ["One key flow", "Provider abstraction", "Usage-aware routing"],
    tone: "ink",
  },
  {
    eyebrow: "LLM & Agent Calls",
    title: "Give OpenClaw one managed path for chat, coding, and agent traffic.",
    body:
      "This is the practical core: ClawRouter should feel like the obvious managed alternative to manual BYOK setup when a user wants a faster route from install to working AI.",
    bullets: ["Managed access path", "Better activation story", "BYOK still available"],
    tone: "ink",
  },
];

const advantages = [
  {
    title: "One commercial surface",
    body: "Users should understand the offer in one glance: buy managed access, stay on BYOK, or upgrade to hands-on help.",
  },
  {
    title: "Cleaner onboarding copy",
    body: "The page sells the speed-to-working outcome, not mysterious infra. That makes the activation flow easier to trust.",
  },
  {
    title: "Cheaper than official API positioning",
    body: "ClawRouter inherits the OpenClaw promise: lower friction without forcing users to wire raw provider accounts on day one.",
  },
  {
    title: "Built to fit OpenClaw",
    body: "This is not a generic API mall. It is a routing and purchase surface designed to fit the OpenClaw activation journey.",
  },
  {
    title: "Fast page-to-key path",
    body: "The commercial experience should move from landing page to action quickly, without making users decode your pricing logic first.",
  },
  {
    title: "Developer-friendly by default",
    body: "Clear offer framing, obvious CTAs, and less account sprawl are what make this page useful — not hype adjectives.",
  },
];

const modelCards = [
  {
    category: "Video",
    title: "Generation-ready model access",
    body: "Present ClawRouter as the clean access layer for high-cost, multi-model generation workloads where users care about speed, switching, and spend control.",
  },
  {
    category: "Image",
    title: "Creative production routing",
    body: "Use one buying and access surface for image workflows instead of forcing users to juggle separate provider keys from day one.",
  },
  {
    category: "Chat",
    title: "LLM traffic for agents and apps",
    body: "The most important promise is simple: faster path from install to useful AI calls, with less setup drag than raw BYOK.",
  },
];

const faqs = [
  {
    q: "What is ClawRouter?",
    a: "ClawRouter is the managed routing and access layer for OpenClaw. It is positioned as the easier path for users who want model access without manually wiring every provider themselves.",
  },
  {
    q: "Is BYOK still supported?",
    a: "Yes. BYOK stays visible as the honest fallback for users who already have stable provider accounts or want maximum manual control.",
  },
  {
    q: "What kinds of workloads does this page cover?",
    a: "The page is framed around three core workload lanes: video, image, and LLM/chat. The point is one routing surface, not a mess of disconnected buying paths.",
  },
  {
    q: "What happens after login?",
    a: "Login should land users in the ClawRouter dashboard so they can add credits, manage API keys, inspect models, and review usage in one place.",
  },
];

function SalesPage() {
  return (
    <main className="min-h-screen bg-[rgba(248,244,237,0.92)] text-stone-950">
      <section className="relative overflow-hidden border-b border-stone-300/60 bg-[radial-gradient(circle_at_top,rgba(120,113,108,0.10),transparent_34%),linear-gradient(180deg,rgba(248,244,237,0.92)_0%,rgba(246,240,231,0.75)_72%,rgba(250,248,243,0.82)_100%)]">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="border-stone-300/70 bg-white/50 text-stone-700">ClawRouter</Badge>
            <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-stone-950 sm:text-5xl lg:text-6xl">
              Access the best AI models in one router.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
              ClawRouter is the managed access layer for OpenClaw — one commercial and developer-facing surface for video,
              image, and chat model traffic, with a cleaner path from setup to working AI.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="min-w-[220px] bg-stone-900 hover:bg-stone-800">
                <Link href="/login?returnTo=%2Fclawrouter">Get ClawRouter Access</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="min-w-[180px] border-stone-300 bg-white/70 text-stone-900 hover:bg-white">
                <ExternalAuthLink href="https://docs.kie.ai">API Documentation</ExternalAuthLink>
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 border-t border-stone-300/60 pt-8 sm:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-3xl">{item.value}</div>
                <div className="mt-2 text-sm text-stone-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-4xl">
            AI APIs for any OpenClaw project
          </h2>
        </div>

        <div className="mt-12 space-y-12">
          {featureRows.map((item, index) => (
            <div key={item.title} className={`grid items-center gap-8 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className={`overflow-hidden rounded-[28px] border ${item.tone === "blue" ? "border-stone-300/60 bg-gradient-to-br from-slate-950 via-slate-900 to-stone-900" : "border-stone-300/60 bg-stone-950"} p-6 text-white shadow-[0_20px_80px_-40px_rgba(15,23,42,0.5)]`}>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/55">
                    <span>{item.eyebrow}</span>
                    <span>ClawRouter</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-3 w-24 rounded-full bg-stone-400/90" />
                    <div className="h-3 w-40 rounded-full bg-white/20" />
                    <div className="h-3 w-32 rounded-full bg-white/15" />
                  </div>
                  <div className="mt-8 grid gap-3">
                    {item.bullets.map((bullet) => (
                      <div key={bullet} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-stone-700">{item.eyebrow}</p>
                <h3 className="mt-3 text-balance font-display text-2xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-stone-600">{item.body}</p>
                <div className="mt-6">
                  <Button asChild className="bg-stone-900 hover:bg-stone-800">
                    <Link href="/login?returnTo=%2Fclawrouter">Get ClawRouter Access</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-300/60 bg-[rgba(255,250,244,0.45)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-4xl">
              Why choose ClawRouter for API access
            </h2>
            <p className="mt-4 text-base leading-7 text-stone-600">
              We are not trying to be a generic API mall. The point is to give OpenClaw users one cleaner route from setup
              to real AI usage, while keeping BYOK honest and visible.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {advantages.map((item) => (
              <Card key={item.title} className="rounded-[24px] border border-stone-300/60 bg-white p-6 shadow-none">
                <h3 className="text-lg font-semibold text-stone-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-4xl">
              Popular AI model lanes you can route today
            </h2>
            <p className="mt-4 text-base leading-7 text-stone-600">
              Think in workload lanes, not provider chaos. ClawRouter is how OpenClaw should talk about access: one page,
              one router, multiple AI outcomes.
            </p>
          </div>
          <Button asChild variant="secondary" className="hidden border-stone-300 bg-white/70 text-stone-900 hover:bg-white sm:inline-flex">
            <ExternalAuthLink href={pricingConfig.tokens.ezRouterUrl}>Explore all</ExternalAuthLink>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {modelCards.map((item) => (
            <Link key={item.title} href="/login?returnTo=%2Fclawrouter" className="group rounded-[24px] border border-stone-300/60 bg-white p-6 transition-colors hover:border-stone-400 hover:bg-white/60">
              <p className="text-sm font-medium text-stone-700">{item.category}</p>
              <h3 className="mt-3 text-lg font-semibold text-stone-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-4xl">
            Frequently asked questions about ClawRouter
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {faqs.map((item) => (
            <Card key={item.q} className="rounded-[24px] border border-stone-300/60 bg-white p-6 shadow-none">
              <h3 className="text-lg font-semibold text-stone-950">{item.q}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{item.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function ClawRouterPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    let mounted = true;

    async function settleSession() {
      for (let i = 0; i < 8; i += 1) {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (data.session?.user) {
          router.replace("/clawrouter/dashboard");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (mounted) {
        setChecking(false);
      }
    }

    settleSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace("/clawrouter/dashboard");
        return;
      }

      setChecking(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (checking) {
    return <main className="mx-auto min-h-[60vh] max-w-5xl px-6 py-16 text-stone-600">Checking access…</main>;
  }

  return <SalesPage />;
}
