export type SkillCatalogItem = {
  name: string;
  slug: string;
  version: string;
  category: string;
  tagline: string;
  description: string;
  highlights: string[];
  href: string;
};

export const skillCatalog: SkillCatalogItem[] = [
  {
    name: "Agent Browser",
    slug: "agent-browser",
    version: "0.2.0",
    category: "Automation",
    tagline: "Drive live web workflows from an agent.",
    description:
      "Control pages, click through flows, fill forms, take snapshots, and automate browser tasks with a structured agent workflow.",
    highlights: ["Browser automation", "Snapshots", "Live workflow control"],
    href: "https://clawhub.ai/skills/agent-browser"
  },
  {
    name: "SEO Content Autopilot by Citedy",
    slug: "citedy-seo-agent",
    version: "3.1.1",
    category: "SEO / GEO",
    tagline: "Audit content for AI citation readiness.",
    description:
      "Run GEO and SEO gap analysis, citation-readiness checks, source-backed audits, and optimization workflows for AI answer visibility.",
    highlights: ["Citation analysis", "Evidence extraction", "Content optimization"],
    href: "https://clawhub.ai/skills/citedy-seo-agent"
  },
  {
    name: "Content Quality Auditor",
    slug: "content-quality-auditor",
    version: "3.0.0",
    category: "SEO / GEO",
    tagline: "Score content quality with a full CORE-EEAT audit.",
    description:
      "Audit helpfulness, trust, expertise, and citation-worthiness across 80 checks and produce a prioritized fix plan.",
    highlights: ["80-point audit", "EEAT scoring", "Prioritized fixes"],
    href: "https://clawhub.ai/skills/content-quality-auditor"
  },
  {
    name: "Elite Long-Term Memory",
    slug: "elite-longterm-memory",
    version: "1.2.3",
    category: "Memory",
    tagline: "Build durable memory for agent systems.",
    description:
      "Set up WAL-style memory, semantic retrieval, git-notes sync, and cloud-backed persistence for long-running agents.",
    highlights: ["Durable memory", "Semantic retrieval", "Agent persistence"],
    href: "https://clawhub.ai/skills/elite-longterm-memory"
  },
  {
    name: "Frontend Design",
    slug: "frontend-design-3",
    version: "0.1.0",
    category: "Frontend",
    tagline: "Turn plain prompts into stronger UI output.",
    description:
      "Build more distinctive, production-grade frontend components and pages with less generic AI styling.",
    highlights: ["UI quality", "Production-minded", "Design direction"],
    href: "https://clawhub.ai/skills/frontend-design-3"
  },
  {
    name: "Frontend Design Ultimate",
    slug: "frontend-design-ultimate",
    version: "1.0.0",
    category: "Frontend",
    tagline: "Create bolder landing pages and static sites.",
    description:
      "Generate memorable React, Tailwind, and shadcn/ui marketing sites, dashboards, and portfolios from text requirements.",
    highlights: ["Landing pages", "React + Tailwind", "Visual design"],
    href: "https://clawhub.ai/skills/frontend-design-ultimate"
  },
  {
    name: "GEO Content Optimizer",
    slug: "geo-content-optimizer",
    version: "3.0.0",
    category: "SEO / GEO",
    tagline: "Make pages more quotable by AI engines.",
    description:
      "Optimize pages and content assets for AI citation frequency across ChatGPT, Gemini, Perplexity, Claude, and AI Overviews.",
    highlights: ["AI visibility", "Citation frequency", "Answer-engine optimization"],
    href: "https://clawhub.ai/skills/geo-content-optimizer"
  },
  {
    name: "GEO Optimization",
    slug: "geo-optimization",
    version: "1.1.0",
    category: "SEO / GEO",
    tagline: "Improve AI search visibility end-to-end.",
    description:
      "Audit and improve GEO performance and LLM citation potential for websites and landing pages across major answer engines.",
    highlights: ["Visibility audits", "LLM citations", "Page optimization"],
    href: "https://clawhub.ai/skills/geo-optimization"
  },
  {
    name: "Hippocampus Memory",
    slug: "hippocampus",
    version: "3.9.0",
    category: "Memory",
    tagline: "Run hippocampus-style memory workflows.",
    description:
      "Operate Stanford Generative Agents-inspired memory systems with encoding, decay, recall, and reinforcement patterns.",
    highlights: ["Encoding", "Decay & recall", "Behavioral memory loops"],
    href: "https://clawhub.ai/skills/hippocampus"
  },
  {
    name: "TikTok App Marketing",
    slug: "larry",
    version: "1.0.0",
    category: "Growth",
    tagline: "Systemize TikTok slideshow growth for apps.",
    description:
      "Research competitors, generate creative, craft overlays, post slideshows, and iterate on hooks and CTAs.",
    highlights: ["Competitor research", "Creative workflow", "Hook iteration"],
    href: "https://clawhub.ai/skills/larry"
  },
  {
    name: "On-Page SEO Auditor",
    slug: "on-page-seo-auditor",
    version: "3.0.0",
    category: "SEO / GEO",
    tagline: "Find the on-page issues blocking rankings.",
    description:
      "Audit titles, meta descriptions, headings, content, links, and image optimization to uncover page-level SEO weaknesses.",
    highlights: ["Page SEO", "Structure checks", "Ranking blockers"],
    href: "https://clawhub.ai/skills/on-page-seo-auditor"
  },
  {
    name: "OpenClaw Backup & Restore",
    slug: "openclaw-workspace-backup-restore",
    version: "1.2.0",
    category: "OpenClaw Ops",
    tagline: "Protect and restore OpenClaw state safely.",
    description:
      "Handle OpenClaw backup, restore, rollback, validation, and off-machine recovery workflows for workspace-critical files.",
    highlights: ["Backup & restore", "Rollback validation", "Workspace recovery"],
    href: "https://clawhub.ai/skills/openclaw-workspace-backup-restore"
  },
  {
    name: "OpenClaw Daily Backup",
    slug: "openclaw-daily-backup",
    version: "1.3.0",
    category: "OpenClaw Ops",
    tagline: "Schedule repeatable OpenClaw protection.",
    description:
      "Automate daily backup, rollback, and recovery hygiene for core OpenClaw identity and configuration files.",
    highlights: ["Daily protection", "Routine recovery", "Config safety"],
    href: "https://clawhub.ai/skills/openclaw-daily-backup"
  },
  {
    name: "OpenClaw Mem",
    slug: "openclaw-mem",
    version: "2.1.0",
    category: "OpenClaw Ops",
    tagline: "Keep agent memory precise and durable.",
    description:
      "Curate, trim, structure, and preserve OpenClaw memory so long-term recall stays useful instead of noisy.",
    highlights: ["Memory curation", "Recall quality", "Durable context"],
    href: "https://clawhub.ai/skills/openclaw-mem"
  },
  {
    name: "SEO Content Writer",
    slug: "seo-content-writer",
    version: "3.0.0",
    category: "SEO / GEO",
    tagline: "Draft SEO content with stronger structure and metadata.",
    description:
      "Create keyword-targeted articles, landing pages, FAQs, metadata, and publishing checklists for search-driven growth.",
    highlights: ["Keyword targeting", "Metadata", "FAQ structure"],
    href: "https://clawhub.ai/skills/seo-content-writer"
  },
  {
    name: "Tavily Search",
    slug: "tavily-search",
    version: "1.0.0",
    category: "Research",
    tagline: "Give agents a tighter web research loop.",
    description:
      "Use Tavily-powered web search workflows when concise, relevant, AI-agent-friendly research results matter most.",
    highlights: ["Web research", "Search workflow", "Agent-friendly results"],
    href: "https://clawhub.ai/skills/tavily-search"
  }
];
