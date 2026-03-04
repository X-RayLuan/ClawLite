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
      url: `${BASE_URL}/setup`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
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
