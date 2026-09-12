import type { Metadata } from 'next';
import { site } from '@/lib/site';
import {
  defaultLocale,
  getDictionary,
  locales,
  localeList,
  otherLocale,
  type Locale,
} from '@/lib/i18n';

/**
 * metadata ต่อหนึ่งภาษา — canonical ชี้หน้าตัวเอง และประกาศ hreflang ของทุกภาษา
 * แบบไปกลับครบ (reciprocal) ซึ่งเป็นเงื่อนไขที่ Google ใช้จับคู่หน้าต่างภาษา
 */
export function buildMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  const current = locales[locale];
  const other = locales[otherLocale(locale)];

  const languages: Record<string, string> = {};
  for (const l of localeList) languages[l.hreflang] = l.path;
  languages['x-default'] = locales[defaultLocale].path;

  return {
    metadataBase: new URL(site.origin),
    title: t.seo.title,
    description: t.seo.description,
    keywords: t.seo.keywords,
    authors: [{ name: t.seo.author }],
    publisher: t.seo.author,
    alternates: {
      canonical: current.path,
      languages,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: current.ogLocale,
      alternateLocale: other.ogLocale,
      siteName: t.schema.businessName,
      url: current.path,
      title: t.seo.title,
      description: t.seo.description,
      images: [
        {
          url: site.ogImage,
          width: 1200,
          height: 630,
          alt: t.seo.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.seo.title,
      description: t.seo.description,
      images: [site.ogImage],
    },
    other: {
      'geo.region': 'TH',
      'geo.placename': t.seo.geoPlacename,
      ICBM: '13.7563, 100.5018',
    },
  };
}

export const viewportConfig = {
  themeColor: '#F0B429',
  colorScheme: 'light dark' as const,
  width: 'device-width',
  initialScale: 1,
};
