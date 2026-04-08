import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalAuthLink } from "@/components/external-auth-link";
import { DOWNLOAD_LOGIN_HREF } from "@/lib/auth-flow";

export const metadata = {
  title: "ClawLite Pricing",
  description: "Choose BYOK, ClawLite Tokens, or $500 remote implementation for guided setup."
};

export default function PricingPage() {
  return (
    <main className="gradient-bg">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20">
        <Badge className="border-coral/20 bg-coral/10 text-coral">Pricing</Badge>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.02] text-ink md:text-6xl">
          BYOK, ClawLite Tokens, or hands-on implementation.
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-ink/70 md:text-xl">
          Start free with your own key, use ClawLite Tokens for managed billing, or book a $500 remote
          implementation if you want us to get everything running with you.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">Flexible</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">BYOK</h2>
            <div className="mt-2 text-3xl font-semibold text-ink">$0 platform fee</div>
            <p className="mt-2 text-sm text-ink/65">Your key. Your usage. Your bill.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Connect your own OpenAI/Anthropic/other keys</li>
              <li>• Full control over spend and provider choice</li>
              <li>• Best for technical users and experiments</li>
            </ul>
            <div className="mt-6">
              <Button asChild variant="secondary">
                <Link href={DOWNLOAD_LOGIN_HREF}>Start Free</Link>
              </Button>
            </div>
          </article>

          <article className="rounded-3xl border border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-6 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Recommended</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">ClawLite Tokens</h2>
            <div className="mt-2 text-3xl font-semibold text-ink">Usage-based</div>
            <p className="mt-2 text-sm text-ink/65">Managed billing for fast-moving teams.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• 50% discount from official API price</li>
              <li>• One-click setup, no provider key hunting</li>
              <li>• Best when you want the fastest path to production</li>
            </ul>
            <div className="mt-6">
              <Button asChild>
                <Link href={DOWNLOAD_LOGIN_HREF}>Get 50% Discount Token Coupon</Link>
              </Button>
            </div>
          </article>

          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">Hands-on Help</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Remote Implementation</h2>
            <div className="mt-2 text-3xl font-semibold text-ink">$500</div>
            <p className="mt-2 text-sm text-ink/65">We install, configure, and get your workflow running with you.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Guided setup with a real operator</li>
              <li>• Faster path to a working deployment</li>
              <li>• Best for teams that want implementation help, not homework</li>
            </ul>
            <div className="mt-6">
              <Button asChild>
                <ExternalAuthLink href="https://buy.stripe.com/cNidR8fPO5HS3mW6lB8IU00">Book Remote Implementation — $500</ExternalAuthLink>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
