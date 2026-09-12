import Script from 'next/script';
import { Bai_Jamjuree, IBM_Plex_Mono, IBM_Plex_Sans_Thai_Looped } from 'next/font/google';
import { site } from '@/lib/site';
import { locales, type Locale } from '@/lib/i18n';
import { buildJsonLd } from '@/lib/schema';

/* self-host ฟอนต์ผ่าน next/font — ตัดการต่อไปยัง fonts.googleapis.com
   ทำให้ตัวหนังสือขึ้นเร็วขึ้นและไม่มีช่วงกระพริบ */
const display = Bai_Jamjuree({
  subsets: ['latin', 'thai'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});
const body = IBM_Plex_Sans_Thai_Looped({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

/** เปลือกหน้าเว็บที่ใช้ร่วมกันทุกภาษา — ต่างกันแค่ lang และ JSON-LD */
export function Shell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const jsonLd = buildJsonLd(locale);

  return (
    <html lang={locales[locale].htmlLang} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <link
          rel="icon"
          href={
            'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22>' +
            '<rect width=%2224%22 height=%2224%22 rx=%224%22 fill=%22%2314110C%22/>' +
            '<rect x=%224%22 y=%224%22 width=%2216%22 height=%2211%22 rx=%221.6%22 fill=%22none%22 stroke=%22%23F0B429%22 stroke-width=%221.6%22/>' +
            '<path d=%22M2 20l2.2-2.4h15.6L22 20H2z%22 fill=%22%23F0B429%22/></svg>'
          }
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${site.gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {children}

        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${site.gtmId}');`}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${site.gaId}`}
          strategy="afterInteractive"
        />
        <Script id="gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${site.gaId}', { page_language: '${locale}' });`}
        </Script>
      </body>
    </html>
  );
}
