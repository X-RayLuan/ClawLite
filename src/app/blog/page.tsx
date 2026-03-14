import Link from 'next/link';

export default function BlogPage() {
  const posts = [
    {
      slug: 'byok-ai-assistant-guide',
      title: 'What Is BYOK for AI Assistants? Why It Matters for Cost, Privacy, and Control',
      excerpt: 'A practical guide to BYOK for AI assistants, including when it lowers costs, where it improves control, and how ClawLite makes BYOK easier to adopt.',
      date: '2026-03-14'
    },
    {
      slug: 'clawlite-vs-chatgpt-plus-for-developers',
      title: 'ClawLite vs ChatGPT Plus for Developers: Cost Control, Privacy, and Flexibility in 2026',
      excerpt: 'A practical developer-focused comparison of ClawLite and ChatGPT Plus across pricing model, provider control, privacy boundaries, and workflow flexibility.',
      date: '2026-03-14'
    },
    {
      slug: 'ai-browser-agents-vs-traditional-rpa-for-modern-operations',
      title: 'AI Browser Agents vs Traditional RPA: Which Fits Modern Operations Better?',
      excerpt: 'A practical comparison framework for operations leaders choosing AI browser agents, traditional RPA, or a hybrid model in 2026.',
      date: '2026-03-11'
    },
    {
      slug: 'how-ai-browser-agents-automate-web-workflows-for-smb-teams',
      title: 'How AI Browser Agents Automate Repetitive Web Workflows for SMB Teams',
      excerpt: 'A practical playbook for SMB teams to automate repetitive browser workflows with AI browser agents, governance checkpoints, and measurable ROI.',
      date: '2026-03-11'
    },
    {
      slug: 'best-ai-browser-automation-tools',
      title: 'Best AI Browser Automation Tools for SMB Ops Teams',
      excerpt: 'An SMB-focused buying guide to evaluate AI browser automation tools by time-to-value, control, and maintenance cost.',
      date: '2026-03-11'
    },
    {
      slug: 'ai-browser-agent-vs-rpa',
      title: 'AI Browser Agent vs RPA: Which Automation Stack Should You Choose in 2026?',
      excerpt: 'A practical 2026 decision framework for choosing AI browser agents, RPA, or a hybrid automation stack.',
      date: '2026-03-11'
    },
    {
      slug: 'openclaw-alternative',
      title: 'Looking for an OpenClaw Alternative? Why Many Teams Choose ClawLite',
      excerpt: 'ClawLite is a one-click OpenClaw distribution with 40% cheaper tokens and 5-minute installation.',
      date: '2026-03-11'
    },
    {
      slug: 'how-to-install-openclaw',
      title: 'How to Install OpenClaw in 5 Minutes with ClawLite',
      excerpt: 'Install OpenClaw in 5 minutes with ClawLite\'s one-click script. No manual configuration needed.',
      date: '2026-03-11'
    },
    {
      slug: 'clawlite-vs-openclaw',
      title: 'ClawLite vs OpenClaw: Which One Makes More Sense for You?',
      excerpt: 'Detailed comparison: ClawLite offers simplified deployment and lower costs, OpenClaw provides full control.',
      date: '2026-03-11'
    },
    {
      slug: 'best-ai-agent-platform',
      title: 'Best AI Agent Platform in 2026: What Smart Buyers Should Actually Compare',
      excerpt: 'A practical buyer\'s guide to comparing AI agent platforms by deployment speed, operating cost, control, and real-world fit for teams that need production-ready automation.',
      date: '2026-03-11'
    },
    {
      slug: 'openclaw-token-cost',
      title: 'OpenClaw Token Cost: How Teams Can Reduce AI Spend Without Losing Capability',
      excerpt: 'Learn how ClawLite reduces token costs by 40% through batch purchasing and routing optimization.',
      date: '2026-03-11'
    },
    {
      slug: 'what-is-clawlite',
      title: 'What Is ClawLite? A Straight Answer for Buyers, Builders, and Small Teams',
      excerpt: 'ClawLite is a commercial OpenClaw distribution with one-click installation and managed token pricing.',
      date: '2026-03-11'
    },
    {
      slug: 'openclaw-for-beginners',
      title: 'OpenClaw for Beginners: Start Faster with ClawLite',
      excerpt: 'A beginner-friendly guide to installing OpenClaw, choosing your first safe workflow, and using ClawLite to reduce setup friction, mistakes, and time to first success.',
      date: '2026-03-11'
    },
    {
      slug: 'what-is-an-ai-browser-agent',
      title: 'What Is an AI Browser Agent? A Practical Guide for Teams That Want Real Automation',
      excerpt: 'A practical guide for operations teams: what AI browser agents are, where they fit, and how to deploy safely with human checkpoints.',
      date: '2026-03-11'
    },
    {
      slug: 'clawlite-free-trial',
      title: 'ClawLite Free Trial: How to Evaluate It Properly Before You Commit',
      excerpt: 'Try ClawLite free with 10,000 tokens. No credit card required, sign up in under 2 minutes.',
      date: '2026-03-11'
    }
  ];

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
