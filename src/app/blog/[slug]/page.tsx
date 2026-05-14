export const revalidate = 60;

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

type FAQ = {
  question: string;
  answer: string;
};

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  faqs?: FAQ[];
  faqSchema?: string;
  published_at: string;
  created_at: string;
};

// keep for alias resolution only; actual data from DB
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

// Pre-generate known slugs at build time
export async function generateStaticParams() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from('blog_posts')
      .select('slug')
      .is('deleted_at', null)
      .not('published_at', 'is', null);
    return (data ?? []).map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseAdminClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, content, published_at, created_at')
    .eq('slug', slug)
    .is('deleted_at', null)
    .not('published_at', 'is', null)
    .single();
  if (!post) return { title: '404: This page could not be found.' };

  return {
    title: post.title,
    description:
      post.excerpt ??
      normalizeContent(post.content).split('\n').find((l) => l.trim())?.slice(0, 160) ??
      post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? post.title,
      type: 'article',
      publishedTime: post.published_at ?? post.created_at,
    },
    alternates: {
      canonical: `https://clawlite.ai/blog/${slug}`
    }
  };
}

// ─── Data helpers ──────────────────────────────────────────────────────────────

async function fetchPost(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, title, excerpt, content, faqs, published_at, created_at')
      .eq('slug', slug)
      .is('deleted_at', null)
      .not('published_at', 'is', null)
      .single();
    if (error || !data) return null;
    return data as unknown as BlogPost;
  } catch {
    return null;
  }
}

function buildFaqSchema(post: BlogPost) {
  if (post.faqSchema) return post.faqSchema;
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (post.faqs ?? []).map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    null,
    2
  );
}

// ─── Content rendering ────────────────────────────────────────────────────────

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    if (match[2]) {
      nodes.push(<strong key={`strong-${match.index}`}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={`em-${match.index}`}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      nodes.push(
        <a
          key={`link-${match.index}`}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline underline-offset-4 hover:text-blue-700"
        >
          {match[4]}
        </a>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function normalizeContent(content: string) {
  const lines = content.split('\n');
  const cleaned: string[] = [];
  let inJsonFence = false;
  let skippingSources = false;

  const metadataPrefixes = [
    '**Meta description:**', '**Primary keyword:**', '**Secondary keywords:**',
    '**Search intent:**', '**Updated:**', '**Theme classification:**',
    '**Audience:**', '**Draft date:**', '**Supporting keywords:**',
    '**Topic type:**', '**Insertion decision:**', '**Proof/source links:**',
    'Meta description:', 'Primary keyword:', 'Secondary keywords:',
    'Search intent:', 'Updated:', 'Theme classification:', 'Audience:',
    'Draft date:', 'Supporting keywords:', 'Topic type:',
    'Insertion decision:', 'Proof/source links:'
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '```json') { inJsonFence = true; continue; }
    if (inJsonFence && trimmed === '```') { inJsonFence = false; continue; }
    if (inJsonFence) continue;
    if (trimmed === '## Sources') { skippingSources = true; continue; }
    if (skippingSources && trimmed.startsWith('## ')) { skippingSources = false; }
    if (skippingSources) continue;
    if (trimmed.startsWith('# ')) continue;
    if (trimmed === '## FAQ Schema') continue;
    if (trimmed === '## Quick Answer') continue;
    if (metadataPrefixes.some((p) => trimmed.startsWith(p))) continue;
    cleaned.push(line);
  }

  return cleaned.join('\n').trim();
}

function renderContent(content: string) {
  const lines = normalizeContent(content).split('\n');
  const elements: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let bulletListBuffer: string[] = [];
  let orderedListBuffer: { text: string; extra: string[] }[] = [];
  let tableBuffer: string[] = [];
  const imagePattern = /^!\[([^\]]*)\]\(([^)]+)\)$/;

  const parseTableRow = (row: string) => row.split('|').slice(1, -1).map((c) => c.trim());
  const isTableRow = (line: string) => /^\|.+\|$/.test(line);
  const isTableDivider = (line: string) => /^\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(line);

  const flushParagraph = (key: string) => {
    if (!paragraphBuffer.length) return;
    const text = paragraphBuffer.join(' ').trim();
    if (text) {
      elements.push(
        <p key={key} className="mb-6 text-gray-700 leading-8">
          {renderInlineMarkdown(text)}
        </p>
      );
    }
    paragraphBuffer = [];
  };

  const flushBulletList = (key: string) => {
    if (!bulletListBuffer.length) return;
    elements.push(
      <ul key={key} className="mb-6 list-disc pl-6 space-y-2 text-gray-700 leading-8">
        {bulletListBuffer.map((item, i) => (
          <li key={`${key}-${i}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
    bulletListBuffer = [];
  };

  const flushOrderedList = (key: string) => {
    if (!orderedListBuffer.length) return;
    elements.push(
      <ol key={key} className="mb-6 list-decimal pl-6 space-y-2 text-gray-700 leading-8">
        {orderedListBuffer.map((item, i) => (
          <li key={`${key}-${i}`}>
            <div>{renderInlineMarkdown(item.text)}</div>
            {item.extra.map((el, j) => (
              <p key={`${key}-${i}-extra-${j}`} className="mt-2 text-gray-700 leading-8">
                {renderInlineMarkdown(el)}
              </p>
            ))}
          </li>
        ))}
      </ol>
    );
    orderedListBuffer = [];
  };

  const flushTable = (key: string) => {
    if (!tableBuffer.length) return;
    const [headerLine, ...rest] = tableBuffer;
    const bodyLines = rest.filter((l) => !isTableDivider(l));
    const headers = parseTableRow(headerLine);
    const rows = bodyLines.map(parseTableRow);

    elements.push(
      <div key={`table-wrap-${key}`} className="mb-8 overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((h, i) => (
                <th key={`th-${key}-${i}`} className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">
                  {renderInlineMarkdown(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={`tr-${key}-${ri}`} className="odd:bg-white even:bg-gray-50/50">
                {row.map((cell, ci) => (
                  <td key={`td-${key}-${ri}-${ci}`} className="border border-gray-200 px-4 py-3 align-top">
                    {renderInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  const flushAll = (key: string) => {
    flushParagraph(`p-${key}`);
    flushBulletList(`ul-${key}`);
    flushOrderedList(`ol-${key}`);
    flushTable(`table-${key}`);
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);

    if (!trimmed) {
      if (tableBuffer.length || bulletListBuffer.length || paragraphBuffer.length) {
        flushAll(String(index));
      }
      return;
    }

    if (isTableRow(trimmed) || (tableBuffer.length && isTableDivider(trimmed))) {
      flushParagraph(`p-${index}`);
      flushBulletList(`ul-${index}`);
      flushOrderedList(`ol-${index}`);
      tableBuffer.push(trimmed);
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushAll(String(index));
      elements.push(
        <h2 key={`h2-${index}`} className="text-2xl font-semibold mt-10 mb-4 text-gray-900">
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushAll(String(index));
      elements.push(
        <h3 key={`h3-${index}`} className="text-xl font-semibold mt-8 mb-3 text-gray-900">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph(`p-${index}`);
      flushOrderedList(`ol-${index}`);
      flushTable(`table-${index}`);
      bulletListBuffer.push(trimmed.slice(2));
      return;
    }

    if (orderedMatch) {
      flushParagraph(`p-${index}`);
      flushBulletList(`ul-${index}`);
      flushTable(`table-${index}`);
      orderedListBuffer.push({ text: orderedMatch[1], extra: [] });
      return;
    }

    if (trimmed.startsWith('> ')) {
      flushAll(String(index));
      elements.push(
        <blockquote key={`bq-${index}`} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-6">
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    const imageMatch = trimmed.match(imagePattern);
    if (imageMatch) {
      flushAll(String(index));
      const [, alt, src] = imageMatch;
      elements.push(
        <figure key={`img-${index}`} className="my-8">
          <img src={src} alt={alt} className="w-full rounded-xl border border-gray-200 shadow-sm" loading="lazy" />
          {alt ? <figcaption className="mt-3 text-sm text-gray-500">{alt}</figcaption> : null}
        </figure>
      );
      return;
    }

    if (orderedListBuffer.length) {
      orderedListBuffer[orderedListBuffer.length - 1].extra.push(trimmed);
      return;
    }

    paragraphBuffer.push(trimmed);
  });

  flushAll('final');
  return elements;
}

// ─── Page component ────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    notFound();
  }

  const faqSchema = buildFaqSchema(post);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <article className="max-w-4xl mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <time className="text-gray-600">{post.published_at ?? post.created_at}</time>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          {renderContent(post.content)}
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />

        <footer className="mt-16 pt-8 border-t border-gray-200">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ← Back to all posts
          </Link>
        </footer>
      </article>
    </div>
  );
}
