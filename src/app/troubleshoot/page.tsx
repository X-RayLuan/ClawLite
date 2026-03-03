"use client";

import { content } from "@/lib/content";
import { useLang } from "@/components/lang-provider";
import { Card } from "@/components/ui/card";

export default function TroubleshootPage() {
  const { lang } = useLang();
  const t = content[lang].troubleshoot;

  return (
    <main className="gradient-bg min-h-screen">
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="space-y-3">
          <h1 className="font-display text-3xl font-semibold text-ink">{t.title}</h1>
          <p className="text-ink/70">{t.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {t.issues.map((issue) => (
            <Card key={issue.title} className="space-y-3">
              <h3 className="text-lg font-semibold text-ink">{issue.title}</h3>
              <p className="text-sm text-ink/70">{issue.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
