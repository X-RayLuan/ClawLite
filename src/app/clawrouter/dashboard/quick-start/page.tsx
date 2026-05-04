"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useLang } from "@/components/lang-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getContentForLang, getIntlLocale } from "@/lib/content";
import { getSupabaseClient } from "@/lib/supabase";

export default function QuickStartPage() {
  const { lang } = useLang();
  const navT = getContentForLang(lang).dashboard;
  const t = getContentForLang(lang).dashboard.quickStartPage;
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [checking] = useState(false);
  const [email] = useState<string | null>(null);

  const navItems = useMemo(
    () => [
      { label: navT.nav.dashboard, href: "/clawrouter/dashboard" },
      { label: navT.nav.apiKeys, href: "/clawrouter/dashboard/api-keys" },
      { label: navT.nav.quickStart, href: "/clawrouter/dashboard/quick-start", active: true },
      { label: navT.nav.models, href: "/clawrouter/dashboard/models" },
      { label: navT.nav.usage, href: "/clawrouter/dashboard/usage" },
      { label: navT.nav.transactions, href: "/clawrouter/dashboard/transactions" },
      { label: navT.nav.affiliate, href: "/clawrouter/dashboard/affiliate" },
      { label: navT.nav.profile, href: "/clawrouter/dashboard/profile" },
    ],
    [navT]
  );

  const steps = [
    {
      key: "download",
      title: t.steps.download.title,
      description: t.steps.download.description,
      actionLabel: t.steps.download.actionLabel.replace("{os}", "macOS / Windows"),
      href: t.steps.download.actionHref,
    },
    {
      key: "apiKey",
      title: t.steps.apiKey.title,
      description: t.steps.apiKey.description,
      actionLabel: t.steps.apiKey.actionLabel,
      href: t.steps.apiKey.actionHref,
    },
    {
      key: "channel",
      title: t.steps.channel.title,
      description: t.steps.channel.description,
      actionLabel: t.steps.channel.actionLabel,
      href: t.steps.channel.actionHref,
    },
    {
      key: "firstMessage",
      title: t.steps.firstMessage.title,
      description: t.steps.firstMessage.description,
      actionLabel: t.steps.firstMessage.actionLabel,
      href: t.steps.firstMessage.actionHref,
    },
  ];

  return (
    <main className="min-h-screen bg-[rgba(247,243,236,0.92)] text-stone-950">
      {/* Mobile: Top navigation bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] flex items-center gap-3 border-b border-stone-200/60 bg-white/90 px-4 py-3">
        <Link
          href="/clawrouter/dashboard"
          className="rounded-xl border border-stone-300 bg-white/80 p-2 text-stone-700 hover:bg-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="font-semibold text-stone-900">{navT.nav.quickStart}</span>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:pt-0 pt-16">
        <aside className="hidden lg:block rounded-[28px] border border-stone-300/60 bg-white/85 p-5 shadow-none">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
              CR
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-950">{navT.common.clawRouter}</p>
              <p className="text-xs text-stone-500">{email || navT.common.accountFallback}</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => {
              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm ${item.active ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div
                  key={item.label}
                  className={`rounded-2xl px-4 py-3 text-sm ${item.active ? "bg-stone-900 text-white" : "text-stone-700"}`}
                >
                  {item.label}
                </div>
              );
            })}
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[32px] border border-stone-300/60 bg-white/88 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="border-stone-300 bg-[rgba(248,244,237,0.9)] text-stone-700">
                {navT.nav.quickStart}
              </Badge>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950">
                {t.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                {t.subtitle}
              </p>
            </div>
          </div>

          <Card className="rounded-[28px] border border-stone-300/60 bg-white/90 p-8 shadow-none">
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[23px] top-12 bottom-12 w-0.5 bg-stone-200" />

              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={step.key} className="relative flex items-start gap-6">
                    {/* Step number circle */}
                    <div
                      className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-base font-semibold ${
                        index === 0
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-stone-300 bg-white text-stone-500"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 rounded-[24px] border border-stone-200 bg-[rgba(248,244,237,0.6)] p-6">
                      <h3 className="text-lg font-semibold text-stone-950">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{step.description}</p>
                      <div className="mt-4">
                        {step.href.startsWith("http") ? (
                          <a
                            href={step.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-50"
                          >
                            {step.actionLabel}
                          </a>
                        ) : (
                          <Link
                            href={step.href}
                            className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-50"
                          >
                            {step.actionLabel}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
