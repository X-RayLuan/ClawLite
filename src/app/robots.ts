import type { MetadataRoute } from 'next';

const BASE_URL = 'https://clawlite.ai';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/blog']
    },
    sitemap: `${BASE_URL}/sitemap.xml`
  };
}
