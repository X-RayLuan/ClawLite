import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/data/blog/posts';

const slugAliases: Record<string, string> = {
  '2026-03-21-why-ai-teams-quit-after-the-demo': 'ai-agent-setup-friction',
  '2026-03-21-openclaw-vs-clawlite-installation-guide': 'openclaw-vs-clawlite-which-setup-makes-more-sense-for-real-work',
  '2026-03-21-cheap-ai-tokens-vs-cheap-ai-workflows': 'cheap-ai-tokens-vs-cheap-ai-workflows',
  'openclaw-setup-friction': 'how-to-install-openclaw-without-setup-chaos-and-budget-surprises',
  'managing-ai-cost-anxiety-with-clawlite': 'why-cheap-ai-tokens-still-feel-expensive-in-practice',
  'the-real-ai-premium-is-not-power-it-is-reliability': 'why-boring-reliability-is-a-pricing-feature-in-ai-workflows',
  'best-cheap-models-for-openclaw-tool-use': 'openclaw-cost-control-starts-with-routing-not-hype',
  'what-is-a-self-hosted-ai-assistant': 'self-hosted-ai-assistant-with-less-setup-friction-and-more-predictable-spend',
  'clawlite-vs-chatgpt-plus': 'best-chatgpt-alternative-for-developers',
  'how-to-install-an-ai-assistant-easily': 'how-to-install-openclaw-without-setup-chaos-and-budget-surprises',
  'byok-ai-assistant-guide': 'byok-vs-managed-tokens-which-cost-model-fits-better',
  'how-ai-browser-agents-automate-web-workflows-for-smb-teams': 'what-is-an-ai-browser-agent',
  'openclaw-alternative': 'openclaw-vs-clawlite-which-setup-makes-more-sense-for-real-work',
  'how-to-install-openclaw': 'how-to-install-openclaw-without-setup-chaos-and-budget-surprises',
  'clawlite-vs-openclaw': 'openclaw-vs-clawlite-which-setup-makes-more-sense-for-real-work',
  'best-ai-agent-platform': 'ai-assistant-buyers-guide-for-small-teams',
  'openclaw-token-cost': 'openclaw-pricing-explained',
  'what-is-clawlite': 'ai-assistant-buyers-guide-for-small-teams',
  'openclaw-for-beginners': 'openclaw-setup-guide-for-beginners',
  'clawlite-free-trial': 'ai-assistant-buyers-guide-for-small-teams',
  'ai-browser-agent-vs-rpa': 'what-is-an-ai-browser-agent',
  'best-ai-browser-automation-tools': 'what-is-an-ai-browser-agent',
  'ai-browser-agents-vs-traditional-rpa-for-modern-operations': 'what-is-an-ai-browser-agent',
  'clawlite-vs-chatgpt-plus-for-developers': 'best-ai-assistant-for-developers-who-want-lower-cost-and-more-control',
  'best-affordable-ai-assistant-for-small-teams': 'ai-assistant-buyers-guide-for-small-teams',
  'best-affordable-ai-assistant-for-developers': 'best-ai-assistant-for-developers-who-want-lower-cost-and-more-control',
  'clawlite-vs-cursor': 'what-developers-should-optimize-before-choosing-ai-assistant',
  'best-byok-ai-assistant': 'byok-vs-managed-tokens-which-cost-model-fits-better',
  'openclaw-install-guide-fastest-way': 'how-to-install-openclaw-in-10-minutes',
  'what-is-byok-for-ai-assistants-why-it-matters-for-cost-privacy-and-control': 'byok-vs-managed-tokens-which-cost-model-fits-better'
};

export const metadata: Metadata = {
  title: 'ClawLite Blog',
  description: 'Guides, comparisons, and insights on OpenClaw and AI agents',
  alternates: {
    canonical: 'https://clawlite.ai/blog'
  }
};

type PostListItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

function extractCleanExcerpt(content: string) {
  const metadataPrefixes = [
    /\*\*Meta description:\*\*/i,
    /\*\*Primary keyword:\*\*/i,
    /\*\*Secondary keywords?:\*\*/i,
    /\*\*Search intent:\*\*/i,
    /\*\*Updated:\*\*/i,
    /\*\*Theme classification:\*\*/i,
    /\*\*Audience:\*\*/i,
    /\*\*Draft date:\*\*/i,
    /\*\*Supporting keywords:\*\*/i,
    /\*\*Topic type:\*\*/i,
    /\*\*Insertion decision:\*\*/i,
    /\*\*Proof\/source links:\*\*/i,
    /Meta description:/i,
    /Primary keyword:/i,
    /Secondary keywords?:/i,
    /Search intent:/i,
    /Updated:/i,
    /Audience:/i,
    /Draft date:/i,
    /Supporting keywords:/i,
    /Topic type:/i,
    /Insertion decision:/i,
    /Proof\/source links:/i,
    /\|\s*Primary keyword\s*\|/i,
    /\|\s*Secondary keywords?:\s*\|/i,
    /\|\s*Search intent\s*\|/i,
    /##\s*Search intent/i,
    /##\s*Meta description/i,
    /##\s*Primary keyword/i,
    /##\s*Secondary keywords?/i,
    /##\s*Updated/i,
    /##\s*Theme classification/i,
    /##\s*Audience/i,
    /##\s*Draft date/i,
    /##\s*Supporting keywords/i,
    /##\s*Topic type/i,
    /##\s*Insertion decision/i,
    /##\s*Proof\/source links/i,
  ];

  const normalizeLine = (line: string) => line.replace(/^`+/, '').trim();

  const lines = content.split('\n');
  const quickAnswerRegex = /^##\s*quick\s*answer/i;

  const cleanLine = (line: string) =>
    line
      .replace(/^>\s*\*\*Quick answer:\*\*\s*/i, '')
      .replace(/^\*\*Quick answer:\*\*\s*/i, '')
      .replace(/^>\s*/, '')
      .trim();

  const isMetadataLine = (line: string) => {
    const normalized = normalizeLine(line);
    if (metadataPrefixes.some((pattern) => pattern.test(normalized))) return true;
    if (/^\*\s*\|/.test(normalized)) return true;
    if (/^\|\s*$/.test(normalized)) return false;
    return false;
  };

  const findFirstContentLine = (startIndex = 0) => {
    let inSources = false;
    let inJsonFence = false;

    for (let index = startIndex; index < lines.length; index += 1) {
      const rawLine = lines[index];
      const line = normalizeLine(rawLine);
      if (!line) continue;

      if (line === '```json') {
        inJsonFence = true;
        continue;
      }
      if (inJsonFence && line === '```') {
        inJsonFence = false;
        continue;
      }
      if (inJsonFence) continue;

      if (line === '## Sources' || /^##\s*Table of contents/i.test(line)) {
        inSources = true;
        continue;
      }
      if (inSources) {
        if (/^##\s+/.test(line)) inSources = false;
        else continue;
      }

      if (line.startsWith('```')) continue;
      if (line.startsWith('# ')) continue;
      if (/^##\s*FAQ\b/i.test(line)) continue;
      if (/^##\s*Quick Answer/i.test(line) || /^##\s*Quick answer/i.test(line)) continue;
      if (/^##\s+/.test(line)) continue;
      if (line.startsWith('- [') || /^-\s*\[/.test(line)) continue;
      if (/^\*\s*\[[^\]]+\]\(/.test(line)) continue;
      if (isMetadataLine(line)) continue;

      return cleanLine(line);
    }

    return '';
  };

  const quickAnswerIndex = lines.findIndex((line) => quickAnswerRegex.test(normalizeLine(line)));
  if (quickAnswerIndex >= 0) {
    return findFirstContentLine(quickAnswerIndex + 1);
  }

  return findFirstContentLine(0);
}

const excerptBySlug: Record<string, string> = {
    'cost-per-successful-workflow-ai-assistant-buyers-guide': 'If your team buys AI assistants for recurring work, compare cost per successful workflow, not token price alone.',
    'best-ai-assistant-for-developers-who-want-lower-cost-and-more-control': 'Small teams should choose a self-hosted AI assistant based on reliability, setup burden, operator control, and cost per successful workflow.',
    'byok-vs-managed-tokens-which-cost-model-fits-better': 'BYOK is often best for users who want pricing control, while managed tokens can be better when simplicity and lower operations overhead matter more.',
    'first-useful-workflow-not-install-success': 'The right activation metric for an AI assistant is first useful workflow success, not install success.',
  'best-self-hosted-ai-assistant-2026-boring-reliability': 'The best self-hosted AI assistant in 2026 is not the flashiest demo. It is the one that stays reliable, understandable, and cost-sane when real work begins.',
  '2026-03-21-why-ai-teams-quit-after-the-demo': 'Most teams do not quit AI because the model is weak. They quit because the workflow turns fragile after the first impressive demo.',
  '2026-03-21-openclaw-vs-clawlite-installation-guide': 'A practical installation comparison: ClawLite gets most teams to first value faster, while direct OpenClaw setup suits users who want more self-managed control.',
  '2026-03-21-cheap-ai-tokens-vs-cheap-ai-workflows': 'Cheap token prices can still produce expensive operations. Here is why workflow reliability usually matters more than the lowest nominal token rate.',
  'openclaw-setup-friction': 'Stop losing users on setup friction. This practical guide shows how one-click installation can improve first-run success with less debug overhead.',
  'managing-ai-cost-anxiety-with-clawlite': 'Learn how to lower AI adoption friction from cost uncertainty with predictable spend planning and ClawLite’s BYOK + managed token model.',
  'the-real-ai-premium-is-not-power-it-is-reliability': 'Reliability, not flash, is the real premium in AI operations: how boring reliability beats fragile demos in day-to-day workflows.',
  'best-cheap-models-for-openclaw-tool-use': 'A practical 2026 buyer guide to efficient OpenClaw model routing, tool-use reliability, and why hybrid model stacks usually beat pure bargain hunting.',
  'ai-token-pricing-explained': 'A practical 2026 guide to estimating real AI assistant cost, comparing token billing with subscriptions, and deciding when BYOK or ClawLite makes financial sense.',
  'clawlite-vs-cursor': 'A practical comparison of ClawLite and Cursor across pricing model, workflow scope, local-first control, and which one fits developers who need more than editor-native coding.',
  'what-is-a-self-hosted-ai-assistant': 'A self-hosted AI assistant runs under your control instead of inside a closed SaaS box. Here’s what it is, what it costs, where it helps, and when ClawLite is the easier way to get started.',
  'clawlite-vs-chatgpt-plus': 'ClawLite and ChatGPT Plus solve different problems. ChatGPT Plus is simpler for general use; ClawLite is stronger for developers who want lower variable cost, BYOK, and local-first control.',
  'best-affordable-ai-assistant-for-developers': 'The best affordable AI assistant for developers is not the cheapest sticker price. It is the one with the best balance of workflow power, setup friction, and cost control. Here’s how ClawLite stacks up.',
  'best-affordable-ai-assistant-for-small-teams': 'Small teams need an AI assistant that balances cost control, setup speed, and workflow flexibility. This buyer guide explains why ClawLite is worth shortlisting for startups and lean ops teams.',
  'byok-ai-assistant-guide': 'A practical guide to BYOK for AI assistants, including when it lowers costs, where it improves control, and how ClawLite makes BYOK easier to adopt.',
  'clawlite-vs-chatgpt-plus-for-developers': 'A practical developer-focused comparison of ClawLite and ChatGPT Plus across pricing model, provider control, privacy boundaries, and workflow flexibility.',
  'ai-browser-agents-vs-traditional-rpa-for-modern-operations': 'A practical comparison framework for operations leaders choosing AI browser agents, traditional RPA, or a hybrid model in 2026.',
  'how-ai-browser-agents-automate-web-workflows-for-smb-teams': 'A practical playbook for SMB teams to automate repetitive browser workflows with AI browser agents, governance checkpoints, and measurable ROI.',
  'best-ai-browser-automation-tools': 'An SMB-focused buying guide to evaluate AI browser automation tools by time-to-value, control, and maintenance cost.',
  'ai-browser-agent-vs-rpa': 'A practical 2026 decision framework for choosing AI browser agents, RPA, or a hybrid automation stack.',
  'openclaw-alternative': 'ClawLite is a one-click OpenClaw distribution with managed token billing and 5-minute installation.',
  'how-to-install-openclaw': "Install OpenClaw in 5 minutes with ClawLite's one-click script. No manual configuration needed.",
  'clawlite-vs-openclaw': 'Detailed comparison: ClawLite offers simplified deployment and lower costs, OpenClaw provides full control.',
  'best-ai-agent-platform': "A practical buyer's guide to comparing AI agent platforms by deployment speed, operating cost, control, and real-world fit for teams that need production-ready automation.",
  'openclaw-token-cost': 'Learn how ClawLite manages token costs through batch purchasing and routing optimization.',
  'what-is-clawlite': 'ClawLite is a commercial OpenClaw distribution with one-click installation and managed token pricing.',
  'openclaw-for-beginners': 'A beginner-friendly guide to installing OpenClaw, choosing your first safe workflow, and using ClawLite to reduce setup friction, mistakes, and time to first success.',
  'what-is-an-ai-browser-agent': 'A practical guide for operations teams: what AI browser agents are, where they fit, and how to deploy safely with human checkpoints.',
  'clawlite-free-trial': 'Try ClawLite free with 10,000 tokens. No credit card required, sign up in under 2 minutes.',
  'openclaw-install-guide-fastest-way': 'The fastest OpenClaw install path is the one that gets you from download to first useful run with the fewest moving parts and least setup friction.',
  'how-to-install-openclaw-in-10-minutes': 'A practical 10-minute OpenClaw install walkthrough for beginners who want the shortest path from download to first successful task.',
  'openclaw-setup-guide-for-beginners': 'A beginner-friendly OpenClaw setup guide covering installation, configuration, and the first useful workflow without unnecessary setup pain.',
  'best-openclaw-installer': 'Compare the main OpenClaw setup methods and choose the installer path that best fits beginners, developers, and self-hosted users.',
  'openclaw-tutorial-complete-beginner-walkthrough': 'A complete OpenClaw tutorial for beginners covering install, setup, first workflow, and the fastest path to real first value.',
  'openclaw-pricing-explained': 'Understand OpenClaw pricing, BYOK, cost-efficient token positioning, and how to think about real cost per successful workflow.',

  'how-to-install-openclaw-easily-with-less-risk': 'The easiest OpenClaw install path in 2026 is the one that reduces setup mistakes, validates the first run, and gets you to trustworthy first value faster.',
  'openclaw-pricing-vs-chatgpt-plus-2026': 'Compare OpenClaw-style pricing with ChatGPT Plus by looking at cost per successful workflow, not just sticker price.',
  'openclaw-vs-cursor-for-ai-workflows': 'Cursor is great inside the editor, but OpenClaw-style assistants make more sense when workflows spill into docs, browser actions, and operator tasks.',
  'best-beginner-openclaw-setup-without-terminal': 'A beginner-focused guide to choosing an OpenClaw setup path that reduces terminal-heavy friction and speeds up first useful success.',
  'self-hosted-ai-assistant-for-small-teams-2026': 'A buyer guide for small teams comparing self-hosted AI assistants by control, setup burden, privacy, and day-one trust.',
  'byok-vs-managed-tokens-for-openclaw': 'Understand when BYOK gives better control, when managed tokens lower friction, and how to choose the calmer first billing path.',
  'openclaw-install-checklist-for-first-run-trust': 'Use this checklist to verify an OpenClaw install before you trust it with real work, cost, and automation scope.',
  'cheapest-way-to-run-openclaw-daily': 'The cheapest OpenClaw path is not just the lowest token rate; it is the one that reduces retries, confusion, and daily workflow waste.',
  'openclaw-vs-chatgpt-for-privacy-and-control': 'A practical comparison for buyers who care more about privacy, control, and workflow ownership than generic feature lists.',
  'local-ai-assistant-for-content-creators': 'Why creators are looking past generic chat apps toward local AI assistants with more control, lower anxiety, and repeatable workflows.',
  'clawlite-vs-openclaw-for-nontechnical-teams': 'For nontechnical teams, the right question is not power but which path gets to useful value without the setup tax.',
  'openclaw-alternatives-for-budget-conscious-builders-2026': 'A shortlist of OpenClaw alternatives for builders who need lower cost, less setup regret, and better first-run confidence.',
};

const legacyPinnedSlugs = [
  '2026-03-21-why-ai-teams-quit-after-the-demo',
  '2026-03-21-openclaw-vs-clawlite-installation-guide',
  '2026-03-21-cheap-ai-tokens-vs-cheap-ai-workflows'
] as const;

const allSlugs = Array.from(
  new Set<string>([
    ...Object.keys(blogPosts),
    ...legacyPinnedSlugs,
  ])
);

const posts = allSlugs
  .map<PostListItem | null>((slug) => {
    const canonicalSlug = slugAliases[slug] ?? slug;
    const post = blogPosts[canonicalSlug] ?? blogPosts[slug];
    if (!post) return null;

    return {
      slug,
      title: post.title,
      excerpt:
        excerptBySlug[slug] ??
        excerptBySlug[canonicalSlug] ??
        extractCleanExcerpt(post.content),
      date: post.date,
    };
  })
  .filter((post): post is PostListItem => post !== null)
  .sort((a, b) => {
    const dateDelta = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDelta !== 0) return dateDelta;
    return a.title.localeCompare(b.title);
  });

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-12">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ClawLite Blog</h1>
          <p className="text-xl text-gray-600">
            Guides, comparisons, and insights on OpenClaw and AI agents
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <time className="text-sm text-gray-500">{post.date}</time>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
