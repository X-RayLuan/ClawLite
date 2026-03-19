import Link from 'next/link';
import { blogPosts } from '@/data/blog/posts';

type PostListItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

const excerptBySlug: Record<string, string> = {
  'best-cheap-models-for-openclaw-tool-use': 'A practical 2026 buyer guide to cheaper OpenClaw model routing, tool-use reliability, and why hybrid model stacks usually beat pure bargain hunting.',
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
  'openclaw-alternative': 'ClawLite is a one-click OpenClaw distribution with 40% cheaper tokens and 5-minute installation.',
  'how-to-install-openclaw': "Install OpenClaw in 5 minutes with ClawLite's one-click script. No manual configuration needed.",
  'clawlite-vs-openclaw': 'Detailed comparison: ClawLite offers simplified deployment and lower costs, OpenClaw provides full control.',
  'best-ai-agent-platform': "A practical buyer's guide to comparing AI agent platforms by deployment speed, operating cost, control, and real-world fit for teams that need production-ready automation.",
  'openclaw-token-cost': 'Learn how ClawLite reduces token costs by 40% through batch purchasing and routing optimization.',
  'what-is-clawlite': 'ClawLite is a commercial OpenClaw distribution with one-click installation and managed token pricing.',
  'openclaw-for-beginners': 'A beginner-friendly guide to installing OpenClaw, choosing your first safe workflow, and using ClawLite to reduce setup friction, mistakes, and time to first success.',
  'what-is-an-ai-browser-agent': 'A practical guide for operations teams: what AI browser agents are, where they fit, and how to deploy safely with human checkpoints.',
  'clawlite-free-trial': 'Try ClawLite free with 10,000 tokens. No credit card required, sign up in under 2 minutes.'
};

const orderedSlugs = [
  'byok-ai-assistant-guide',
  'best-cheap-models-for-openclaw-tool-use',
  'clawlite-vs-cursor',
  'ai-token-pricing-explained',
  'what-is-a-self-hosted-ai-assistant',
  'clawlite-vs-chatgpt-plus',
  'best-affordable-ai-assistant-for-developers',
  'best-affordable-ai-assistant-for-small-teams',
  'clawlite-vs-chatgpt-plus-for-developers',
  'ai-browser-agents-vs-traditional-rpa-for-modern-operations',
  'how-ai-browser-agents-automate-web-workflows-for-smb-teams',
  'best-ai-browser-automation-tools',
  'ai-browser-agent-vs-rpa',
  'openclaw-alternative',
  'how-to-install-openclaw',
  'clawlite-vs-openclaw',
  'best-ai-agent-platform',
  'openclaw-token-cost',
  'what-is-clawlite',
  'openclaw-for-beginners',
  'what-is-an-ai-browser-agent',
  'clawlite-free-trial'
] as const;

const posts = orderedSlugs.reduce<PostListItem[]>((acc, slug) => {
  const post = blogPosts[slug];
  if (!post) return acc;

  acc.push({
    slug,
    title: post.title,
    excerpt: excerptBySlug[slug] ?? post.content.split('\n').find((line) => line.trim() && !line.startsWith('#'))?.trim() ?? '',
    date: post.date
  });

  return acc;
}, []);

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
