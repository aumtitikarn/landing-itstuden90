import type { Dict } from '@/lib/i18n';

export function About({ t }: { t: Dict }) {
  return (
    <section id="about">
      <div className="wrap">
        <div className="sec-head rise">
          <span className="eyebrow">{t.about.eyebrow}</span>
          <h2>{t.about.h2}</h2>
          <p dangerouslySetInnerHTML={{ __html: t.about.lead }} />
        </div>

        <dl className="spec-sheet rise">
          {t.about.specs.map((spec) => (
            <div key={spec.dt}>
              <dt>{spec.dt}</dt>
              <dd dangerouslySetInnerHTML={{ __html: spec.dd }} />
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
