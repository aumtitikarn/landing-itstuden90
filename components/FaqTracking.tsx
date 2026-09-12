'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

/** เปิดอ่านคำถามใน FAQ = สนใจเงื่อนไข */
export function FaqTracking() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLDetailsElement>('.faq details'));

    const handlers = items.map((item) => {
      const handler = () => {
        if (!item.open) return;
        track('faq_open', { question: item.querySelector('summary')?.textContent?.trim() ?? '' });
      };
      item.addEventListener('toggle', handler);
      return { item, handler };
    });

    return () => handlers.forEach(({ item, handler }) => item.removeEventListener('toggle', handler));
  }, []);

  return null;
}
