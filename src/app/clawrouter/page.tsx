import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalAuthLink } from "@/components/external-auth-link";
import { pricingConfig } from "@/lib/pricing";
import { ClawRouterPreviewButton } from "@/components/clawrouter-preview-button";

export const metadata: Metadata = {
  title: "ClawRouter API Access | Managed keys for ClawLite and OpenClaw",
  description:
    "A public-facing ClawRouter sales page for managed API access: clearer offer structure, honest live-vs-preview states, reseller path, BYOK fallback, and a runnable local checkout preview.",
};

const statusCards = [
  {
    badge: "Live now",
    title: "Public sales page + local checkout preview",
    body: "You can review the full funnel locally today, including CTA flow, checkout state messaging, and what happens after a purchase starts.",
    tone: "sea",
  },
  {
    badge: "Live now",
    title: "Reseller top-up route",
    body: "Users who want an immediate external top-up path can continue to the EZRouter reseller flow after login.",
    tone: "coral",
  },
  {
    badge: "Coming next",
    title: "Final settlement + entitlement automation",
    body: "Automatic payment capture, production entitlement writeback, and post-purchase key activation are not represented as fully live on this page yet.",
    tone: "ink",
  },
];

const offerCards = [
  {
    eyebrow: "Recommended",
    title: "Managed API access",
    price: "Usage-based",
    summary: "Buy managed ClawRouter access instead of wiring raw provider keys yourself.",
    bullets: [
      "Guided account-bound purchase flow",
      "Designed for faster installer activation",
      "Positioned as 30-50% cheaper than official API pricing",
      "Clear local preview today, real backend hookup next",
    ],
    cta: "Preview checkout locally",
    kind: "preview" as const,
  },
  {
    eyebrow: "Live fallback",
    title: "BYOK",
    price: pricingConfig.byok.platformFee,
    summary: "Keep full provider control with your own OpenAI, Anthropic, or other compatible keys.",
    bullets: [
      "No platform fee",
      "Best for power users with existing keys",
      "Works as the honest fallback while ClawRouter backend automation finishes",
    ],
    cta: "Use your own key",
    href: "/pricing",
  },
  {
    eyebrow: "Live service",
    title: pricingConfig.remoteImplementation.label,
    price: pricingConfig.remoteImplementation.price,
    summary: pricingConfig.remoteImplementation.description,
    bullets: [
      "Hands-on install and configuration help",
      "Useful for teams buying outcomes instead of setup work",
      "Live Stripe checkout already available",
    ],
    cta: pricingConfig.remoteImplementation.ctaLabel,
    href: pricingConfig.remoteImplementation.stripeUrl,
    external: true,
  },
];

const flowSteps = [
  {
    step: "01",
    title: "Choose your buying path",
    body: "Start with the managed ClawRouter offer, use BYOK if you already have stable provider keys, or jump to operator help if you want implementation done with you.",
  },
  {
    step: "02",
    title: "Preview or continue to checkout",
    body: "The local preview shows how ClawRouter purchase state, session IDs, and next steps are presented before the real billing backend is fully wired.",
  },
  {
    step: "03",
    title: "Connect inside the installer",
    body: "The intended production path is account-bound activation inside ClawLite or OpenClaw, with BYOK still available when manual control is the better fit.",
  },
];

const trustPoints = [
  "One-click OpenClaw positioning stays intact: the sales page is about speed to working setup, not selling mystery credits.",
  "BYOK remains a first-class option, so the offer never traps a user into a single path.",
  "The UI explicitly marks previewed and mocked steps instead of claiming that settlement and entitlement are fully complete.",
];

const faqs = [
  {
    q: "What is live on this page right now?",
    a: "The public sales surface, CTA structure, pricing presentation, FAQ, and local checkout preview are live. The reseller top-up route is also linked. Final payment settlement and real entitlement automation are still being wired.",
  },
  {
    q: "Is this claiming that ClawRouter purchase is fully automated already?",
    a: "No. The page is intentionally explicit about the difference between live UI, local preview states, external reseller flow, and the still-in-progress backend hookup.",
  },
  {
    q: "What should a user do if they need access today?",
    a: "Use the reseller top-up route or stay on BYOK. The managed ClawRouter purchase flow is presented as the recommended path and can be reviewed locally, but it should not be over-claimed as final settlement truth yet.",
  },
  {
    q: "Why keep BYOK on the page if ClawRouter is the main offer?",
    a: "Because the honest product surface should show the real fallback. Users with stable provider keys should be able to keep manual control instead of being pushed into a half-finished backend.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function ClawRouterPage() {
  return (
    <main className="gradient-bg min-h-screen">
      <Script
        id="clawrouter-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-14 pt-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-6">
          <Badge className="border-coral/20 bg-coral/10 text-coral">Managed API Access for ClawLite</Badge>
          <h1 className="font-display text-4xl font-semibold leading-[1.02] text-ink md:text-6xl">
            Buy ClawRouter access with an honest path from sales page to activation.
          </h1>
          <p className="max-w-2xl text-lg text-ink/72 md:text-xl">
            ClawRouter is the managed API key path for ClawLite and OpenClaw: faster setup, cleaner account-bound onboarding,
            and a simpler alternative to manual provider-key wiring. The purchase surface is now reviewable end to end locally,
            while final settlement and entitlement automation are still clearly marked as in progress.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ClawRouterPreviewButton />
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login?returnTo=%2Fclawrouter">Login for account-bound flow</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <ExternalAuthLink href={pricingConfig.tokens.ezRouterUrl}>Open reseller top-up</ExternalAuthLink>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-ink/60">
            <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5">Usage-based managed access</span>
            <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5">30-50% cheaper positioning</span>
            <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5">BYOK remains available</span>
            <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5">Preview mode clearly labeled</span>
          </div>
        </div>

        <Card className="section-card overflow-hidden p-0">
          <div className="border-b border-black/5 bg-black/[0.03] px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">Launch status</p>
          </div>
          <div className="space-y-4 p-6">
            {statusCards.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-ink">{item.title}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      item.tone === "sea"
                        ? "bg-sea/10 text-sea"
                        : item.tone === "coral"
                          ? "bg-coral/10 text-coral"
                          : "bg-black/5 text-ink/70"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/70">{item.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="mb-6 max-w-3xl">
          <Badge className="border-sea/20 bg-sea/10 text-sea">Offer Structure</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            Pick the path that matches how much setup work you want to own.
          </h2>
          <p className="mt-3 text-base leading-7 text-ink/70">
            The public surface treats ClawRouter as the recommended managed route, keeps BYOK available as the honest fallback,
            and preserves a hands-on service option for buyers who want outcomes instead of homework.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {offerCards.map((offer) => (
            <Card
              key={offer.title}
              className={`section-card p-6 ${offer.kind === "preview" ? "border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sea/10 shadow-glow" : ""}`}
            >
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${offer.kind === "preview" ? "text-coral" : "text-sea"}`}>
                {offer.eyebrow}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{offer.title}</h3>
              <div className="mt-2 text-3xl font-semibold text-ink">{offer.price}</div>
              <p className="mt-3 text-sm leading-6 text-ink/70">{offer.summary}</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-ink/75">
                {offer.bullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
              <div className="mt-6">
                {offer.kind === "preview" ? (
                  <ClawRouterPreviewButton fullWidth />
                ) : offer.external ? (
                  <Button asChild className="w-full">
                    <ExternalAuthLink href={offer.href!}>{offer.cta}</ExternalAuthLink>
                  </Button>
                ) : (
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={offer.href!}>{offer.cta}</Link>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="section-card p-6 md:p-8">
            <Badge className="border-black/10 bg-black/5 text-ink/70">Live vs Preview</Badge>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink">What the surface can truthfully say today</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-ink/75">
              <li>• The page structure, offer framing, and CTA flow are production-style and reviewable now.</li>
              <li>• The local checkout preview creates a stub session and shows the exact state handling the real backend will feed later.</li>
              <li>• External reseller top-up is a live path for users who need a buy-now route today.</li>
              <li>• Real payment settlement, entitlement issuance, and final activation writeback are still placeholder-backed.</li>
            </ul>
          </Card>

          <Card className="section-card p-6 md:p-8">
            <Badge className="border-coral/20 bg-coral/10 text-coral">Why this offer works</Badge>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink">Sell the speed-to-working-setup outcome, not mystery infrastructure.</h2>
            <div className="mt-5 space-y-3 text-sm leading-6 text-ink/75">
              {trustPoints.map((point) => (
                <p key={point}>• {point}</p>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="mb-6 max-w-3xl">
          <Badge className="border-sea/20 bg-sea/10 text-sea">CTA Flow</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            A cleaner path from landing page to purchase, preview, or reseller top-up.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {flowSteps.map((item) => (
            <Card key={item.step} className="section-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">{item.step}</p>
              <h3 className="mt-3 text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/70">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6 max-w-3xl">
          <Badge className="border-sea/20 bg-sea/10 text-sea">FAQ</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">Common questions buyers will actually ask</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <Card key={item.q} className="section-card p-6">
              <h3 className="text-lg font-semibold text-ink">{item.q}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/70">{item.a}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Card className="overflow-hidden rounded-[32px] border-coral/20 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-8 shadow-glow">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="border-coral/20 bg-coral/10 text-coral">Next step</Badge>
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
                Start with the managed path, then decide whether you need preview, reseller, or BYOK.
              </h2>
              <p className="mt-3 text-base leading-7 text-ink/70">
                The page now supports an honest vertical slice: preview the ClawRouter checkout flow locally, send buyers to the
                current reseller route when they need an immediate external purchase path, or keep them on BYOK while the real
                entitlement backend catches up.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:max-w-xl lg:justify-end">
              <ClawRouterPreviewButton />
              <Button asChild size="lg" variant="secondary">
                <ExternalAuthLink href={pricingConfig.tokens.ezRouterUrl}>Open reseller top-up</ExternalAuthLink>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/pricing">Compare with BYOK</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
