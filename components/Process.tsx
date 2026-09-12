import type { Dict } from '@/lib/i18n';

export function Process({ t }: { t: Dict }) {
  return (
    <section id="process">
      <div className="wrap">
        <div className="sec-head rise">
          <span className="eyebrow">{t.process.eyebrow}</span>
          <h2>{t.process.h2}</h2>
          <p>{t.process.lead}</p>
        </div>
        <div className="steps rise">
          {t.process.steps.map((step, i) => (
            <div className="step" key={step.title}>
              <div className="step-n">{i + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <em>{step.meta}</em>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
