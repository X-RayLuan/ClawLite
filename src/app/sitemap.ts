import type { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blog/posts';
import { skillPageSlugs } from '@/data/skill-pages';

const BASE_URL = 'https://clawlite.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Dynamically generate blog entries from the single source of truth (posts.ts)
  const blogEntries: MetadataRoute.Sitemap = Object.entries(blogPosts).map(([slug, post]) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.75
  }));

  const skillEntries: MetadataRoute.Sitemap = skillPageSlugs.map((slug) => ({
    url: `${BASE_URL}/skills/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.72
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85
    },
    ...blogEntries,
    {
      url: `${BASE_URL}/docs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/setup`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/skills`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7
    },
    ...skillEntries,
    {
      url: `${BASE_URL}/troubleshoot`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/downloads`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/marketing-agent-team`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75
    }
  ];
}
