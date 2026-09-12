import type { Dict } from '@/lib/i18n';

export function Reviews({ t }: { t: Dict }) {
  const featured = t.reviews.featured;

  return (
    <section id="reviews">
      <div className="wrap">
        <div className="sec-head rise">
          <span className="eyebrow">{t.reviews.eyebrow}</span>
          <h2>{t.reviews.h2}</h2>
          <p>{t.reviews.lead}</p>
        </div>

        <article className="rev-lead rise">
          <span className="qmark" aria-hidden="true">
            &ldquo;
          </span>
          <div className="rev-lead-body">
            <div className="stars" aria-label={t.reviews.starsAria}>
              ★★★★★
            </div>
            {featured.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            <div className="rev-by">
              <span className="av">{featured.initial}</span>
              <div>
                <b>{featured.author}</b>
                <span>{featured.date}</span>
              </div>
            </div>
          </div>

          <div className="rev-side">
            {featured.pulls.map((pull) => (
              <div className="pull" key={pull.label}>
                <span>{pull.label}</span>
                <b>{pull.value}</b>
                <em>{pull.note}</em>
              </div>
            ))}
          </div>
        </article>

        <div className="reviews rise">
          {t.reviews.items.map((review) => (
            <article className="rev" key={review.author}>
              <div className="stars" aria-label={t.reviews.starsAria}>
                ★★★★★
              </div>
              <q>{review.quote}</q>
              <div className="rev-by">
                <span className="av">{review.initial}</span>
                <div>
                  <b>{review.author}</b>
                  <span>{review.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="rev-note rise">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5.5M12 7.6v.01" />
          </svg>
          {t.reviews.note}
        </p>
      </div>
    </section>
  );
}
