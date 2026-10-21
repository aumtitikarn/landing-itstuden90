'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

/* three.js หนักราว 250 kB — โหลดแยกหลังหน้าเว็บขึ้นแล้ว ไม่ให้ถ่วงตัวหนังสือใน hero
   ระหว่างโหลด .machine จองพื้นที่ไว้ด้วย aspect-ratio หน้าจึงไม่กระโดด */
const RetroComputer = dynamic(() => import('@/components/RetroComputer').then((m) => m.RetroComputer), {
  ssr: false,
});

type Item = { name: string; desc: string };

const pad2 = (n: number) => String(n).padStart(2, '0');

function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (m, key) => vars[key] ?? m);
}

export function Showcase({
  items,
  kicker,
  itemAria,
  machineAlt,
}: {
  items: Item[];
  kicker: string;
  itemAria: string;
  machineAlt: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  /* จอพิมพ์-ลบผลงานครบรอบแล้วค่อยไปชิ้นถัดไป (ถ้าลดการเคลื่อนไหวไว้ จะไม่เลื่อนเอง) */
  const next = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length]);

  const current = items[index];
  const label = fill(kicker, { n: pad2(index + 1), total: pad2(items.length) });

  return (
    <>
      <div
        className="machine"
        role="img"
        aria-label={machineAlt}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <RetroComputer
          kicker={label}
          name={current.name}
          desc={current.desc}
          paused={paused}
          reduce={reduce}
          onDone={next}
        />
      </div>
      {/* ข้อความบนจออยู่ใน canvas — ให้ screen reader และ search engine อ่านจากตรงนี้ */}
      <p className="vh" aria-live="polite">
        {label} — {current.name}: {current.desc}
      </p>
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
