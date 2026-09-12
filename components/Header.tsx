import { site } from '@/lib/site';
import { locales, otherLocale, type Dict, type Locale } from '@/lib/i18n';
import { BrandMarkIcon, GlobeIcon, LineIcon } from '@/components/Icons';

const NAV = ['services', 'works', 'process', 'reviews', 'faq', 'about'] as const;

export function Header({ t, locale }: { t: Dict; locale: Locale }) {
  const other = locales[otherLocale(locale)];

  return (
    <header>
      <div className="bar">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <BrandMarkIcon />
          </span>
          <span>
            <span className="brand-name">{t.brand.name}</span>
            <span className="brand-sub">{t.brand.sub}</span>
          </span>
        </a>
        <nav className="nav">
          {NAV.map((key) => (
            <a key={key} href={`#${key}`}>
              {t.nav[key]}
            </a>
          ))}
        </nav>
        {/* ลิงก์จริงไปอีกภาษา — crawler เดินตามได้ ไม่ใช่การสลับด้วย JS */}
        <a
          className="lang"
          href={other.path}
          hrefLang={other.hreflang}
          lang={other.htmlLang}
          aria-label={t.langSwitch.toOtherAria}
          data-lang-switch={other.code}
        >
          <GlobeIcon />
          <span>{t.langSwitch.toOther}</span>
        </a>
        <a
          className="btn btn-gold btn-sm"
          href={site.contact.lineUrl}
          target="_blank"
          rel="noopener"
        >
          <LineIcon />
          {t.nav.contact}
        </a>
      </div>
    </header>
  );
}
