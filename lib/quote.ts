/** ตรวจและทำความสะอาดข้อมูลจากฟอร์มขอใบเสนอราคา ใช้ร่วมกันในฝั่งเซิร์ฟเวอร์ */

const LIMITS = {
  service: 120,
  name: 120,
  company: 160,
  phone: 40,
  email: 160,
  lineId: 80,
  details: 4000,
  language: 8,
  page: 300,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* อักขระควบคุมทั้งหมด และแบบที่ยอมให้ขึ้นบรรทัดใหม่ผ่านได้ */
const CONTROL = new RegExp('[\\u0000-\\u001F\\u007F]', 'g');
const CONTROL_KEEP_NEWLINE = new RegExp('[\\u0000-\\u0009\\u000B-\\u001F\\u007F]', 'g');

/** ตัดอักขระควบคุมออก กันการปลอมบรรทัดในข้อความที่ส่งเข้ากลุ่ม LINE */
function clean(value: unknown, max: number): string {
  return String(value ?? '')
    .replace(CONTROL, ' ')
    .trim()
    .slice(0, max);
}

function cleanMultiline(value: unknown, max: number): string {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_KEEP_NEWLINE, ' ')
    .trim()
    .slice(0, max);
}

export type QuoteData = {
  service: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  lineId: string;
  details: string;
  language: string;
  page: string;
};

export function parseQuote(body: Record<string, unknown>): {
  data: QuoteData;
  errors: string[];
  trapped: boolean;
} {
  const data: QuoteData = {
    service: clean(body.service, LIMITS.service),
    name: clean(body.name, LIMITS.name),
    company: clean(body.company, LIMITS.company),
    phone: clean(body.phone, LIMITS.phone),
    email: clean(body.email, LIMITS.email),
    lineId: clean(body.lineId, LIMITS.lineId),
    details: cleanMultiline(body.details, LIMITS.details),
    language: clean(body.language, LIMITS.language),
    page: clean(body.page, LIMITS.page),
  };

  const errors: string[] = [];
  if (!data.service) errors.push('service');
  if (data.name.length < 2) errors.push('name');
  if (data.phone.replace(/\D/g, '').length < 9) errors.push('phone');
  if (!EMAIL_RE.test(data.email)) errors.push('email');
  if (data.details.length < 10) errors.push('details');

  return { data, errors, trapped: clean(body._gotcha, 10).length > 0 };
}
