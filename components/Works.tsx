import { site } from '@/lib/site';
import type { Dict } from '@/lib/i18n';
import { ArrowOutIcon } from '@/components/Icons';

export function Works({ t }: { t: Dict }) {
  return (
    <section id="works">
      <div className="wrap">
        <div className="sec-head rise">
          <span className="eyebrow">{t.works.eyebrow}</span>
          <h2>{t.works.h2}</h2>
          <p>{t.works.lead}</p>
        </div>

        <div className="works">
          {t.works.items.map((work, i) => (
            <a
              className="work rise"
              href={site.works[i].url}
              target="_blank"
              rel="noopener"
              key={work.name}
              data-work={work.name}
            >
              <span className="glyph">{work.glyph}</span>
              <div>
                <h3>
                  {work.name} <em>{work.tagline}</em>
                </h3>
                <p>{work.desc}</p>
                <div className="spec">
                  {work.chips.map((chip) => (
                    <span className="chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <span className="go" aria-hidden="true">
                <ArrowOutIcon />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
