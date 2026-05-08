/**
 * Canonical blog content loader.
 *
 * All blog data flows through this module. Route-level code (pages, static
 * params, sitemap) should import from here — never directly from the
 * content directory.
 */

// ── Types ──────────────────────────────────────────────────────────────

export type FAQ = {
  question: string;
  answer: string;
};

/** Shape of each per-post file in content/blog/<slug>.ts */
export type BlogPostData = {
  title: string;
  date: string;
  content: string;
  faqs?: FAQ[];
  faqSchema?: string;
};

/** Runtime post with slug attached */
export type BlogPost = BlogPostData & { slug: string };

// ── Loader ─────────────────────────────────────────────────────────────

import { postRegistry } from '../../content/blog/_registry';

const REQUIRED_FIELDS: (keyof BlogPostData)[] = ['title', 'date', 'content'];

function validate(slug: string, data: BlogPostData): void {
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      throw new Error(
        `[blog] Post "${slug}" is missing required field "${field}". ` +
        `Check content/blog/${slug}.ts.`
      );
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    throw new Error(
      `[blog] Post "${slug}" has invalid date "${data.date}". Expected YYYY-MM-DD.`
    );
  }
}

// Validate all posts at module load time (build-time for static pages).
for (const [slug, data] of Object.entries(postRegistry)) {
  validate(slug, data);
}

// ── Public API ─────────────────────────────────────────────────────────

/** All posts keyed by slug (legacy compat shape). */
export const blogPosts: Record<string, BlogPostData> = postRegistry;

/** Static params for generateStaticParams. */
export function blogStaticParams(): { slug: string }[] {
  return Object.keys(postRegistry).map((slug) => ({ slug }));
}

/** Get a single post by slug, or undefined. */
export function getPost(slug: string): BlogPost | undefined {
  const data = postRegistry[slug];
  if (!data) return undefined;
  return { ...data, slug };
}

/** All posts sorted newest-first. */
export function getAllPosts(): BlogPost[] {
  return Object.entries(postRegistry)
    .map(([slug, data]) => ({ ...data, slug }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
