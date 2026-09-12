import { getDictionary, type Locale } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Ticker } from '@/components/Ticker';
import { Services } from '@/components/Services';
import { Works } from '@/components/Works';
import { Process } from '@/components/Process';
import { Reviews } from '@/components/Reviews';
import { Faq } from '@/components/Faq';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { ContactDock } from '@/components/ContactDock';
import { Reveal } from '@/components/Reveal';
import { Analytics } from '@/components/Analytics';

/** ตัวหน้า landing — เนื้อหาทั้งหมดถูก render ฝั่ง server ตามภาษาที่รับมา */
export function Landing({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <>
      <Header t={t} locale={locale} />

      <main id="top">
        <Hero t={t} />
        <Ticker items={t.ticker} />
        <Services t={t} />
        <Works t={t} />
        <Process t={t} />
        <Reviews t={t} />
        <Faq t={t} />
        <About t={t} />
        <Contact t={t} />
      </main>

      <Footer t={t} />
      <ContactDock t={t} />

      <Reveal />
      <Analytics />
    </>
  );
}
