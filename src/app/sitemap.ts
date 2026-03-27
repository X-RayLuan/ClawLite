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
    // 2026-03-21 posts
    {
      url: `${BASE_URL}/blog/2026-03-21-why-ai-teams-quit-after-the-demo`,
      lastModified: new Date('2026-03-21T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog/2026-03-21-openclaw-vs-clawlite-installation-guide`,
      lastModified: new Date('2026-03-21T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog/2026-03-21-cheap-ai-tokens-vs-cheap-ai-workflows`,
      lastModified: new Date('2026-03-21T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    // Evergreen posts
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
      url: `${BASE_URL}/blog/openclaw-setup-friction`,
      lastModified: new Date('2026-03-15T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/managing-ai-cost-anxiety-with-clawlite`,
      lastModified: new Date('2026-03-15T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/the-real-ai-premium-is-not-power-it-is-reliability`,
      lastModified: new Date('2026-03-15T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/how-to-install-an-ai-assistant-easily`,
      lastModified: new Date('2026-03-14T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/how-ai-browser-agents-automate-web-workflows-for-smb-teams`,
      lastModified: new Date('2026-03-12T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/openclaw-alternative`,
      lastModified: new Date('2026-03-12T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/how-to-install-openclaw`,
      lastModified: new Date('2026-03-10T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/clawlite-vs-openclaw`,
      lastModified: new Date('2026-03-10T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/best-ai-agent-platform`,
      lastModified: new Date('2026-03-10T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/openclaw-token-cost`,
      lastModified: new Date('2026-03-08T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/what-is-clawlite`,
      lastModified: new Date('2026-03-08T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${BASE_URL}/blog/openclaw-for-beginners`,
      lastModified: new Date('2026-03-05T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/blog/clawlite-free-trial`,
      lastModified: new Date('2026-03-05T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/blog/ai-browser-agent-vs-rpa`,
      lastModified: new Date('2026-03-04T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/blog/best-ai-browser-automation-tools`,
      lastModified: new Date('2026-03-04T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/blog/what-is-an-ai-browser-agent`,
      lastModified: new Date('2026-03-03T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/blog/ai-browser-agents-vs-traditional-rpa-for-modern-operations`,
      lastModified: new Date('2026-03-03T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/blog/best-affordable-ai-assistant-for-small-teams`,
      lastModified: new Date('2026-03-02T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/blog/ai-token-pricing-explained`,
      lastModified: new Date('2026-03-01T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/blog/clawlite-vs-cursor`,
      lastModified: new Date('2026-02-28T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.7
    },
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
