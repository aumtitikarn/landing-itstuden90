'use client';

import { useEffect, useState } from 'react';
import { site } from '@/lib/site';
import type { Dict } from '@/lib/i18n';
import { track } from '@/lib/track';
import { LineIcon, MailIcon, PhoneIcon } from '@/components/Icons';
import { QuoteDialog } from '@/components/QuoteDialog';

const STORE = 'itss.dock';

export function ContactDock({ t }: { t: Dict }) {
  /* เริ่มที่ปิดไว้ เพื่อให้ผลลัพธ์ฝั่ง server กับ client ตรงกันตอน hydrate
     แล้วค่อยเปิดใน useEffect ตามขนาดจอและค่าที่ผู้ใช้เลือกไว้ */
  const [open, setOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORE);
    } catch {
      /* โหมดส่วนตัวหรือปิดการเก็บข้อมูล — ใช้ค่าตามขนาดจอ */
    }
    setOpen(stored === null ? window.matchMedia('(min-width: 720px)').matches : stored === '1');
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(STORE, next ? '1' : '0');
    } catch {
      /* เก็บค่าไม่ได้ก็ไม่เป็นไร */
    }
  }

  return (
    <>
      <aside className="dock" id="dock" data-open={open ? '1' : '0'} aria-label={t.dock.aria}>
        <button
          className="dock-toggle"
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="dockList"
          aria-label={open ? t.dock.closeAria : t.dock.openAria}
        >
          <svg
            className="dock-toggle-open"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.55L3.5 20.5l.95-4.6A8.5 8.5 0 1 1 20.5 12z" />
          </svg>
          <svg
            className="dock-toggle-close"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
          </svg>
        </button>

        <ul className="dock-list" id="dockList">
          <li>
            <a
              className="dock-item dock-line"
              href={site.contact.lineUrl}
              target="_blank"
              rel="noopener"
            >
              <span className="dock-label">{t.dock.line}</span>
              <span className="dock-ico" aria-hidden="true">
                <LineIcon size={21} />
              </span>
            </a>
          </li>
          <li>
            <a className="dock-item dock-call" href={site.contact.phoneHref}>
              <span className="dock-label">{t.dock.call}</span>
              <span className="dock-ico" aria-hidden="true">
                <PhoneIcon />
              </span>
            </a>
          </li>
          <li>
            <a className="dock-item dock-mail" href={`mailto:${site.contact.email}`}>
              <span className="dock-label">{t.dock.email}</span>
              <span className="dock-ico" aria-hidden="true">
                <MailIcon />
              </span>
            </a>
          </li>
          <li>
            <button
              className="dock-item dock-quote"
              type="button"
              onClick={() => {
                setQuoteOpen(true);
                track('quote_open', { location: 'dock' });
              }}
            >
              <span className="dock-label">{t.dock.quote}</span>
              <span className="dock-ico" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.2 2.8H6.4a1.9 1.9 0 0 0-1.9 1.9v14.6a1.9 1.9 0 0 0 1.9 1.9h11.2a1.9 1.9 0 0 0 1.9-1.9V8.1z" />
                  <path d="M14.2 2.8v5.3h5.3" />
                  <path d="M8.4 13h7.2M8.4 16.6h4.8" />
                </svg>
              </span>
            </button>
          </li>
        </ul>
      </aside>

      <QuoteDialog
        t={t.quote}
        quoteLabel={t.dock.quote}
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />
    </>
  );
}
