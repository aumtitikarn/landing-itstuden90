import th from '@/i18n/th.json';
import en from '@/i18n/en.json';

/** th.json เป็นต้นแบบของโครงสร้าง — ถ้า en.json ไม่ตรง typecheck จะฟ้องทันที */
export type Dict = typeof th;
export type Locale = 'th' | 'en';

export const locales = {
  th: {
    code: 'th' as const,
    htmlLang: 'th',
    hreflang: 'th',
    ogLocale: 'th_TH',
    schemaLang: 'th-TH',
    path: '/',
  },
  en: {
    code: 'en' as const,
    htmlLang: 'en',
    hreflang: 'en',
    ogLocale: 'en_US',
    schemaLang: 'en-US',
    path: '/en/',
  },
} as const;

export const localeList = [locales.th, locales.en];

/** ภาษาที่ใช้เป็น x-default (ผู้เข้าชมที่ไม่ตรงภาษาใดจะถูกชี้มาที่นี่) */
export const defaultLocale: Locale = 'th';

const dictionaries: Record<Locale, Dict> = { th, en };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'th' ? 'en' : 'th';
}

export function pathFor(locale: Locale): string {
  return locales[locale].path;
}
