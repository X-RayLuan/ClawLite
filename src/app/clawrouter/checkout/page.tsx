import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActiveEntitlementForAccount, getCheckoutSessionRecord } from "@/lib/clawrouter-checkout";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUsageSummaryForAccount, listApiKeysForAccount } from "@/lib/clawrouter-keys";

export const metadata: Metadata = {
  title: "ClawRouter Checkout",
  description:
    "Payment result, API key issuance state, and the first dashboard shell for ClawRouter access.",
};

const modelRows = [
  { name: "clawrouter/auto", note: "Default managed route", status: "Ready" },
  { name: "claude-3.7 / gpt-4.1 class", note: "Provider-routed via managed access", status: "Available" },
  { name: "BYOK fallback", note: "Keep manual control when needed", status: "Optional" },
];

export default async function ClawRouterCheckoutPage({
  searchParams,
}: {
  searchParams?: { session?: string; cancelled?: string };
}) {
  const sessionId = searchParams?.session || "preview-fallback";
  let session = null;
  let entitlement = null;
  let apiKeys: Awaited<ReturnType<typeof listApiKeysForAccount>> = [];
  let usage = {
    totalRequests: 0,
    totalTokensIn: 0,
    totalTokensOut: 0,
    lastRequestAt: null,
  };

  if (searchParams?.session) {
    try {
      const supabase = getSupabaseAdminClient();
      session = await getCheckoutSessionRecord(supabase, searchParams.session);
      if (session?.accountId) {
        entitlement = await getActiveEntitlementForAccount(supabase, session.accountId);
        apiKeys = await listApiKeysForAccount(supabase, session.accountId);
        usage = await getUsageSummaryForAccount(supabase, session.accountId);
      }
    } catch {
      session = null;
    }
  }

  const displayId = session?.id || sessionId;
  const statusLabel = session?.status || "preview";
  const purchaseStateLabel = session?.purchaseState || "checkout_pending";
  const key = apiKeys[0] || null;
  const isCompleted = statusLabel === "completed" && !!entitlement;
  const wasCancelled = searchParams?.cancelled === "1";

  return (
    <main className="gradient-bg min-h-screen">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20">
        <Badge className={isCompleted ? "border-sea/20 bg-sea/10 text-sea" : "border-coral/20 bg-coral/10 text-coral"}>
          {isCompleted ? "Payment confirmed" : wasCancelled ? "Checkout cancelled" : "Checkout status"}
        </Badge>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.03] text-ink md:text-6xl">
          {isCompleted ? "ClawRouter is ready." : "ClawRouter checkout state"}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-ink/70 md:text-xl">
          {isCompleted
            ? "Payment landed, entitlement is active, and your ClawRouter dashboard shell can now show credits, models, API key, and usage in one place."
            : wasCancelled
              ? "Checkout was cancelled before settlement completed. You can restart purchase or fall back to BYOK."
              : "This page tracks the real stored checkout session and becomes the post-purchase control surface once settlement completes."}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="section-card p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sea/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sea">
                {session ? "Persisted session" : "Fallback preview"}
              </span>
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                {statusLabel} · {purchaseStateLabel}
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-ink">Purchase status</h2>
            <div className="mt-4 rounded-[24px] border border-black/10 bg-black/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Session ID</p>
              <p className="mt-2 break-all font-mono text-sm text-ink">{displayId}</p>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-6 text-ink/75">
              <p>• Current stored status: {statusLabel}. Purchase state: {purchaseStateLabel}.</p>
              <p>• Account binding: {session?.accountId || "not persisted"}.</p>
              <p>• Provider: {session?.provider || "not assigned"}. External session: {session?.externalSessionId || "not created"}.</p>
              <p>• Entitlement: {entitlement ? `${entitlement.status} · ${entitlement.plan}` : "not active yet"}.</p>
              <p>• API key: {key ? `${key.keyPrefix}…` : "not issued yet"}.</p>
            </div>
          </Card>

          <Card className="section-card p-6 md:p-8">
            <Badge className="border-sea/20 bg-sea/10 text-sea">Dashboard</Badge>
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border border-black/10 bg-white p-5">
                <p className="text-sm font-semibold text-ink">Add Credits</p>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  Credits top-up flow can land here next. The page is already positioned as the post-purchase control surface.
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-ink/45">Current state: {entitlement ? "ready for credits UI" : "blocked until payment completes"}</p>
              </div>

              <div className="rounded-[24px] border border-black/10 bg-white p-5">
                <p className="text-sm font-semibold text-ink">Models</p>
                <div className="mt-3 space-y-2 text-sm text-ink/70">
                  {modelRows.map((item) => (
                    <div key={item.name} className="flex items-start justify-between gap-4 rounded-2xl border border-black/6 px-3 py-3">
                      <div>
                        <p className="font-medium text-ink">{item.name}</p>
                        <p className="text-xs text-ink/55">{item.note}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.14em] text-sea">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">API Key</p>
            <h3 className="mt-3 text-xl font-semibold text-ink">{key ? `${key.keyPrefix}…` : "Pending"}</h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              {key
                ? "An active key exists for this account. Long-term UX should reveal plaintext only once at issuance time."
                : "The key will appear here after payment settlement and issuance complete."}
            </p>
          </Card>

          <Card className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">Usage</p>
            <h3 className="mt-3 text-xl font-semibold text-ink">{usage.totalRequests}</h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">Requests recorded for this account.</p>
          </Card>

          <Card className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">Input tokens</p>
            <h3 className="mt-3 text-xl font-semibold text-ink">{usage.totalTokensIn}</h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">Current aggregated input-token total.</p>
          </Card>

          <Card className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">Output tokens</p>
            <h3 className="mt-3 text-xl font-semibold text-ink">{usage.totalTokensOut}</h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">Current aggregated output-token total.</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Card className="overflow-hidden rounded-[32px] border-coral/20 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-8 shadow-glow">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="border-coral/20 bg-coral/10 text-coral">What happens next</Badge>
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
                ClawRouter should move from payment into real operating surface.
              </h2>
              <p className="mt-3 text-base leading-7 text-ink/70">
                This page now has the right shell: purchase truth, key state, models, credits, and usage in one place. The next layer is polishing credits top-up, one-time plaintext key reveal, and richer usage analytics.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg">
                <Link href="/clawrouter">Back to ClawRouter</Link>
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
