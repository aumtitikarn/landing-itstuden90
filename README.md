# landing-itstuden90

Landing page ของ **นักเรียนไอที (IT Student Service)** — ร้านรับทำโปรแกรม/ซอฟต์แวร์ทุกชนิด และรับปรึกษา Software Solution

สองภาษา ไทย/อังกฤษ บน Next.js (App Router) พร้อมฟอร์มขอใบเสนอราคาที่ส่งเข้ากลุ่ม LINE ผ่าน LINE OA

## โครงสร้าง

```
app/
  globals.css              CSS ทั้งหมดของเว็บ (โทนกระดาษ/ทอง + dark mode)
  (th)/                    ภาษาไทย -> /
    layout.tsx             root layout, <html lang="th">, metadata ไทย
    page.tsx
  (en)/                    ภาษาอังกฤษ -> /en/
    layout.tsx             root layout, <html lang="en">, metadata อังกฤษ
    en/page.tsx
  api/
    quote/route.ts         รับฟอร์มขอใบเสนอราคา -> push เข้ากลุ่ม LINE
    line-webhook/route.ts  webhook ของ LINE OA ใช้หา groupId
  sitemap.ts               sitemap.xml (มี hreflang ครบทุกภาษา)
  robots.ts                robots.txt (เปิดให้ search engine + AI crawler)

i18n/
  th.json  en.json         ข้อความทั้งหมดของเว็บ แยกตามภาษา

lib/
  i18n.ts                  รายการภาษา, getDictionary, path ของแต่ละภาษา
  site.ts                  ข้อมูลที่ไม่ขึ้นกับภาษา (ช่องทางติดต่อ, URL ผลงาน)
  metadata.ts              สร้าง metadata + canonical + hreflang ต่อภาษา
  schema.ts                สร้าง JSON-LD ต่อภาษา
  quote.ts                 ตรวจและทำความสะอาดข้อมูลจากฟอร์ม
  line-message.ts          Flex Message ที่ส่งเข้ากลุ่ม LINE
  track.ts                 ส่ง event เข้า GA4 / GTM

components/                ชิ้นส่วนของหน้า (ส่วนใหญ่เป็น Server Component)
public/
  og-image.png             รูปตอนแชร์ลิงก์ 1200x630
  llms.txt                 สรุปข้อมูลร้านสำหรับ AI / answer engine
```

## เริ่มงาน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000 (ไทย) และ http://localhost:3000/en/ (อังกฤษ)

คำสั่งอื่น

```bash
npm run build      # build production
npm run typecheck  # ตรวจ type ทั้งโปรเจกต์
```

## การแก้ข้อความ

ข้อความทุกคำอยู่ใน `i18n/th.json` และ `i18n/en.json` ไม่ต้องแก้ในโค้ด

`th.json` เป็นต้นแบบของโครงสร้าง ถ้า `en.json` มีคีย์ไม่ครบหรือเกิน `npm run typecheck` จะฟ้องทันที
จึงไม่มีทางที่ภาษาใดภาษาหนึ่งจะตกหล่นโดยไม่รู้ตัว

คีย์ที่เป็น HTML ได้ (ใส่ `<b>` `<span class="hl">` ได้) มีแค่ `hero.h1`, `hero.lead`,
`services.h2`, `about.lead` และ `about.specs[].dd` — ที่เหลือเป็นข้อความล้วน

## ฟอร์มขอใบเสนอราคา -> กลุ่ม LINE

ลูกค้ากรอกฟอร์มจากปุ่มลอยมุมขวาล่าง แล้ว LINE OA จะส่ง Flex Message เข้ากลุ่มที่กำหนด

### ตั้งค่า

1. สร้าง Messaging API channel ที่ [LINE Developers Console](https://developers.line.biz/console/)
2. คัดลอกค่าจาก channel ไปใส่เป็น environment variable (ดูรายการใน `.env.example`)

   | ตัวแปร | หาจากที่ไหน |
   | --- | --- |
   | `LINE_CHANNEL_SECRET` | Basic settings -> Channel secret |
   | `LINE_CHANNEL_ACCESS_TOKEN` | Messaging API -> Channel access token (long-lived) |
   | `LINE_GROUP_ID` | ได้จากขั้นตอนที่ 4 |

   ในเครื่องให้ใส่ไว้ที่ `.env.local` (ถูก gitignore แล้ว) บน Vercel ใส่ที่ Settings -> Environment Variables

3. ตั้ง **Webhook URL** เป็น `https://<โดเมน>/api/line-webhook/` แล้วเปิด *Use webhook*
   และปิด *Auto-reply messages* กับ *Greeting messages* ที่ LINE Official Account Manager
4. เชิญ LINE OA เข้ากลุ่มที่ต้องการ — บอทจะทักบอก `groupId` ให้ทันทีที่เข้ากลุ่ม
   แล้วนำค่านั้นไปใส่ `LINE_GROUP_ID` และ deploy อีกครั้ง

   ข้อความที่บอททักจะบอกสถานะให้ด้วย จึงยืนยันได้ว่าตั้งค่าสำเร็จหรือยังโดยไม่ต้องเปิดดูที่โฮสต์

   | สถานะ | บอทจะตอบว่า |
   | --- | --- |
   | ยังไม่ได้ตั้ง `LINE_GROUP_ID` | ยังไม่ได้ตั้งค่าปลายทาง ให้นำ id ไปใส่ |
   | ตั้งไว้ตรงกับกลุ่มนี้ | ตั้งค่าไว้แล้ว พร้อมรับคำขอ |
   | ตั้งไว้ที่กลุ่มอื่น | กำลังส่งเข้าอีกแชทหนึ่ง ถ้าจะย้ายให้แก้เป็น id นี้ |

   ถามซ้ำได้ทุกเมื่อโดยพิมพ์ `groupid` (หรือ `ไอดีกลุ่ม`) ในกลุ่ม

### พฤติกรรมเมื่อส่งไม่สำเร็จ

ถ้า push เข้ากลุ่มไม่ได้ (token หมดอายุ, ยังไม่ตั้งค่า, LINE ล่ม) ฟอร์มจะเปิดแอปอีเมลของลูกค้า
พร้อมข้อมูลที่กรอกไว้ครบ เพื่อไม่ให้คำขอหลุดมือ

### ความปลอดภัย

- channel access token อ่านจาก environment variable ฝั่งเซิร์ฟเวอร์เท่านั้น ไม่เคยไปถึงเบราว์เซอร์
- webhook ตรวจ `x-line-signature` ด้วย HMAC-SHA256 ก่อนทำงานทุกครั้ง
- ฟอร์มมี honeypot กันบอท และ endpoint ปฏิเสธ request ที่มาจาก origin อื่น
- ข้อมูลที่รับเข้ามาถูกตัดอักขระควบคุมและจำกัดความยาว ก่อนประกอบเป็นข้อความ

### แก้หน้าตาการ์ด

แก้ที่ `lib/line-message.ts` — อยากดูผลก่อนส่งจริง ให้คัดลอก JSON ที่ `quoteMessages()` คืนมา
ไปวางใน [Flex Message Simulator](https://developers.line.biz/flex-simulator/)

ข้อจำกัดที่ต้องระวัง: `label` ของปุ่มยาวได้ไม่เกิน 20 ตัวอักษร (มี guard ไว้แล้ว),
ข้อความหนึ่ง component ไม่เกิน 2000 ตัวอักษร และ uri ของปุ่มใช้ได้เฉพาะ http, https, line, tel

## SEO

- **แยก URL ต่อภาษา** — ไทยอยู่ที่ `/` อังกฤษอยู่ที่ `/en/` ทั้งสองหน้าเป็น HTML ที่ prerender
  มาแล้วเต็มหน้า (ไม่ได้สลับภาษาด้วย JS) ทำให้ crawler เห็นเนื้อหาครบทั้งสองภาษา
- **canonical ชี้ตัวเอง** และ **hreflang ไปกลับครบ** ทุกหน้าประกาศ `th`, `en` และ `x-default`
  (ชี้ไปภาษาไทย) ทั้งใน `<head>` และใน sitemap
- **ไม่มี redirect ตามภาษาเบราว์เซอร์** — Google จะได้เห็นหน้าเดียวกับที่ผู้ใช้เห็น
  การเปลี่ยนภาษาใช้ลิงก์จริงใน header ที่ crawl ตามได้
- **JSON-LD ต่อภาษา** — ธุรกิจและเว็บไซต์ใช้ `@id` เดียวกันทุกภาษาเพราะเป็น entity เดียวกัน
  ส่วน `WebPage` / `FAQPage` / `ItemList` ผูกกับ URL ของหน้านั้นและระบุ `inLanguage` ตามภาษา
- **ฟอนต์ self-host** ผ่าน `next/font` ตัดการต่อไป fonts.googleapis.com ช่วยเรื่อง LCP
- `llms.txt` และ `robots.txt` เปิดให้ทั้ง search engine และ AI / answer engine เก็บข้อมูล (AEO + GEO)

เวลาเพิ่มภาษาใหม่: เพิ่มใน `lib/i18n.ts`, เพิ่มไฟล์ใน `i18n/` และสร้าง route group ใหม่
ส่วน hreflang, sitemap และ JSON-LD จะอัปเดตตามเอง

## Deploy

Deploy บน Vercel ได้ตรง ๆ (ต้องใส่ environment variable ของ LINE ก่อน ไม่งั้นฟอร์มจะถอยไปใช้อีเมล)

`/api/*` เป็น dynamic route ส่วนหน้าเว็บทั้งสองภาษาเป็น static ที่ prerender ตอน build
