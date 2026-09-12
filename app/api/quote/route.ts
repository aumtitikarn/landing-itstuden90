import { NextResponse } from 'next/server';
import { site } from '@/lib/site';
import { parseQuote } from '@/lib/quote';
import { quoteMessages } from '@/lib/line-message';

/**
 * รับข้อมูลจากฟอร์ม "ขอใบเสนอราคา" แล้วให้ LINE OA ส่งเข้ากลุ่มที่กำหนด
 *
 * environment variable ที่ต้องตั้ง:
 *   LINE_CHANNEL_ACCESS_TOKEN   long-lived channel access token ของ LINE OA
 *   LINE_GROUP_ID               groupId ของกลุ่มปลายทาง (ดูวิธีหาได้ที่ /api/line-webhook)
 *
 * token ถูกอ่านฝั่งเซิร์ฟเวอร์เท่านั้น ไม่เคยถูกส่งไปที่เบราว์เซอร์
 */
const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  /* กันการยิงข้ามโดเมน — ฟอร์มของเราส่งมาจาก origin เดียวกันเสมอ */
  const origin = request.headers.get('origin');
  if (origin && origin !== site.origin && !origin.startsWith('http://localhost')) {
    return NextResponse.json({ ok: false, error: 'origin_not_allowed' }, { status: 403 });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const groupId = process.env.LINE_GROUP_ID;
  if (!token || !groupId) {
    console.error('quote: ยังไม่ได้ตั้ง LINE_CHANNEL_ACCESS_TOKEN หรือ LINE_GROUP_ID');
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const { data, errors, trapped } = parseQuote(body);

  /* ตอบ ok ให้บอทที่ติดกับดัก เพื่อไม่ให้รู้ว่าถูกบล็อก */
  if (trapped) return NextResponse.json({ ok: true });

  if (errors.length) {
    return NextResponse.json(
      { ok: false, error: 'validation_failed', fields: errors },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(LINE_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: quoteMessages(data),
      }),
    });

    if (!res.ok) {
      console.error('LINE push ไม่สำเร็จ', res.status, await res.text());
      return NextResponse.json({ ok: false, error: 'line_push_failed' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('LINE push error', error);
    return NextResponse.json({ ok: false, error: 'line_push_failed' }, { status: 502 });
  }
}
