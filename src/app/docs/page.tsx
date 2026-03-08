"use client";

import Link from "next/link";
import { useLang } from "@/components/lang-provider";
import { content } from "@/lib/content";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  const { lang } = useLang();
  const nav = content[lang].nav;
  const docs = content[lang].docsPage;

  return (
    <main className="gradient-bg min-h-screen">
      <section className="mx-auto flex max-w-4xl flex-col items-start gap-6 px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-ink">{nav.docs}</h1>
        <p className="text-ink/70">{docs.description}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="https://github.com/openclaw" target="_blank" rel="noreferrer">
              {nav.docs}
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/docs/OpenClaw-Tutorial-Beginner-to-Intermediate-English.pdf" target="_blank" rel="noreferrer">
              OpenClaw Tutorial PDF (English)
            </a>
          </Button>
        </div>
        <Link href="/setup" className="text-sm text-ink/60 underline-offset-4 hover:underline">
          {docs.back}
        </Link>
      </section>
    </main>
  );
}
