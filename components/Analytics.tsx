'use client';

import { useEffect } from 'react';
import { track, whereOnPage } from '@/lib/track';

/** ดักคลิกทั้งหน้าเพียงจุดเดียว แล้วแยกประเภทจาก href / class */
export function Analytics() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href') ?? '';
      const langSwitch = anchor.getAttribute('data-lang-switch');

      if (langSwitch) {
        track('language_switch', { to: langSwitch });
        return;
      }
      if (href.includes('line.me')) {
        track('contact_click', { method: 'line', location: whereOnPage(anchor) });
        return;
      }
      if (href.startsWith('tel:')) {
        track('contact_click', { method: 'phone', location: whereOnPage(anchor) });
        return;
      }
      if (href.startsWith('mailto:')) {
        track('contact_click', { method: 'email', location: whereOnPage(anchor) });
        return;
      }
      if (anchor.classList.contains('work')) {
        track('portfolio_click', { item_name: anchor.getAttribute('data-work') ?? 'unknown' });
        return;
      }
      if (href === '#contact') {
        track('cta_click', { cta: 'consult', location: whereOnPage(anchor) });
        return;
      }
      if (href === '#works') {
        track('cta_click', { cta: 'view_works', location: whereOnPage(anchor) });
      }
    }

    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
