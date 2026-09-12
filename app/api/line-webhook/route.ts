import { createHmac, timingSafeEqual } from 'node:crypto';
import { setupMessage } from '@/lib/line-setup';

/**
 * Webhook ของ LINE OA — ใช้หา groupId ของกลุ่มที่จะให้บอทส่งคำขอใบเสนอราคาเข้าไป
 *
 * environment variable ที่ต้องตั้ง:
 *   LINE_CHANNEL_SECRET         channel secret ของ LINE OA (ใช้ตรวจลายเซ็น)
 *   LINE_CHANNEL_ACCESS_TOKEN   channel access token (ใช้ตอบกลับในแชท)
 *
 * วิธีใช้
 *   1. ใส่ URL นี้ (https://<โดเมน>/api/line-webhook/) ใน LINE Developers Console
 *      ที่ Messaging API -> Webhook URL แล้วเปิด "Use webhook"
 *   2. เชิญ LINE OA เข้ากลุ่ม — บอทจะทักบอก groupId ทันทีที่เข้ากลุ่ม
 *      หรือพิมพ์ "groupid" ในกลุ่มเมื่อไรก็ได้
 *   3. นำค่าที่ได้ไปตั้งเป็น LINE_GROUP_ID
 */
const REPLY_URL = 'https://api.line.me/v2/bot/message/reply';
const TRIGGERS = ['groupid', 'group id', 'ไอดีกลุ่ม'];

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LineSource = { type?: string; groupId?: string; roomId?: string; userId?: string };
type LineEvent = {
  type?: string;
  replyToken?: string;
  source?: LineSource;
  message?: { type?: string; text?: string };
};

function validSignature(secret: string, rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac('SHA256', secret).update(rawBody).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sourceId(source?: LineSource) {
  if (!source) return null;
  if (source.type === 'group' && source.groupId) return { kind: 'groupId', id: source.groupId };
  if (source.type === 'room' && source.roomId) return { kind: 'roomId', id: source.roomId };
  if (source.userId) return { kind: 'userId', id: source.userId };
  return null;
}

async function reply(token: string, replyToken: string, text: string) {
  const res = await fetch(REPLY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
  });
  if (!res.ok) console.error('LINE reply ไม่สำเร็จ', res.status, await res.text());
}

export async function POST(request: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!secret || !token) {
    console.error('webhook: ยังไม่ได้ตั้ง LINE_CHANNEL_SECRET หรือ LINE_CHANNEL_ACCESS_TOKEN');
    return new Response('not configured', { status: 500 });
  }

  /* ต้องใช้ body ดิบตรงไบต์ต่อไบต์ในการตรวจลายเซ็น */
  const rawBody = await request.text();
  if (!validSignature(secret, rawBody, request.headers.get('x-line-signature'))) {
    return new Response('bad signature', { status: 401 });
  }

  let payload: { events?: LineEvent[] };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('bad json', { status: 400 });
  }

  for (const event of payload.events ?? []) {
    const target = sourceId(event.source);
    if (!target || !event.replyToken) continue;

    const askedForId =
      event.type === 'message' &&
      event.message?.type === 'text' &&
      TRIGGERS.includes(String(event.message.text).trim().toLowerCase());

    if (event.type === 'join' || askedForId) {
      await reply(token, event.replyToken, setupMessage(target));
    }
  }

  /* ต้องตอบ 200 เสมอ ไม่งั้น LINE จะ retry และอาจปิด webhook ให้เอง */
  return new Response('ok', { status: 200 });
}
