"use client";

import Link from "next/link";
import { getContentForLang } from "@/lib/content";
import { useLang } from "@/components/lang-provider";

export function SiteFooter() {
  const { lang } = useLang();
  const pageContent = getContentForLang(lang);
  const footer = pageContent.footer;
  const nav = pageContent.nav;

  return (
    <footer className="border-t border-stone-300/50 bg-[rgba(248,244,237,0.6)]">
      <div className="mx-auto flex max-w-[var(--fd-layout-width)] flex-col gap-4 px-4 py-10 text-sm text-stone-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-stone-900">{footer.tagline}</p>
          <p className="mt-1 text-stone-500">{footer.cta}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/marketing-agent-team" className="text-stone-500 transition-colors hover:text-stone-900">
            {nav.marketingAgentTeam ?? "Marketing Agent Team"}
          </Link>
          <Link href="/troubleshoot" className="text-stone-500 transition-colors hover:text-stone-900">
            {nav.troubleshoot}
          </Link>
          <Link href="/skills" className="text-stone-500 transition-colors hover:text-stone-900">
            {nav.skills ?? "Skills"}
          </Link>
          <Link href="/docs" className="text-stone-500 transition-colors hover:text-stone-900">
            {nav.docs}
          </Link>
          <Link href="/blog" className="text-stone-500 transition-colors hover:text-stone-900">
            {nav.blog ?? "Blog"}
          </Link>
          <a
            href="https://discord.com/invite/YgxA4HWJMx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 transition-colors hover:text-stone-900"
          >
            Discord
          </a>
          <a
            href="https://x.com/Rockwood_Ray"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 transition-colors hover:text-stone-900"
          >
            X
          </a>
          <a
            href="https://www.facebook.com/groups/clawlite"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 transition-colors hover:text-stone-900"
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
