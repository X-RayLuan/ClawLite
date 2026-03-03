"use client";

import Link from "next/link";
import { content } from "@/lib/content";
import { LangToggle } from "@/components/lang-toggle";
import { useLang } from "@/components/lang-provider";

export function SiteHeader() {
  const { lang } = useLang();
  const nav = content[lang].nav;

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-2xl">🦞</span>
          <span>ClawLite</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/">{nav.home}</Link>
          <Link href="/setup">{nav.setup}</Link>
          <Link href="/troubleshoot">{nav.troubleshoot}</Link>
          <Link href="/docs" className="text-ink/70 hover:text-ink">
            {nav.docs}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
