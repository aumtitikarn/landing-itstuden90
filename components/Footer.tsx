import { site } from '@/lib/site';
import type { Dict } from '@/lib/i18n';

export function Footer({ t }: { t: Dict }) {
  return (
    <footer>
      <div className="wrap fbar">
        <span>{t.footer.copyright}</span>
        <span className="hits">
          {t.footer.hitsBefore}
          {/* badge ภายนอก ขนาดคงที่ ไม่ต้องผ่าน next/image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.hitsBadge}
            alt={t.footer.hitsAlt}
            height={20}
            loading="lazy"
            decoding="async"
          />
          {t.footer.hitsAfter}
        </span>
        <span>
          <a href={site.contact.phoneHref}>{site.contact.phone}</a> ·{' '}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> ·{' '}
          <a href={site.contact.lineUrl} target="_blank" rel="noopener">
            {site.contact.lineId}
          </a>
        </span>
      </div>
    </footer>
  );
}
