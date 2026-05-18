import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalAuthLink } from "@/components/external-auth-link";
import { getModels } from "@/lib/model-config";

export const metadata = {
  title: "Model Pricing — ClawLite",
  description: "Compare ClawLite model API prices vs official. ClawLite offers 20% off retail pricing.",
};

const DISCOUNT = 0.8;

function formatContextWindow(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`;
  return `${(tokens / 1000).toFixed(0)}K`;
}

function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default async function PricingPage() {
  const allModels = await getModels();
  const models = Object.values(allModels).filter((m) => {
    // Only show non-codex, non-deprecated models
    return !m.id.includes("codex") && m.status !== "deprecated" && m.inputPerM > 0;
  });

  // Group by provider
  const openaiModels = models
    .filter((m) => m.providerId === "openai")
    .sort((a, b) => b.inputPerM - a.inputPerM);
  const anthropicModels = models
    .filter((m) => m.providerId === "anthropic")
    .sort((a, b) => b.inputPerM - a.inputPerM);

  const officialInput = (m: (typeof models)[0]) => m.inputPerM;
  const officialOutput = (m: (typeof models)[0]) => m.outputPerM;
  const clawliteInput = (m: (typeof models)[0]) =>
    Math.round(m.inputPerM * DISCOUNT * 1000) / 1000;
  const clawliteOutput = (m: (typeof models)[0]) =>
    Math.round(m.outputPerM * DISCOUNT * 1000) / 1000;
  return (
    <main className="gradient-bg">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20">
        <Badge className="border-coral/20 bg-coral/10 text-coral">Model Pricing</Badge>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.02] text-ink md:text-6xl">
          Powerful models at 20% below official price.
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-ink/70 md:text-xl">
          ClawLite routes through the official provider APIs — same models, same quality,{" "}
          <span className="font-semibold text-coral">20% cheaper</span>. No hidden fees, no
          markups.
        </p>

        {/* Plan cards */}
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">Flexible</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">BYOK</h2>
            <div className="mt-2 text-3xl font-semibold text-ink">$0 platform fee</div>
            <p className="mt-2 text-sm text-ink/65">Your key. Your usage. Your bill.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Connect your own OpenAI/Anthropic key</li>
              <li>• Full control over spend</li>
              <li>• Best for technical users</li>
            </ul>
            <div className="mt-6">
              <Button asChild variant="secondary">
                <Link href="/login">Start Free</Link>
              </Button>
            </div>
          </article>

          <article className="rounded-3xl border border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sea/10 p-6 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Recommended</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">ClawLite Tokens</h2>
            <div className="mt-2 text-3xl font-semibold text-ink">20% off retail</div>
            <p className="mt-2 text-sm text-ink/65">Managed billing for fast-moving teams.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Same official models, 20% cheaper</li>
              <li>• One-click setup, no key hunting</li>
              <li>• Best path to production</li>
            </ul>
            <div className="mt-6">
              <Button asChild>
                <Link href="/login?returnTo=%2Fdownloads">Get Started</Link>
              </Button>
            </div>
          </article>

          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">Hands-on Help</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Remote Implementation</h2>
            <div className="mt-2 text-3xl font-semibold text-ink">$500</div>
            <p className="mt-2 text-sm text-ink/65">We install, configure, and get you running.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Guided setup with a real operator</li>
              <li>• Faster path to working deployment</li>
              <li>• Best for teams wanting implementation help</li>
            </ul>
            <div className="mt-6">
              <Button asChild>
                <ExternalAuthLink href="https://buy.stripe.com/cNidR8fPO5HS3mW6lB8IU00">
                  Book — $500
                </ExternalAuthLink>
              </Button>
            </div>
          </article>
        </div>
      </section>

      {/* OpenAI Models */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mt-4 flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <path
              d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z"
              fill="#10a37f"
            />
          </svg>
          <h2 className="font-display text-2xl font-semibold text-ink">OpenAI</h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                <th className="pb-3 pr-4 font-medium">Model</th>
                <th className="pb-3 px-4 text-right font-medium">Context</th>
                <th className="pb-3 px-4 text-right font-medium">
                  <span className="text-sea">ClawLite</span>
                  <br />
                  <span className="font-normal text-ink/40">Input / 1M tokens</span>
                </th>
                <th className="pb-3 px-4 text-right font-medium">
                  <span className="text-sea">ClawLite</span>
                  <br />
                  <span className="font-normal text-ink/40">Output / 1M tokens</span>
                </th>
                <th className="pb-3 px-4 text-right font-medium">
                  <span className="text-ink/40">Official</span>
                  <br />
                  <span className="font-normal text-ink/30">Input / 1M tokens</span>
                </th>
                <th className="pb-3 pl-4 text-right font-medium">
                  <span className="text-ink/40">Official</span>
                  <br />
                  <span className="font-normal text-ink/30">Output / 1M tokens</span>
                </th>
                <th className="pb-3 pl-4 text-center font-medium">You Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {openaiModels.map((m) => (
                <tr key={m.id} className="hover:bg-black/[0.02]">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-ink">{m.name}</div>
                    <div className="mt-0.5 text-xs text-ink/40">{m.id}</div>
                  </td>
                  <td className="px-4 text-right text-ink/60">
                    {formatContextWindow(m.contextWindow)}
                  </td>
                  <td className="px-4 text-right font-semibold text-sea">
                    {formatPrice(clawliteInput(m))}
                  </td>
                  <td className="px-4 text-right font-semibold text-sea">
                    {formatPrice(clawliteOutput(m))}
                  </td>
                  <td className="px-4 text-right text-ink/40 line-through">
                    {formatPrice(officialInput(m))}
                  </td>
                  <td className="pl-4 text-right text-ink/40 line-through">
                    {formatPrice(officialOutput(m))}
                  </td>
                  <td className="pl-4 text-center">
                    <span className="inline-flex items-center rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
                      20% off
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Anthropic Models */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mt-4 flex items-center gap-3">
          <svg viewBox="0 0 30 30" className="h-6 w-6" fill="none">
            <rect width="30" height="30" rx="6" fill="#CC785C" />
            <path
              d="M21.5 10.5C20 9 18 8 15 8s-6 1-7.5 2.5S5 14 5 17c0 4 2.5 6 5 7.5 2 1.2 4 1.5 5 1.5s3-.3 5-1.5c2.5-1.5 5-3.5 5-7.5 0-3-1-5-2.5-6.5S23 9 21.5 10.5z"
              fill="white"
              opacity="0.9"
            />
          </svg>
          <h2 className="font-display text-2xl font-semibold text-ink">Anthropic</h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                <th className="pb-3 pr-4 font-medium">Model</th>
                <th className="pb-3 px-4 text-right font-medium">Context</th>
                <th className="pb-3 px-4 text-right font-medium">
                  <span className="text-sea">ClawLite</span>
                  <br />
                  <span className="font-normal text-ink/40">Input / 1M tokens</span>
                </th>
                <th className="pb-3 px-4 text-right font-medium">
                  <span className="text-sea">ClawLite</span>
                  <br />
                  <span className="font-normal text-ink/40">Output / 1M tokens</span>
                </th>
                <th className="pb-3 px-4 text-right font-medium">
                  <span className="text-ink/40">Official</span>
                  <br />
                  <span className="font-normal text-ink/30">Input / 1M tokens</span>
                </th>
                <th className="pb-3 pl-4 text-right font-medium">
                  <span className="text-ink/40">Official</span>
                  <br />
                  <span className="font-normal text-ink/30">Output / 1M tokens</span>
                </th>
                <th className="pb-3 pl-4 text-center font-medium">You Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {anthropicModels.map((m) => (
                <tr key={m.id} className="hover:bg-black/[0.02]">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-ink">{m.name}</div>
                    <div className="mt-0.5 text-xs text-ink/40">{m.id}</div>
                  </td>
                  <td className="px-4 text-right text-ink/60">
                    {formatContextWindow(m.contextWindow)}
                  </td>
                  <td className="px-4 text-right font-semibold text-sea">
                    {formatPrice(clawliteInput(m))}
                  </td>
                  <td className="px-4 text-right font-semibold text-sea">
                    {formatPrice(clawliteOutput(m))}
                  </td>
                  <td className="px-4 text-right text-ink/40 line-through">
                    {formatPrice(officialInput(m))}
                  </td>
                  <td className="pl-4 text-right text-ink/40 line-through">
                    {formatPrice(officialOutput(m))}
                  </td>
                  <td className="pl-4 text-center">
                    <span className="inline-flex items-center rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
                      20% off
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-ink/40">
          All prices in USD. ClawLite routes through official provider APIs — no quality difference.
          Models powered by OpenAI and Anthropic respectively.
        </p>

        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/login?returnTo=%2Fdownloads">Start Using ClawLite</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/docs">Read the Docs</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
