import Link from 'next/link';

export default function BlogPage() {
  const posts = [
    {
      slug: 'openclaw-alternative',
      title: 'OpenClaw Alternative — ClawLite',
      excerpt: 'ClawLite is a one-click OpenClaw distribution with 40% cheaper tokens and 5-minute installation.',
      date: '2026-03-04'
    },
    {
      slug: 'how-to-install-openclaw',
      title: 'How to Install OpenClaw (ClawLite Edition)',
      excerpt: 'Install OpenClaw in 5 minutes with ClawLite\'s one-click script. No manual configuration needed.',
      date: '2026-03-04'
    },
    {
      slug: 'clawlite-vs-openclaw',
      title: 'ClawLite vs OpenClaw — Complete Comparison',
      excerpt: 'Detailed comparison: ClawLite offers simplified deployment and lower costs, OpenClaw provides full control.',
      date: '2026-03-04'
    },
    {
      slug: 'best-ai-agent-platform',
      title: 'Best AI Agent Platform 2026',
      excerpt: 'Compare top AI agent platforms: OpenClaw, ClawLite, LangChain, AutoGPT, and CrewAI.',
      date: '2026-03-04'
    },
    {
      slug: 'openclaw-token-cost',
      title: 'OpenClaw Token Cost — How to Reduce AI Expenses',
      excerpt: 'Learn how ClawLite reduces token costs by 40% through batch purchasing and routing optimization.',
      date: '2026-03-04'
    },
    {
      slug: 'what-is-clawlite',
      title: 'What is ClawLite?',
      excerpt: 'ClawLite is a commercial OpenClaw distribution with one-click installation and managed token pricing.',
      date: '2026-03-04'
    },
    {
      slug: 'openclaw-for-beginners',
      title: 'OpenClaw for Beginners — Complete Guide',
      excerpt: 'Start with OpenClaw using ClawLite: installation, first commands, and common use cases.',
      date: '2026-03-04'
    },
    {
      slug: 'clawlite-free-trial',
      title: 'ClawLite Free Trial — Get Started Today',
      excerpt: 'Try ClawLite free with 10,000 tokens. No credit card required, sign up in under 2 minutes.',
      date: '2026-03-04'
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
