import type { MetadataRoute } from 'next';

const BASE_URL = 'https://clawlite.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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

    {
      url: `${BASE_URL}/blog/byok-ai-assistant-guide`,
      lastModified: new Date('2026-03-18T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog/clawlite-vs-chatgpt-plus-for-developers`,
      lastModified: new Date('2026-03-14T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog/clawlite-vs-chatgpt-plus`,
      lastModified: new Date('2026-03-17T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog/what-is-a-self-hosted-ai-assistant`,
      lastModified: new Date('2026-03-17T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog/best-affordable-ai-assistant-for-developers`,
      lastModified: new Date('2026-03-17T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog/best-cheap-models-for-openclaw-tool-use`,
      lastModified: new Date('2026-03-17T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog/best-byok-ai-assistant`,
      lastModified: new Date('2026-03-16T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/troubleshoot`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7
    }
  ];
}
