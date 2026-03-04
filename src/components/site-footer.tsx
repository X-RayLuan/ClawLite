"use client";

import Link from "next/link";
import { content } from "@/lib/content";
import { useLang } from "@/components/lang-provider";

export function SiteFooter() {
  const { lang } = useLang();
  const footer = content[lang].footer;
  const nav = content[lang].nav;

  return (
    <footer className="border-t border-black/5 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-ink/70 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-ink">{footer.tagline}</p>
          <p className="mt-1">{footer.cta}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/setup" className="text-ink hover:text-ink/70">
            {nav.setup}
          </Link>
          <Link href="/troubleshoot" className="text-ink hover:text-ink/70">
            {nav.troubleshoot}
          </Link>
          <Link href="/docs" className="text-ink hover:text-ink/70">
            {nav.docs}
          </Link>
          <Link href="/blog" className="text-ink hover:text-ink/70">
            {nav.blog ?? "Blog"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
