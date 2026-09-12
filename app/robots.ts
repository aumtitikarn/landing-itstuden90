import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/* เปิดให้เก็บข้อมูลทั้ง search engine และ AI / answer engine (AEO + GEO)
   แต่กัน /api/ ไว้เพราะไม่มีเนื้อหาให้จัดอันดับ */
const CRAWLERS = [
  'Googlebot',
  'Googlebot-Image',
  'Bingbot',
  'Google-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'meta-externalagent',
  'cohere-ai',
  'YouBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      ...CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: '/api/' })),
    ],
    sitemap: `${site.origin}/sitemap.xml`,
    host: site.origin,
  };
}
