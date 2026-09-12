import type { QuoteData } from '@/lib/quote';

/**
 * Flex Message ที่ส่งเข้ากลุ่ม LINE เมื่อมีคำขอใบเสนอราคาใหม่
 * ใช้โทนสีเดียวกับเว็บไซต์ (กระดาษ/ทอง/หมึก) เพื่อให้จำได้ทันทีว่ามาจากหน้า landing
 *
 * อยากดูหน้าตาก่อน: คัดลอก JSON ที่ฟังก์ชันนี้คืนมาไปวางใน
 * https://developers.line.biz/flex-simulator/
 */

const COLOR = {
  ink: '#14110C',
  inkSoft: '#4A4234',
  inkFaint: '#7B7160',
  paper: '#FBF7EE',
  rule: '#E9E0CB',
  gold: '#F0B429',
  goldDeep: '#9C6D0C',
  panelHead: '#FFF9EA',
} as const;

/** ข้อความใน text component หนึ่งตัวยาวได้ไม่เกิน 2000 ตัวอักษร */
const DETAILS_PREVIEW = 1200;

type Component = Record<string, unknown>;
export type LineMessage = Record<string, unknown>;

function row(label: string, value: string): Component {
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      { type: 'text', text: label, size: 'xs', color: COLOR.inkFaint, flex: 3 },
      {
        type: 'text',
        text: value || '-',
        size: 'sm',
        color: COLOR.ink,
        weight: 'bold',
        flex: 7,
        wrap: true,
      },
    ],
  };
}

function separator(): Component {
  return { type: 'separator', color: COLOR.rule };
}

function stamp(): string {
  return new Date().toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** label ของ action ยาวได้ไม่เกิน 20 ตัวอักษร ถ้าเกิน LINE จะตอบ 400 */
function label(text: string): string {
  return text.length > 20 ? text.slice(0, 19) + '…' : text;
}

/** ปุ่มล่าง — LINE ยอมรับ uri เฉพาะ http, https, line และ tel */
function footerButtons(data: QuoteData): Component[] {
  const buttons: Component[] = [];
  const digits = data.phone.replace(/[^\d+]/g, '');

  if (digits.length >= 9) {
    buttons.push({
      type: 'button',
      style: 'primary',
      color: COLOR.ink,
      height: 'sm',
      action: { type: 'uri', label: label('โทรกลับลูกค้า'), uri: `tel:${digits}` },
    });
  }
  if (/^https?:\/\//.test(data.page)) {
    buttons.push({
      type: 'button',
      style: 'link',
      height: 'sm',
      action: { type: 'uri', label: label('เปิดหน้าที่ส่งมา'), uri: data.page },
    });
  }
  return buttons;
}

function bubble(data: QuoteData): Component {
  const details =
    data.details.length > DETAILS_PREVIEW
      ? data.details.slice(0, DETAILS_PREVIEW).trimEnd() + '…'
      : data.details;

  const buttons = footerButtons(data);

  return {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: COLOR.ink,
      paddingAll: '18px',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: 'คำขอใบเสนอราคาใหม่',
          size: 'xxs',
          weight: 'bold',
          color: COLOR.gold,
        },
        {
          type: 'text',
          text: data.service,
          size: 'lg',
          weight: 'bold',
          color: COLOR.panelHead,
          wrap: true,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: COLOR.paper,
      paddingAll: '18px',
      spacing: 'md',
      contents: [
        row('ผู้ติดต่อ', data.name),
        row('บริษัท/ร้าน', data.company),
        row('โทร', data.phone),
        row('อีเมล', data.email),
        separator(),
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          contents: [
            {
              type: 'text',
              text: 'รายละเอียดงาน',
              size: 'xxs',
              weight: 'bold',
              color: COLOR.goldDeep,
            },
            { type: 'text', text: details, size: 'sm', color: COLOR.inkSoft, wrap: true },
          ],
        },
        separator(),
        {
          type: 'text',
          text: `ส่งจากหน้า ${data.language || '-'} · ${stamp()}`,
          size: 'xxs',
          color: COLOR.inkFaint,
          wrap: true,
        },
      ],
    },
    ...(buttons.length
      ? {
          footer: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: COLOR.paper,
            paddingAll: '12px',
            spacing: 'sm',
            contents: buttons,
          },
        }
      : {}),
    styles: {
      header: { separator: false },
      footer: { separator: true, separatorColor: COLOR.rule },
    },
  };
}

/** ข้อความสำรองที่แสดงในรายการแชทและการแจ้งเตือน */
function altText(data: QuoteData): string {
  return `ขอใบเสนอราคา: ${data.service} — ${data.name} ${data.phone}`.slice(0, 400);
}

/**
 * คืนรายการข้อความที่จะ push เข้ากลุ่ม
 * ถ้ารายละเอียดยาวเกินที่ Flex แสดงได้ จะต่อข้อความเต็มเป็นอีกฉบับ ไม่ให้ข้อมูลหาย
 */
export function quoteMessages(data: QuoteData): LineMessage[] {
  const messages: LineMessage[] = [
    { type: 'flex', altText: altText(data), contents: bubble(data) },
  ];

  if (data.details.length > DETAILS_PREVIEW) {
    messages.push({
      type: 'text',
      text: `รายละเอียดเต็มจาก ${data.name}:\n\n${data.details}`.slice(0, 4900),
    });
  }
  return messages;
}
