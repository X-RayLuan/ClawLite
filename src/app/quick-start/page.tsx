import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DOWNLOAD_LOGIN_HREF } from "@/lib/auth-flow";
import { getInstallerUrl } from "@/lib/installer-links";
import { Download, KeyRound, MessageSquare, Zap } from "lucide-react";
import { MobileNav } from "./mobile-nav";

export const metadata = {
  title: "Quick Start | ClawLite",
  description: "Get up and running with ClawLite in minutes. Download, configure, and launch.",
};

const steps = [
  {
    key: "download",
    icon: Download,
    title: "Download Installer",
    description: "Get the one-click installer for macOS or Windows.",
    href: "/downloads",
    linkLabel: "Download",
    badge: null,
  },
  {
    key: "apiKey",
    icon: KeyRound,
    title: "Configure API Key",
    description: "Use ClawLite Tokens (half price) or bring your own key (BYOK, free).",
    href: "/setup",
    linkLabel: "See Options",
    badge: "Half price",
  },
  {
    key: "channel",
    icon: MessageSquare,
    title: "Connect a Channel",
    description: "Telegram, Web Chat, Discord, or WhatsApp — pick what you use.",
    href: "/setup",
    linkLabel: "Setup Guide",
    badge: null,
  },
  {
    key: "launch",
    icon: Zap,
    title: "Launch",
    description: "Run the app and send your first message.",
    href: DOWNLOAD_LOGIN_HREF,
    linkLabel: "Start Now",
    badge: null,
  },
];

const navLinks = [
  { href: "/setup", label: "Setup Guide" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export default async function QuickStartPage() {
  const [macUrl, winUrl] = await Promise.all([
    getInstallerUrl("macos"),
    getInstallerUrl("windows"),
  ]);

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-xs font-semibold text-white sm:h-9 sm:w-9 sm:rounded-xl">
              CL
            </div>
            <span className="font-display text-base font-semibold text-stone-950 sm:text-lg">ClawLite</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-4 text-sm text-stone-600 sm:flex sm:gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-stone-900">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile nav */}
          <div className="relative sm:hidden">
            <MobileNav links={navLinks} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-8 pb-12 sm:px-6 sm:pt-14 sm:pb-16">
        <Badge className="border-stone-300 bg-stone-100 text-stone-700">Quick Start</Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:mt-5 sm:text-4xl lg:text-5xl">
          Get running in 5 minutes.
        </h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600 sm:mt-5 sm:text-lg">
          Download the installer, configure your API, connect a channel, and launch.
          No command-line setup required.
        </p>

        {/* Download CTAs */}
        <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap">
          {macUrl && (
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href={macUrl} download>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Download for macOS
              </a>
            </Button>
          )}
          {winUrl && (
            <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
              <a href={winUrl} download>
                Download for Windows
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Card className="rounded-2xl border border-stone-300/60 bg-white/90 p-5 shadow-none sm:rounded-[28px] sm:p-8">
          <div className="relative">
            {/* Vertical connecting line — desktop only */}
            <div className="absolute left-[19px] top-12 bottom-12 hidden w-0.5 bg-stone-200 sm:left-[23px] lg:block" />

            <div className="space-y-5 sm:space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isFirst = index === 0;
                return (
                  <div key={step.key} className="relative flex items-start gap-4 sm:gap-6">
                    {/* Step number circle */}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold sm:h-12 sm:w-12 sm:text-base ${
                        isFirst
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-stone-300 bg-white text-stone-500"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Step content */}
                    <div className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-[rgba(248,244,237,0.6)] p-4 sm:block sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white sm:h-10 sm:w-10 sm:rounded-xl">
                            <Icon className="h-4 w-4 text-stone-700 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-stone-950 sm:text-lg">{step.title}</h3>
                              {step.badge && (
                                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                  {step.badge}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-stone-600">{step.description}</p>
                          </div>
                        </div>
                        <div className="shrink-0 sm:self-start">
                          <Link
                            href={step.href}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-50 sm:w-auto sm:px-5 sm:py-2.5"
                          >
                            {step.linkLabel}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Bottom CTA */}
        <div className="mt-8 rounded-2xl bg-stone-900 p-6 text-white sm:mt-10 sm:rounded-[24px] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold sm:text-2xl">Ready to install?</h2>
              <p className="mt-1.5 text-sm text-stone-400 sm:mt-2">Download the installer and be running in 5 minutes.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {macUrl && (
                <Button size="lg" className="bg-white text-stone-900 hover:bg-white/90" asChild>
                  <a href={macUrl} download>Download for macOS</a>
                </Button>
              )}
              {winUrl && (
                <Button size="lg" variant="secondary" className="border-white/30 bg-transparent text-white hover:bg-white/10" asChild>
                  <a href={winUrl} download>Download for Windows</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/60 bg-white/80 py-5 sm:py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 text-center text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 ClawLite. Built on OpenClaw.</span>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/docs" className="hover:text-stone-700">Docs</Link>
            <Link href="/pricing" className="hover:text-stone-700">Pricing</Link>
            <Link href="/troubleshoot" className="hover:text-stone-700">Troubleshoot</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
