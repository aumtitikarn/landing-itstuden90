import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { defaultLocale, localeList, locales } from '@/lib/i18n';

/** ทุก URL ประกาศ alternate ของทุกภาษาแบบไปกลับครบ */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const l of localeList) languages[l.hreflang] = site.origin + l.path;
  languages['x-default'] = site.origin + locales[defaultLocale].path;

  return localeList.map((locale) => ({
    url: site.origin + locale.path,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: locale.code === defaultLocale ? 1 : 0.9,
    alternates: { languages },
  }));
}
