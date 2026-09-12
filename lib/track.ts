/** ส่ง event ที่มีความหมายทางธุรกิจเข้า GA4 / GTM */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  const payload = {
    ...params,
    page_language: document.documentElement.lang || '',
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
}

/** ตำแหน่งบนหน้าที่ผู้ใช้กด ใช้ดูว่า CTA จุดไหนได้ผล */
export function whereOnPage(el: Element): string {
  if (el.closest('#dock')) return 'dock';
  if (el.closest('#quoteModal')) return 'quote_form';
  if (el.closest('footer')) return 'footer';
  if (el.closest('header')) return 'header';
  if (el.closest('#contact')) return 'contact';
  if (el.closest('.hero')) return 'hero';
  return 'page';
}
