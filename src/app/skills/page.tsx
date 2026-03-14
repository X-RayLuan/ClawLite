import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { skillCatalog } from "@/lib/skill-catalog";

const categoryOrder = ["OpenClaw Ops", "SEO / GEO", "Frontend", "Automation", "Memory", "Growth", "Research"];

const groupedSkills = categoryOrder
  .map((category) => ({
    category,
    items: skillCatalog.filter((skill) => skill.category === category)
  }))
  .filter((group) => group.items.length > 0);

export const metadata = {
  title: "ClawLite Skills",
  description: "Explore the ClawHub skills published by the ClawLite team."
};

export default function SkillsPage() {
  return (
    <main className="gradient-bg">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20">
        <Badge className="border-coral/20 bg-coral/10 text-coral">ClawLite Skills</Badge>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.02] text-ink md:text-6xl">
              Skills we publish to ClawHub — organized as products, not just prompts.
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-ink/70 md:text-xl">
              These are the workflows we turn into reusable agent capabilities: OpenClaw operations,
              recovery, SEO/GEO, frontend execution, research, and growth systems.
            </p>
          </div>
          <Card className="border-coral/20 bg-white/90 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">Why this tab exists</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>• Show ClawLite as an operating layer, not just an installer.</li>
              <li>• Turn our ClawHub work into browsable proof.</li>
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">Published Skills</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{skillCatalog.length}</p>
            <p className="mt-1 text-sm text-ink/65">Live in the catalog and ready to explore.</p>
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
                        <Badge className="border-sea/20 bg-sea/10 text-sea">{skill.category}</Badge>
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
