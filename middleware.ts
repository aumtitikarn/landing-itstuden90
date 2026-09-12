import { NextResponse, type NextRequest } from 'next/server';

/**
 * เติม / ท้าย URL ของหน้าเว็บให้เหลือ URL เดียวต่อหน้า (ดีต่อ SEO)
 * แต่ปล่อย /api/* ไว้ตามที่เรียกมา
 *
 * ทำที่นี่แทน redirects() ใน next.config เพราะ middleware เห็น pathname จริง
 * จึง redirect เฉพาะตอนที่ยังไม่มี / ท้าย ไม่เกิดการวนซ้ำกับตัวเอง
 *
 * เหตุผลที่ต้องยกเว้น /api/*: webhook ของ LINE ไม่ตาม redirect
 * ถ้ากรอก URL ขาด / ท้ายแล้วเจอ 308 event จะหายไปเงียบ ๆ
 */
export function middleware(request: NextRequest) {
  /* ต้องอ่านจาก request.url เพราะ nextUrl.pathname ถูกตัด / ท้ายออกแล้ว
     ตามค่า trailingSlash จึงใช้ตรวจว่า URL เดิมมี / หรือไม่ไม่ได้ */
  const requested = new URL(request.url);
  const path = requested.pathname;

  if (path.startsWith('/api/') || path === '/' || path.endsWith('/')) {
    return NextResponse.next();
  }

  requested.pathname = `${path}/`;
  return NextResponse.redirect(requested, 308);
}

export const config = {
  /* ข้ามไฟล์ static และไฟล์ที่มีนามสกุล (robots.txt, sitemap.xml, รูป) */
  matcher: ['/((?!_next/|.*\\.).*)'],
};
