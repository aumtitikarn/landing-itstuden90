import type { Dict } from '@/lib/i18n';
import { Showcase } from '@/components/Showcase';

export function Hero({ t }: { t: Dict }) {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <span className="tag">
              <span className="dot" /> {t.hero.badge}
            </span>
            <h1 dangerouslySetInnerHTML={{ __html: t.hero.h1 }} />
            <p className="hero-lead" dangerouslySetInnerHTML={{ __html: t.hero.lead }} />
            <div className="hero-cta">
              <a className="btn btn-gold" href="#contact">
                {t.hero.ctaPrimary}
              </a>
              <a className="btn btn-ghost" href="#works">
                {t.hero.ctaSecondary}
              </a>
            </div>
            <div className="facts">
              {t.hero.facts.map((fact) => (
                <div className="fact" key={fact.label}>
                  <b>{fact.value}</b>
                  <span>{fact.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Showcase
              items={t.showcase.items}
              kicker={t.showcase.kicker}
              itemAria={t.showcase.itemAria}
              laptopAlt={t.hero.laptopAlt}
            />
            <p className="caption">{t.hero.caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
