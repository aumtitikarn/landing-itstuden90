'use client';

/** แถบเลื่อนคำสำคัญ — ซ้ำสองชุดให้เลื่อนต่อเนื่องไม่มีรอยต่อ */
export function Ticker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" id="tick">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
