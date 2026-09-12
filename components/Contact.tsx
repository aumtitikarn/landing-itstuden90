import { site } from '@/lib/site';
import type { Dict } from '@/lib/i18n';
import { LineIcon, MailIcon, PhoneIcon } from '@/components/Icons';

export function Contact({ t }: { t: Dict }) {
  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">{t.contact.eyebrow}</span>
          <h2>{t.contact.h2}</h2>
          <p>{t.contact.lead}</p>
        </div>
        <div className="cgrid">
          <a className="ccard" href={site.contact.lineUrl} target="_blank" rel="noopener">
            <span className="ci">
              <LineIcon size={20} />
            </span>
            <span>
              <span>{t.contact.lineLabel}</span>
              <b>{site.contact.lineId}</b>
            </span>
          </a>
          <a className="ccard" href={site.contact.phoneHref}>
            <span className="ci">
              <PhoneIcon />
            </span>
            <span>
              <span>{t.contact.phoneLabel}</span>
              <b>{site.contact.phone}</b>
            </span>
          </a>
          <a className="ccard" href={`mailto:${site.contact.email}`}>
            <span className="ci">
              <MailIcon />
            </span>
            <span>
              <span>{t.contact.emailLabel}</span>
              <b>{site.contact.email}</b>
            </span>
          </a>
        </div>
        <div className="hours">
          {t.contact.hours.map((hour) => (
            <span key={hour}>
              <i>●</i> {hour}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
