import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, blogStaticParams, type BlogPost } from '@/data/blog/posts';

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

const slugAliases: Record<string, string> = {
  'what-is-byok-for-ai-assistants-why-it-matters-for-cost-privacy-and-control': 'byok-ai-assistant-guide'
};

export function generateStaticParams() {
  return [
    ...blogStaticParams(),
    { slug: 'what-is-byok-for-ai-assistants-why-it-matters-for-cost-privacy-and-control' }
  ];
}

function getPost(slug: string): BlogPost | undefined {
  return blogPosts[slugAliases[slug] ?? slug];
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

function normalizeContent(content: string) {
  const lines = content.split('\n');
  const cleaned: string[] = [];
  let inJsonFence = false;
  let skippingSources = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '```json') {
      inJsonFence = true;
      continue;
    }
    if (inJsonFence && trimmed === '```') {
      inJsonFence = false;
      continue;
    }
    if (inJsonFence) continue;

    if (trimmed === '## Sources') {
      skippingSources = true;
      continue;
    }
    if (skippingSources && trimmed.startsWith('## ')) {
      skippingSources = false;
    }
    if (skippingSources) continue;

    if (trimmed.startsWith('# ')) continue;
    if (trimmed.startsWith('**Meta description:**')) continue;
    if (trimmed === '## FAQ Schema') continue;

    cleaned.push(line);
  }

  return cleaned.join('\n').trim();
}

function renderContent(content: string) {
  const lines = normalizeContent(content).split('\n');
  const elements: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let bulletListBuffer: string[] = [];
  let orderedListBuffer: string[] = [];

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
        {bulletListBuffer.map((item, index) => (
          <li key={`${key}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
    bulletListBuffer = [];
  };

  const flushOrderedList = (key: string) => {
    if (!orderedListBuffer.length) return;
    elements.push(
      <ol key={key} className="mb-6 list-decimal pl-6 space-y-2 text-gray-700 leading-8">
        {orderedListBuffer.map((item, index) => (
          <li key={`${key}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ol>
    );
    orderedListBuffer = [];
  };

  const flushAll = (key: string) => {
    flushParagraph(`p-${key}`);
    flushBulletList(`ul-${key}`);
    flushOrderedList(`ol-${key}`);
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);

    if (!trimmed) {
      flushAll(String(index));
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
      bulletListBuffer.push(trimmed.slice(2));
      return;
    }

    if (orderedMatch) {
      flushParagraph(`p-${index}`);
      flushBulletList(`ul-${index}`);
      orderedListBuffer.push(orderedMatch[1]);
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

    paragraphBuffer.push(trimmed);
  });

  flushAll('final');
  return elements;
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);

  if (!post) {
    notFound();
  }

  const faqSchema = buildFaqSchema(post);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <article className="max-w-4xl mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <time className="text-gray-600">{post.date}</time>
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
