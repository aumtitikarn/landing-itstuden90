'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';
import type { Dict } from '@/lib/i18n';
import { track } from '@/lib/track';

type Quote = Dict['quote'];
type Fields = {
  service: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  details: string;
  _gotcha: string;
};

const EMPTY: Fields = {
  service: '',
  name: '',
  company: '',
  phone: '',
  email: '',
  details: '',
  _gotcha: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** trailing slash ตรงกับ trailingSlash: true จึงไม่โดน 308 redirect ตอน POST */
const ENDPOINT = '/api/quote/';

function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (m, key) => vars[key] ?? m);
}

export function QuoteDialog({
  t,
  quoteLabel,
  open,
  onClose,
}: {
  t: Quote;
  quoteLabel: string;
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [summaryError, setSummaryError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [doneMessage, setDoneMessage] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setValues(EMPTY);
      setErrors({});
      setSummaryError('');
      setStatus('idle');
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      dialog.removeAttribute('open');
      document.body.style.overflow = '';
    }
  }, [open]);

  useEffect(() => () => {
    document.body.style.overflow = '';
  }, []);

  function set<K extends keyof Fields>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(data: Fields) {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!data.service) next.service = t.errRequired;
    if (data.name.trim().length < 2) next.name = t.errRequired;
    if (data.phone.replace(/\D/g, '').length < 9) next.phone = t.errPhone;
    if (!EMAIL_RE.test(data.email.trim())) {
      next.email = data.email.trim() ? t.errEmail : t.errRequired;
    }
    if (data.details.trim().length < 10) next.details = t.errRequired;
    return next;
  }

  function summaryText(data: Fields) {
    return [
      `${t.fieldService}: ${data.service || '-'}`,
      `${t.fieldName}: ${data.name || '-'}`,
      `${t.fieldCompany}: ${data.company || '-'}`,
      `${t.fieldPhone}: ${data.phone || '-'}`,
      `${t.fieldEmail}: ${data.email || '-'}`,
      '',
      `${t.fieldDetails}:`,
      data.details || '-',
      '',
      `${t.fieldPage}: ${window.location.href}`,
    ].join('\n');
  }

  function mailtoFor(data: Fields) {
    const subject = fill(t.mailSubject, { service: data.service });
    return (
      `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(summaryText(data))}`
    );
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* คลิปบอร์ดถูกปิด — ข้อมูลยังอยู่ในฟอร์มให้ลูกค้าคัดลอกเองได้ */
    }
  }

  function finish(message: string) {
    setStatus('done');
    setDoneMessage(message);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      setSummaryError(t.errSummary);
      const firstKey = Object.keys(found)[0];
      document.getElementById(`qf-${firstKey}`)?.focus();
      return;
    }
    setErrors({});
    setSummaryError('');
    setStatus('sending');

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...values,
          language: document.documentElement.lang,
          page: window.location.href,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      finish(t.successPostBody);
      track('quote_submit', { service: values.service, method: 'line_group' });
    } catch {
      /* ส่งเข้ากลุ่ม LINE ไม่ได้ — ถอยไปใช้อีเมลเพื่อไม่ให้ลูกค้าเสียข้อมูลที่กรอก */
      window.location.href = mailtoFor(values);
      finish(t.successMailBody);
      track('quote_submit', { service: values.service, method: 'email_fallback' });
    }
  }

  async function onLineClick() {
    if (!values.service && !values.details && !values.name) return;
    await copy(summaryText(values));
    finish(t.successLineBody);
    track('quote_submit', { service: values.service || 'unspecified', method: 'line_chat' });
  }

  const field = (key: keyof Fields) => ({
    id: `qf-${key}`,
    value: values[key],
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `qf-${key}-err` : undefined,
  });

  return (
    <dialog
      className="qm"
      id="quoteModal"
      ref={dialogRef}
      aria-labelledby="qmTitle"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      {status === 'done' ? (
        <div className="qm-card qm-done">
          <span className="qm-tick" aria-hidden="true">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.6l4.6 4.6L19 7.2" />
            </svg>
          </span>
          <h2>{t.successTitle}</h2>
          <p>{doneMessage}</p>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            {t.successClose}
          </button>
        </div>
      ) : (
        <form className="qm-card" onSubmit={onSubmit} noValidate>
          <button className="qm-x" type="button" aria-label={t.closeAria} onClick={onClose}>
            <svg
              width="18"
              height="18"
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

          <div className="qm-head">
            <span className="eyebrow">{quoteLabel}</span>
            <h2 id="qmTitle">{t.title}</h2>
            <p>{t.lead}</p>
          </div>

          <div className="qm-body">
            {summaryError && (
              <p className="qm-alert" role="alert">
                {summaryError}
              </p>
            )}

            <div className="qf-row">
              <label className="qf" htmlFor="qf-service">
                <span className="qf-label">{t.serviceLabel}</span>
                <select
                  {...field('service')}
                  name="service"
                  onChange={(e) => set('service', e.target.value)}
                >
                  <option value="">{t.servicePlaceholder}</option>
                  {t.serviceOptions.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.service && (
                  <span className="qf-err" id="qf-service-err">
                    {errors.service}
                  </span>
                )}
              </label>
            </div>

            <div className="qf-row qf-2">
              <label className={errors.name ? 'qf is-err' : 'qf'} htmlFor="qf-name">
                <span className="qf-label">{t.nameLabel}</span>
                <input
                  {...field('name')}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder={t.namePlaceholder}
                  onChange={(e) => set('name', e.target.value)}
                />
                {errors.name && (
                  <span className="qf-err" id="qf-name-err">
                    {errors.name}
                  </span>
                )}
              </label>
              <label className="qf" htmlFor="qf-company">
                <span className="qf-label">
                  {t.companyLabel} <i>({t.optional})</i>
                </span>
                <input
                  {...field('company')}
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder={t.companyPlaceholder}
                  onChange={(e) => set('company', e.target.value)}
                />
              </label>
            </div>

            <div className="qf-row qf-2">
              <label className={errors.phone ? 'qf is-err' : 'qf'} htmlFor="qf-phone">
                <span className="qf-label">{t.phoneLabel}</span>
                <input
                  {...field('phone')}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t.phonePlaceholder}
                  onChange={(e) => set('phone', e.target.value)}
                />
                {errors.phone && (
                  <span className="qf-err" id="qf-phone-err">
                    {errors.phone}
                  </span>
                )}
              </label>
              <label className={errors.email ? 'qf is-err' : 'qf'} htmlFor="qf-email">
                <span className="qf-label">{t.emailLabel}</span>
                <input
                  {...field('email')}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t.emailPlaceholder}
                  onChange={(e) => set('email', e.target.value)}
                />
                {errors.email && (
                  <span className="qf-err" id="qf-email-err">
                    {errors.email}
                  </span>
                )}
              </label>
            </div>

            <div className="qf-row">
              <label className={errors.details ? 'qf is-err' : 'qf'} htmlFor="qf-details">
                <span className="qf-label">{t.detailsLabel}</span>
                <textarea
                  {...field('details')}
                  name="details"
                  rows={4}
                  placeholder={t.detailsPlaceholder}
                  onChange={(e) => set('details', e.target.value)}
                />
                {errors.details && (
                  <span className="qf-err" id="qf-details-err">
                    {errors.details}
                  </span>
                )}
              </label>
            </div>

            {/* กับดักบอท — คนไม่เห็นและ tab ไม่ถึง ถ้ามีค่าเข้ามาแปลว่าไม่ใช่คน */}
            <div className="qf-trap" aria-hidden="true">
              <label htmlFor="qf-_gotcha">Leave this empty</label>
              <input
                id="qf-_gotcha"
                name="_gotcha"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values._gotcha}
                onChange={(e) => set('_gotcha', e.target.value)}
              />
            </div>
          </div>

          <div className="qm-foot">
            <button className="btn btn-gold" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? t.submitting : t.submit}
            </button>
            <a
              className="btn btn-ghost btn-sm"
              href={site.contact.lineUrl}
              target="_blank"
              rel="noopener"
              onClick={onLineClick}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.5 2 2 5.7 2 10.2c0 4 3.6 7.4 8.4 8.05.33.07.78.22.9.5.1.26.07.66.03.92l-.14.87c-.05.26-.2 1.02.9.55 1.1-.46 5.9-3.47 8.05-5.95C21.6 13.5 22 11.9 22 10.2 22 5.7 17.5 2 12 2z" />
              </svg>
              {t.lineAlt}
            </a>
            <p className="qm-privacy">{t.privacy}</p>
          </div>
        </form>
      )}
    </dialog>
  );
}
