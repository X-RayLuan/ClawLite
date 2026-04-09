import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { skillCatalog } from "@/lib/skill-catalog";
import { skillPages } from "@/data/skill-pages";

const categoryOrder = ["OpenClaw Ops", "SEO / GEO", "Frontend", "Automation", "Memory", "Growth", "Research"];

const groupedSkills = categoryOrder
  .map((category) => ({
    category,
    items: skillCatalog.filter((skill) => skill.category === category)
  }))
  .filter((group) => group.items.length > 0);

export const metadata = {
  title: "ClawLite Skills",
  description: "Browse ClawHub skills: OpenClaw Ops by ClawLite, plus recommended skills for adjacent workflows."
};

export default function SkillsPage() {
  return (
    <main className="gradient-bg">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20">
        <Badge className="border-coral/20 bg-coral/10 text-coral">ClawLite Skills</Badge>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.02] text-ink md:text-6xl">
              OpenClaw Ops we publish — plus recommended skills worth using.
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-ink/70 md:text-xl">
              Only the OpenClaw Ops category is published by the ClawLite team. The other sections are recommended
              ClawHub skills for adjacent workflows like SEO/GEO, frontend execution, research, memory, and growth.
            </p>
          </div>
          <Card className="border-coral/20 bg-white/90 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">Why this tab exists</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Show the OpenClaw Ops skills ClawLite actually publishes.</li>
              <li>• Recommend strong adjacent skills without pretending we authored them.</li>
              <li>• Give users ready-made building blocks for real workflows.</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="https://clawhub.ai" target="_blank" rel="noopener noreferrer">
                  Browse ClawHub
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="https://github.com/openclaw" target="_blank" rel="noopener noreferrer">
                  Open GitHub
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-6">
        <div className="grid gap-4 rounded-3xl border border-black/5 bg-white/70 p-5 shadow-soft md:grid-cols-3 md:p-7">
          <div className="rounded-2xl bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">ClawLite GEO Cluster</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{skillPages.length}</p>
            <p className="mt-1 text-sm text-ink/65">Permanent /skills pages written for search, GEO, and real operator reuse.</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">Catalog Skills</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{skillCatalog.length}</p>
            <p className="mt-1 text-sm text-ink/65">OpenClaw Ops by us; the rest are recommended to explore.</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">Focus</p>
            <p className="mt-2 text-lg font-semibold text-ink">OpenClaw ops, GEO, frontend, research</p>
            <p className="mt-1 text-sm text-ink/65">Built around repeatable, high-leverage workflows.</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">ClawLite Angle</p>
            <p className="mt-2 text-lg font-semibold text-ink">Cheaper tokens + safer operations</p>
            <p className="mt-1 text-sm text-ink/65">Tools should compound speed, reliability, and control.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="rounded-3xl border border-coral/20 bg-coral/5 p-6 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">ClawLite published skill pages</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">GEO and content quality cluster</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70 md:text-base">
                These are permanent ClawLite skill landing pages with actionable prompts, audit templates, and workflow recipes, not just directory cards.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {skillPages.map((page) => (
              <Card key={page.slug} className="flex h-full flex-col border-black/10 bg-white/95 p-6 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <Badge className="border-coral/20 bg-coral/10 text-coral">Published by ClawLite</Badge>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-ink">{page.h1}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/70">{page.metaDescription}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {page.secondaryKeywords.slice(0, 2).map((item) => (
                    <span key={item} className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-ink/65">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/skills/${page.slug}`}>Open page</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="space-y-10">
          {groupedSkills.map((group) => (
            <div key={group.category}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sea">{group.category}</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-ink md:text-3xl">
                    {group.items.length} skill{group.items.length > 1 ? "s" : ""}
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((skill) => (
                  <Card key={skill.slug} className="flex h-full flex-col border-black/10 bg-white/90 p-6 shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-sea/20 bg-sea/10 text-sea">{skill.category}</Badge>
                          <Badge
                            className={
                              skill.category === "OpenClaw Ops"
                                ? "border-coral/20 bg-coral/10 text-coral"
                                : "border-black/10 bg-black/5 text-ink/65"
                            }
                          >
                            {skill.category === "OpenClaw Ops" ? "Published by ClawLite" : "Recommended"}
                          </Badge>
                        </div>
                        <h3 className="mt-3 text-xl font-semibold text-ink">{skill.name}</h3>
                      </div>
                      <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium text-ink/60">
                        v{skill.version}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium text-coral">{skill.tagline}</p>
                    <p className="mt-3 text-sm leading-6 text-ink/70">{skill.description}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {skill.highlights.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-ink/65"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild>
                        <Link href={skill.href} target="_blank" rel="noopener noreferrer">
                          View on ClawHub
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
