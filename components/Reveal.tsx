'use client';

import { useEffect } from 'react';

/** ค่อย ๆ เผยเนื้อหาเมื่อเลื่อนถึง — เนื้อหาอยู่ใน HTML ตั้งแต่แรก ไม่กระทบการ crawl */
export function Reveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.rise'));

    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => {
        el.style.animation = 'none';
      });
      return;
    }

    els.forEach((el) => {
      el.style.animationPlayState = 'paused';
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.animationPlayState = 'running';
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
