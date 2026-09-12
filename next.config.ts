import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* ไทยอยู่ที่ / และอังกฤษที่ /en/ — ให้ URL ลงท้ายด้วย / เพื่อให้ตรงกับ
     canonical และ sitemap โดยไม่ต้อง redirect */
  trailingSlash: true,

  /* ปิด redirect อัตโนมัติเรื่อง / ท้าย URL แล้วไปจัดการใน middleware.ts
     เพราะ webhook ของ LINE (และ service อื่นที่ POST เข้ามา) ไม่ตาม redirect
     ถ้ากรอก URL ขาด / ท้ายแล้วเจอ 308 event จะหายไปเงียบ ๆ
     middleware จึงเติม / ให้เฉพาะหน้าเว็บ และไม่แตะ /api/* */
  skipTrailingSlashRedirect: true,

  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
