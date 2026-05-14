import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ClawLite Blog',
  description: 'Guides, comparisons, and insights on OpenClaw and AI agents',
  alternates: {
    canonical: 'https://clawlite.ai/blog'
  }
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

type PostListItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string;
  created_at: string;
};

async function fetchPosts(): Promise<PostListItem[]> {
  const res = await fetch(`${BASE_URL}/api/blog?page_size=100`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.data?.posts ?? []).filter((p: PostListItem) => p.published_at);
}

export default async function BlogPage() {
  const posts = await fetchPosts();

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
              <p className="text-gray-600 mb-4">
                {post.excerpt ?? post.title}
              </p>
              <div className="flex items-center justify-between">
                <time className="text-sm text-gray-500">
                  {post.published_at ?? post.created_at}
                </time>
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
