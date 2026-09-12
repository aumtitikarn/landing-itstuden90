'use client';

import { useEffect, useRef, useState } from 'react';

type Item = { name: string; desc: string };

const INTERVAL = 4200;
const pad2 = (n: number) => String(n).padStart(2, '0');

function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (m, key) => vars[key] ?? m);
}

export function Showcase({
  items,
  kicker,
  itemAria,
  laptopAlt,
}: {
  items: Item[];
  kicker: string;
  itemAria: string;
  laptopAlt: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, items.length]);

  /* เล่นอนิเมชันซ้ำทุกครั้งที่เปลี่ยนผลงาน */
  useEffect(() => {
    if (reduce || !screenRef.current) return;
    const targets = screenRef.current.querySelectorAll<HTMLElement>('.s-anim-target');
    targets.forEach((el) => {
      el.classList.remove('s-anim');
      void el.offsetWidth;
      el.classList.add('s-anim');
    });
  }, [index, reduce]);

  const current = items[index];

  return (
    <>
      <div className="machine" id="machine">
        <svg viewBox="0 0 400 300" role="img" aria-label={laptopAlt}>
          <rect x="52" y="22" width="296" height="196" rx="12" fill="#14110C" />
          <rect
            x="52"
            y="22"
            width="296"
            height="196"
            rx="12"
            fill="none"
            stroke="#F0B429"
            strokeWidth="5"
          />
          <rect x="62" y="32" width="276" height="176" rx="6" fill="#14110C" />
          <path d="M24 246l26-24h300l26 24H24z" fill="#F0B429" />
          <rect x="24" y="246" width="352" height="13" rx="6.5" fill="#F0B429" />
          <rect x="70" y="228" width="46" height="5" rx="2.5" fill="#14110C" opacity=".55" />
          <rect x="124" y="228" width="46" height="5" rx="2.5" fill="#14110C" opacity=".55" />
          <rect x="178" y="228" width="44" height="5" rx="2.5" fill="#14110C" opacity=".55" />
          <rect x="230" y="228" width="46" height="5" rx="2.5" fill="#14110C" opacity=".55" />
          <rect x="284" y="228" width="46" height="5" rx="2.5" fill="#14110C" opacity=".55" />
          <rect x="168" y="250" width="64" height="5" rx="2.5" fill="#14110C" opacity=".35" />
        </svg>
        <div
          className="screen"
          id="screen"
          aria-live="polite"
          ref={screenRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="s-kicker s-anim-target">
            {fill(kicker, { n: pad2(index + 1), total: pad2(items.length) })}
          </div>
          <div className="s-name s-anim-target">{current.name}</div>
          <div className="s-desc s-anim-target">{current.desc}</div>
        </div>
      </div>
      <div className="s-bars" id="sBars" style={{ maxWidth: 520, margin: '14px auto 0' }}>
        {items.map((item, i) => (
          <i
            key={item.name}
            role="button"
            tabIndex={0}
            aria-label={fill(itemAria, { name: item.name })}
            data-on={i === index ? '1' : '0'}
            onClick={() => setIndex(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIndex(i);
              }
            }}
          />
        ))}
      </div>
    </>
  );
}
