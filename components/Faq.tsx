import type { Dict } from '@/lib/i18n';
import { FaqTracking } from '@/components/FaqTracking';

export function Faq({ t }: { t: Dict }) {
  return (
    <section id="faq">
      <div className="wrap">
        <div className="sec-head rise">
          <span className="eyebrow">{t.faq.eyebrow}</span>
          <h2>{t.faq.h2}</h2>
        </div>
        {/* <details> เป็น HTML จริง จึงถูก crawl พร้อมคำตอบแม้ยังไม่ถูกกด */}
        <div className="faq rise">
          {t.faq.items.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <FaqTracking />
      </div>
    </section>
  );
}
