# landing-itstuden90

Landing page ของ **นักเรียนไอที (IT Student Service)** — ร้านรับทำโปรแกรม/ซอฟต์แวร์ทุกชนิด และรับปรึกษา Software Solution

## โครงสร้าง

ไฟล์เดียวจบ ไม่ต้อง build ไม่ต้องติดตั้งอะไรเพิ่ม

```
index.html      # ทั้งเว็บอยู่ในไฟล์นี้ (HTML + CSS + JS + JSON-LD)
og-image.png    # รูปตอนแชร์ลิงก์ 1200x630
robots.txt      # เปิดให้ search engine และ AI crawler เก็บข้อมูล
sitemap.xml     # แผนผังเว็บไซต์
llms.txt        # สรุปข้อมูลร้านสำหรับ AI / answer engine
```

ฟอนต์โหลดจาก Google Fonts (Bai Jamjuree, IBM Plex Sans Thai Looped, IBM Plex Mono) นอกนั้นไม่มี dependency

## เปิดดูในเครื่อง

```bash
python3 -m http.server 8000
```

แล้วเปิด http://localhost:8000

## โดเมนและการ deploy

เว็บนี้ถูกเสิร์ฟจาก 2 ที่ โดยมี **www.itstudentservice.com เป็นตัวจริง**

| URL | สถานะ | ผู้ให้บริการ |
| --- | --- | --- |
| `https://www.itstudentservice.com/` | **โดเมนหลัก** — canonical ชี้มาที่นี่ | Vercel (auto deploy จาก branch `main`) |
| `https://itstudentservice.com/` | redirect 308 ไปที่ www | Vercel |
| `https://landing-itstuden90.vercel.app/` | URL สำรองของ Vercel | Vercel |
| `https://aumtitikarn.github.io/landing-itstuden90/` | สำเนาสำรอง | GitHub Pages (branch `main` / root) |

canonical, `og:url`, `sitemap.xml`, `robots.txt` และ `llms.txt` ชี้ไปที่
`https://www.itstudentservice.com/` ทั้งหมด สำเนาบน GitHub Pages จึงบอก Google ว่า
ตัวจริงอยู่ที่โดเมนหลัก ไม่ถูกนับเป็น duplicate content

> ถ้าไม่ได้ใช้ GitHub Pages แล้ว ปิดได้ที่ Settings → Pages → Source → None
> เว็บบนโดเมนหลักจะไม่กระทบ เพราะคนละผู้ให้บริการกัน

### ถ้าย้ายโดเมน

โดเมนถูกกำหนดไว้ที่เดียวคือตัวแปร `SITE` ในสคริปต์ที่ใช้ประกอบ `index.html`
ถ้าแก้เองในไฟล์ที่ deploy แล้ว ให้แทนที่ทุกไฟล์พร้อมกัน

```bash
grep -rl "www.itstudentservice.com" index.html robots.txt sitemap.xml llms.txt \
  | xargs sed -i '' 's|https://www.itstudentservice.com|https://โดเมนใหม่ของคุณ|g'
```

## Analytics

ติดตั้งไว้แล้วในหัวของทุกหน้า

| เครื่องมือ | ID |
| --- | --- |
| Google Tag Manager | `GTM-PTZVHBFN` |
| Google Analytics 4 (gtag.js) | `G-C1XG6FBPQE` |

> **ระวังนับซ้ำ** — ถ้าใน GTM มีการตั้งแท็ก GA4 ที่ใช้ Measurement ID `G-C1XG6FBPQE` ซ้ำอีก
> ยอด pageview จะถูกนับสองรอบ ให้เลือกอย่างใดอย่างหนึ่ง: เก็บ gtag.js ไว้ในหน้าเว็บ
> แล้วไม่ต้องตั้งแท็ก GA4 ใน GTM หรือย้ายไปตั้งใน GTM อย่างเดียวแล้วลบ gtag.js ออกจากหน้าเว็บ

### ตัวนับผู้เข้าชมที่แสดงบนหน้าเว็บ

ฟุตเตอร์แสดง "เปิดดูแล้ว _N_ ครั้ง" โดยดึงตัวเลขจาก [hits.sh](https://hits.sh)
ไม่ต้องสมัครสมาชิกและไม่ต้องมีเซิร์ฟเวอร์ ตัวนับผูกกับคีย์ `itstudentservice.com`

- badge ถูกตั้งค่าให้แสดง **เฉพาะตัวเลข** (`label=%20`) ส่วนคำว่า "เปิดดูแล้ว / ครั้ง"
  เขียนเป็น HTML ด้วยฟอนต์ของเว็บเอง เพราะถ้าใส่ label ภาษาไทยเข้าไป hits.sh จะเรนเดอร์ตัวอักษรฉีกออกจากกัน
- ถ้าเปลี่ยนโดเมน ให้แก้คีย์ในลิงก์รูปให้ตรงกับโดเมนใหม่ด้วย ไม่งั้นตัวนับจะยังนับของโดเมนเดิม

> **ตัวเลขนี้คือจำนวน "ครั้งที่หน้าถูกเปิด" ไม่ใช่จำนวนคนไม่ซ้ำ** — รวมการรีเฟรชและบอทที่เข้ามาเก็บข้อมูลด้วย
> ถ้าอยากรู้จำนวนผู้ใช้จริงแบบไม่ซ้ำ ให้ดูที่รายงาน GA4 ซึ่งติดตั้งไว้แล้ว และแม่นกว่ามาก

## SEO / AEO / GEO

### SEO — ให้ Google จัดอันดับได้

- `<title>` และ meta description เขียนตามคำค้นจริง (รับทำเว็บไซต์ / รับทำโปรแกรม / ที่ปรึกษาซอฟต์แวร์)
- canonical URL, `hreflang` (th + x-default), `robots` แบบ `max-snippet:-1` และ `max-image-preview:large`
- Open Graph + Twitter Card พร้อม `og-image.png` ขนาด 1200x630
- โครงสร้างหัวข้อ `h1` เดียว ตามด้วย `h2` รายเซกชัน, HTML เชิงความหมาย (`section`, `article`, `dl`)
- `sitemap.xml` และ `robots.txt` พร้อมส่งเข้า Google Search Console

### AEO — ให้ตอบใน Featured Snippet และ AI Overviews

- **JSON-LD `FAQPage`** — คำถาม 5 ข้อพร้อมคำตอบเต็ม มีสิทธิ์ขึ้น rich result
- **`ProfessionalService`** — ชื่อร้าน เบอร์ อีเมล LINE เวลาทำการ พื้นที่ให้บริการ ภาษา
- **`OfferCatalog`** — บริการ 6 อย่างแยกเป็นรายการ พร้อมคำอธิบาย
- **`ItemList` + `WebApplication`** — ผลงาน 5 ตัวพร้อม URL จริง
- **`Review` + `AggregateRating`** — รีวิวลูกค้าจริง 5 รายการ (นามสมมุติ)
- เซกชัน "ข้อมูลร้านโดยสรุป" เขียนเป็นข้อเท็จจริงสั้น ๆ ที่ดึงไปตอบได้ทันที

### GEO — ให้ ChatGPT / Claude / Perplexity อ้างอิงได้

- `llms.txt` สรุปข้อมูลร้าน บริการ เงื่อนไข และผลงาน เป็น Markdown ที่โมเดลอ่านง่าย
- `robots.txt` อนุญาต GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended,
  Applebot-Extended, meta-externalagent และอื่น ๆ อย่างชัดเจน
- เนื้อหาบนหน้าเว็บระบุตัวเลขที่อ้างอิงได้ (1–2 สัปดาห์, 3–8 สัปดาห์, ประกัน 30 วัน, ตอบใน 1 ชั่วโมง)
- meta `geo.region` / `geo.placename` สำหรับการค้นหาเชิงพื้นที่

## สิ่งที่ควรทำต่อหลัง deploy

1. ส่ง `sitemap.xml` เข้า [Google Search Console](https://search.google.com/search-console) และ [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. ตรวจ structured data ด้วย [Rich Results Test](https://search.google.com/test/rich-results)
3. สร้าง Google Business Profile เพื่อให้ขึ้นผลค้นหาแบบธุรกิจท้องถิ่น
4. ตรวจความเร็วหน้าเว็บด้วย [PageSpeed Insights](https://pagespeed.web.dev/)

> **หมายเหตุเรื่องดาวรีวิว** — Google ไม่แสดงดาวใน search result สำหรับรีวิวที่ธุรกิจ
> ใส่ไว้บนเว็บตัวเอง (self-serving review) แต่ข้อมูลรีวิวใน JSON-LD ยังมีประโยชน์กับ
> AI / answer engine ถ้าอยากได้ดาวจริงใน Google ต้องสะสมรีวิวผ่าน Google Business Profile

## เนื้อหาในหน้า

| ส่วน | รายละเอียด |
| --- | --- |
| Hero | โน้ตบุ๊กสลับโชว์ผลงานจริง 5 ระบบ |
| บริการ | เว็บแอป · ระบบ LINE · หลังบ้าน/แดชบอร์ด · เชื่อม API · ที่ปรึกษา · ดูแลหลังส่งมอบ |
| ผลงาน | JongGo, คิดตัง, Judgement, พิมพ์ใจ, GenQR |
| ขั้นตอน | 5 ขั้น ตั้งแต่คุยโจทย์ถึงดูแลต่อ |
| รีวิว | รีวิวลูกค้าจริง เผยแพร่ด้วยนามสมมุติ |
| FAQ | ราคา · ระยะเวลา · รอบแก้ · ซอร์สโค้ด · งานนักศึกษา |
| ข้อมูลร้าน | ตารางสรุปข้อเท็จจริงสำหรับคนอ่านและ AI |

## ติดต่อ

- LINE: [@863icoey](https://line.me/R/ti/p/@863icoey)
- โทร: 064-098-4337
- อีเมล: itstudentservice123@gmail.com
