import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCheckoutSessionRecord } from "@/lib/clawrouter-checkout";
import { pricingConfig } from "@/lib/pricing";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "ClawRouter Checkout Preview",
  description:
    "Preview checkout and post-purchase states for ClawRouter. This surface is intentionally explicit about what is mocked today versus what will be driven by the real backend later.",
};

export default async function ClawRouterCheckoutPage({
  searchParams,
}: {
  searchParams?: { session?: string };
}) {
  const sessionId = searchParams?.session || "preview-fallback";
  let session = null;

  if (searchParams?.session) {
    try {
      session = await getCheckoutSessionRecord(getSupabaseAdminClient(), searchParams.session);
    } catch {
      session = null;
    }
  }

  const displayId = session?.id || sessionId;
  const statusLabel = session?.status || "preview";
  const purchaseStateLabel = session?.purchaseState || "checkout_pending";
  const sourceLabel = session?.source || "preview";
  const entrypointLabel = session?.entrypoint || "preview";
  const providerLabel = session?.provider || "not assigned";
  const externalSessionLabel = session?.externalSessionId || "not created";
  const setupTokenLabel = session?.installerSetupToken || "not attached";

  return (
    <main className="gradient-bg min-h-screen">
      <section className="mx-auto max-w-5xl px-6 pb-12 pt-20">
        <Badge className="border-coral/20 bg-coral/10 text-coral">Checkout Preview</Badge>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.03] text-ink md:text-6xl">
          ClawRouter purchase flow preview
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-ink/70 md:text-xl">
          This surface now renders the real persisted checkout-session skeleton when a Supabase session id exists, while still
          falling back to preview wording when the page is opened without a stored row behind it.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="section-card p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sea/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sea">
                {session ? "Persisted session" : "Session preview"}
              </span>
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                {session ? `${statusLabel} · ${purchaseStateLabel}` : "Fallback preview"}
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-ink">Preview session</h2>
            <div className="mt-4 rounded-[24px] border border-black/10 bg-black/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Session ID</p>
              <p className="mt-2 break-all font-mono text-sm text-ink">{displayId}</p>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-6 text-ink/75">
              <p>• Source: {sourceLabel}.</p>
              <p>• Entrypoint: {entrypointLabel}.</p>
              <p>• Current stored status: {statusLabel}. Purchase state: {purchaseStateLabel}.</p>
              <p>• Account binding: {session?.accountId || "not persisted"}.</p>
              <p>• Provider: {providerLabel}. External session: {externalSessionLabel}.</p>
              <p>• Installer setup token: {setupTokenLabel}.</p>
              <p>• Created at: {session?.createdAt || "preview only"}.</p>
              <p>• Settlement callbacks can now advance this stored status; entitlement activation and installer writeback are still the next layer beyond it.</p>
            </div>
          </Card>

          <Card className="section-card p-6 md:p-8">
            <Badge className="border-sea/20 bg-sea/10 text-sea">Current buyer options</Badge>
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border border-black/10 bg-white p-5">
                <p className="text-sm font-semibold text-ink">1. Continue with reseller top-up</p>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  Use the external reseller route when you want a live purchase path today.
                </p>
                <Button asChild className="mt-4 w-full">
                  <a href={pricingConfig.tokens.ezRouterUrl} target="_blank" rel="noreferrer">
                    Open reseller top-up
                  </a>
                </Button>
              </div>

              <div className="rounded-[24px] border border-black/10 bg-white p-5">
                <p className="text-sm font-semibold text-ink">2. Stay on BYOK</p>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  Keep manual provider control while the managed settlement path is still being finalized.
                </p>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link href="/pricing">Compare with BYOK</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Checkout",
              state: session ? "Persisted in Supabase" : "Previewed locally",
              body: session
                ? "Session creation now writes a real checkout_sessions row and exposes the same session shape consumed by both the web page and installer activation flow."
                : "Session creation and state labels are still reviewable locally even when a stored session is not available.",
            },
            {
              title: "Entitlement",
              state: "Placeholder-backed",
              body: "Real purchase truth and access issuance still need backend hookup.",
            },
            {
              title: "Installer activation",
              state: "Stubbed contract",
              body: "Provisioning and config-injection routes already model the shape of the future flow.",
            },
          ].map((item) => (
            <Card key={item.title} className="section-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">{item.title}</p>
              <h3 className="mt-3 text-xl font-semibold text-ink">{item.state}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/70">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Card className="overflow-hidden rounded-[32px] border-coral/20 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-8 shadow-glow">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="border-coral/20 bg-coral/10 text-coral">What happens next</Badge>
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
                The surface is ready for the real backend to replace the preview states.
              </h2>
              <p className="mt-3 text-base leading-7 text-ink/70">
                Once settlement and entitlement are wired, this page can stop saying “preview” and start rendering production purchase truth
                without changing the user-facing structure again.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg">
                <Link href="/clawrouter">Back to sales page</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/downloads">Open downloads</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
