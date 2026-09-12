import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* ไทยอยู่ที่ / และอังกฤษที่ /en/ — ให้ URL ลงท้ายด้วย / ทุกหน้าเพื่อให้ตรงกับ
     canonical และ sitemap โดยไม่ต้อง redirect */
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
