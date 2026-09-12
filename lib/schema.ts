import { site } from '@/lib/site';
import { getDictionary, locales, localeList, type Locale } from '@/lib/i18n';

/**
 * JSON-LD ต่อหนึ่งภาษา
 * - ธุรกิจและเว็บไซต์ใช้ @id เดียวกันทุกภาษา เพราะเป็น entity เดียวกัน
 * - WebPage / FAQPage / ItemList ผูกกับ URL ของหน้านั้น ๆ และระบุ inLanguage ตามภาษา
 */
export function buildJsonLd(locale: Locale) {
  const t = getDictionary(locale);
  const origin = site.origin;
  const pageUrl = origin + locales[locale].path;

  const businessId = `${origin}/#business`;
  const websiteId = `${origin}/#website`;
  const ref = { '@id': businessId };
  const country = (name: string) => ({ '@type': 'Country', name });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['ProfessionalService', 'Organization'],
        '@id': businessId,
        name: t.schema.businessName,
        alternateName: t.schema.alternateName,
        url: `${origin}/`,
        description: t.schema.description,
        slogan: t.schema.slogan,
        email: site.contact.email,
        telephone: site.contact.phoneIntl,
        image: origin + site.ogImage,
        logo: {
          '@type': 'ImageObject',
          url: origin + site.ogImage,
          width: 1200,
          height: 630,
        },
        knowsLanguage: localeList.map((l) => l.code),
        knowsAbout: t.schema.knowsAbout,
        areaServed: {
          '@type': 'Country',
          name: t.schema.countryName,
          alternateName: 'Thailand',
        },
        address: { '@type': 'PostalAddress', addressCountry: 'TH' },
        sameAs: [site.contact.lineUrl],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            telephone: site.contact.phoneIntl,
            email: site.contact.email,
            availableLanguage: ['Thai', 'English'],
            areaServed: 'TH',
          },
        ],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '20:00',
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: t.schema.offerCatalogName,
          itemListElement: t.schema.services.map((service) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: service.name,
              description: service.description,
              serviceType: service.name,
              provider: ref,
              areaServed: country(t.schema.countryName),
            },
          })),
        },
        aggregateRating: { '@type': 'AggregateRating', ...site.rating },
        review: t.schema.reviews.map((review) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: review.author },
          datePublished: review.datePublished,
          reviewBody: review.body,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: site.rating.bestRating,
            worstRating: site.rating.worstRating,
          },
          itemReviewed: ref,
        })),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${origin}/`,
        name: t.schema.businessName,
        inLanguage: localeList.map((l) => l.schemaLang),
        publisher: ref,
      },
      {
        '@type': ['WebPage', 'AboutPage'],
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: t.seo.title,
        description: t.seo.description,
        inLanguage: locales[locale].schemaLang,
        isPartOf: { '@id': websiteId },
        about: ref,
        primaryImageOfPage: { '@type': 'ImageObject', url: origin + site.ogImage },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        url: `${pageUrl}#faq`,
        inLanguage: locales[locale].schemaLang,
        isPartOf: { '@id': websiteId },
        mainEntity: t.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.schemaA },
        })),
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#works`,
        name: t.schema.worksListName,
        numberOfItems: t.works.items.length,
        itemListElement: t.works.items.map((work, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'WebApplication',
            name: work.name,
            url: site.works[i].url,
            description: work.schemaDesc,
            applicationCategory: site.works[i].category,
            operatingSystem: 'Web browser',
            inLanguage: site.workLanguage,
            author: ref,
            creator: ref,
          },
        })),
      },
    ],
  };
}
