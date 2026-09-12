import type { Dict } from '@/lib/i18n';
import { ServiceIcon } from '@/components/ServiceIcons';

export function Services({ t }: { t: Dict }) {
  return (
    <section id="services">
      <div className="wrap">
        <div className="sec-head rise">
          <span className="eyebrow">{t.services.eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: t.services.h2 }} />
          <p>{t.services.lead}</p>
        </div>

        <div className="svc rise">
          {t.services.items.map((item, i) => (
            <article className="svc-item" key={item.title}>
              <div className="svc-top">
                <span className="svc-ico" aria-hidden="true">
                  <ServiceIcon index={i} />
                </span>
                <span className="svc-no">SVC / {String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="chips">
                {item.chips.map((chip) => (
                  <span className="chip" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
