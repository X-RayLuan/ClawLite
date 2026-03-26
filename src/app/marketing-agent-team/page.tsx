import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, FileSearch, Layers3, Mail, PenTool, Radio, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Marketing Agent Team",
  description:
    "Meet the ClawLite marketing agent team: research, packaging, publishing, lifecycle, QA, and Mission Control working in one proof-driven operating loop."
};

const pillars = [
  {
    title: "Structured execution",
    body: "Research, packaging, publishing, lifecycle, QA, and truth-state reporting run as one operating loop."
  },
  {
    title: "Proof-driven delivery",
    body: "This system is built around URL proof, visibility checks, ASSET_CHECK, and receipt logging."
  },
  {
    title: "Same-day truth",
    body: "Mission Control exists to prevent optimism inflation and keep claimed progress aligned with real evidence."
  }
];

const workflow = [
  {
    label: "01",
    title: "Intelligence",
    body: "Hunter runs research, builds the Pain Map, applies the selection layer, and produces the Intel Pack."
  },
  {
    label: "02",
    title: "Packaging",
    body: "JK converts same-day research and assets into a cleaner writing substrate for downstream execution."
  },
  {
    label: "03",
    title: "Execution",
    body: "Elon, Tony, and Jenny publish across social, blog, and lifecycle lanes with proof requirements."
  },
  {
    label: "04",
    title: "QA",
    body: "Peter verifies live/public blog reality, and Karen checks whether claimed completion matches evidence."
  },
  {
    label: "05",
    title: "State closure",
    body: "Mission Control records the verified state of the day, including blockers and make-up work."
  }
];

const agents = [
  {
    name: "Muddy",
    role: "Marketing Lead",
    initials: "MU",
    accent: "from-coral/20 via-coral/10 to-white",
    summary: "Owns orchestration, priority setting, and cross-lane coordination.",
    duties: ["Orchestration", "Priority setting", "Cross-lane coordination"],
    icon: Layers3
  },
  {
    name: "Hunter",
    role: "Community Intelligence",
    initials: "HU",
    accent: "from-sea/25 via-sea/10 to-white",
    summary: "Owns Reddit + X research, the Pain Map, selection layer, Intel Pack, viral-learning loop, and marketing-assets sync.",
    duties: ["Research intel", "Pain Map + selection layer", "Marketing-assets sync"],
    icon: FileSearch
  },
  {
    name: "JK",
    role: "Packaging Layer",
    initials: "JK",
    accent: "from-amber-200/60 via-white to-coral/10",
    summary: "Owns converting same-day research and assets into a cleaner writing substrate.",
    duties: ["Packaging", "Hooks + framing", "Execution-ready handoff"],
    icon: PenTool
  },
  {
    name: "Elon",
    role: "Social Publishing",
    initials: "EL",
    accent: "from-sky-200/70 via-white to-sea/10",
    summary: "Owns X, LinkedIn, and Facebook publishing with URL proof, visibility proof, and ASSET_CHECK.",
    duties: ["Social publishing", "Visibility proof", "Acceptance receipts"],
    icon: Radio
  },
  {
    name: "Tony",
    role: "Blog Publishing",
    initials: "TO",
    accent: "from-coral/25 via-white to-amber-100/60",
    summary: "Owns keyword-first blog production, a publish-first workflow, and source publish plus QA closure.",
    duties: ["Keyword-first production", "Publish-first workflow", "QA closure inputs"],
    icon: PenTool
  },
  {
    name: "Jenny",
    role: "Lifecycle / Activation",
    initials: "JE",
    accent: "from-emerald-200/70 via-white to-sea/10",
    summary: "Owns cohort selection, send execution, delivery truth, and writeback/accounting.",
    duties: ["Cohort selection", "Send execution", "Writeback/accounting"],
    icon: Mail
  },
  {
    name: "Peter",
    role: "QA Closeout",
    initials: "PE",
    accent: "from-stone-200/70 via-white to-amber-50",
    summary: "Owns blog-lane verification and closes with PASS / FAIL / BLOCKED truth.",
    duties: ["Live URL verification", "Public QA", "PASS / FAIL / BLOCKED closeout"],
    icon: CheckCircle2
  },
  {
    name: "Karen",
    role: "Truth Gate",
    initials: "KA",
    accent: "from-violet-200/50 via-white to-stone-100",
    summary: "Owns final verification that claimed completion matches real evidence.",
    duties: ["Truth-gate QA", "Evidence checks", "Anti-optimism verification"],
    icon: ShieldCheck
  },
  {
    name: "Mission Control",
    role: "State Mirror",
    initials: "MC",
    accent: "from-ink/10 via-white to-sea/10",
    summary: "Owns same-day truth reflection, blockers, make-up work, and anti-optimism control.",
    duties: ["Lane-state mirror", "Blocker visibility", "Proof-based operating status"],
    icon: BarChart3
  }
] as const;

const truthModel = [
  "Live URL exists",
  "Visibility proof exists",
  "ASSET_CHECK is present",
  "Delivery truth is recorded",
  "QA closure is complete"
];

export default function MarketingAgentTeamPage() {
  return (
    <main className="gradient-bg">
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <Badge className="border-coral/20 bg-coral/10 text-coral">Marketing Agent Team</Badge>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.02] text-ink md:text-6xl">
              A proof-driven marketing team built on specialized agents.
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-ink/70 md:text-xl">
              ClawLite uses a multi-agent operating loop for research, packaging, publishing, lifecycle activation,
              QA, and same-day truth-state reporting. The goal is not just content generation. The goal is verified execution.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/setup">
                  Start with ClawLite <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/skills">Browse ClawLite Skills</Link>
              </Button>
            </div>
          </div>

          <Card className="border-coral/20 bg-white/90 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Operating model</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-ink">What it is</p>
                <p className="mt-1 text-sm text-ink/70">
                  An AI-native marketing operating system for structured execution, verified delivery, and reusable intelligence.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">What it avoids</p>
                <p className="mt-1 text-sm text-ink/70">
                  Draft-only progress, optimistic reporting, and claims of completion without proof.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Why it fits ClawLite</p>
                <p className="mt-1 text-sm text-ink/70">
                  ClawLite is built for lower-cost AI execution with more control, so the marketing system follows the same bias toward operational clarity.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="border-black/10 bg-white/90 p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">{pillar.title}</p>
              <p className="mt-3 text-sm leading-6 text-ink/70">{pillar.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft md:p-8">
          <div className="max-w-3xl">
            <Badge className="border-sea/20 bg-sea/10 text-sea">Workflow</Badge>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
              Clean information flow from research to proof.
            </h2>
            <p className="mt-3 text-lg text-ink/70">
              The marketing OS runs as a layered workflow so every downstream lane inherits the same-day context and proof requirements.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {workflow.map((step) => (
              <div key={step.label} className="rounded-2xl border border-black/8 bg-[#fcfcfa] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">{step.label}</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/70">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="mb-6 max-w-3xl">
          <Badge className="border-coral/20 bg-coral/10 text-coral">Agent Roster</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            The agents behind the operating loop.
          </h2>
          <p className="mt-3 text-lg text-ink/70">
            Each role is specialized. Together they turn fragmented marketing work into a repeatable execution system.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <Card key={agent.name} className="flex h-full flex-col border-black/10 bg-white/90 p-6 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${agent.accent} ring-1 ring-black/5`}>
                    <span className="font-display text-lg font-semibold text-ink">{agent.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-sea" />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">{agent.role}</p>
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold text-ink">{agent.name}</h3>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-ink/75">{agent.summary}</p>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Core duties</p>
                  <ul className="mt-3 space-y-2 text-sm text-ink/75">
                    {agent.duties.map((duty) => (
                      <li key={duty}>• {duty}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft md:grid-cols-[0.9fr_1.1fr] md:p-8">
          <div>
            <Badge className="border-sea/20 bg-sea/10 text-sea">Truth Model</Badge>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink">What counts as done.</h2>
            <p className="mt-3 text-lg text-ink/70">
              This team is designed around delivery truth, not output volume. Published proof and QA closure are part of the contract.
            </p>
          </div>

          <div className="grid gap-3">
            {truthModel.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#fcfcfa] p-4 ring-1 ring-black/5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-sea" />
                <p className="text-sm text-ink/75">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
