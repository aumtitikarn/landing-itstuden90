/** ข้อมูลที่ไม่ขึ้นกับภาษา — ใช้ร่วมกันทุก locale */
export const site = {
  origin: 'https://www.itstudentservice.com',
  ogImage: '/og-image.png',
  gtmId: 'GTM-PTZVHBFN',
  gaId: 'G-C1XG6FBPQE',

  contact: {
    phone: '064-098-4337',
    phoneHref: 'tel:0640984337',
    phoneIntl: '+66640984337',
    email: 'itstudentservice123@gmail.com',
    lineId: '@863icoey',
    lineUrl: 'https://line.me/R/ti/p/@863icoey',
  },

  /** ภาษาของตัวแอปเอง (ไม่ใช่ภาษาของหน้า landing) */
  workLanguage: 'th-TH',

  works: [
    { url: 'https://jonggo-web.vercel.app/', category: 'BusinessApplication' },
    { url: 'https://kidtang.itstudentservice.com/', category: 'FinanceApplication' },
    { url: 'https://judgement-seven.vercel.app/', category: 'LifestyleApplication' },
    { url: 'https://pimjai.itstudentservice.com/', category: 'SocialNetworkingApplication' },
    { url: 'https://gen-qr-nine.vercel.app/', category: 'UtilitiesApplication' },
  ],

  rating: {
    ratingValue: '5',
    bestRating: '5',
    worstRating: '1',
    ratingCount: 5,
    reviewCount: 5,
  },

  hitsBadge:
    'https://hits.sh/itstudentservice.com.svg?style=flat-square&label=%20&color=f0b429&labelColor=1d1912',
} as const;
