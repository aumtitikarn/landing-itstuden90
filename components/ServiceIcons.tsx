/** ไอคอนของเซกชันบริการ เรียงตามลำดับ services.items ใน i18n/*.json */
const icons = [
  <>
    <rect x="3.2" y="5" width="17.6" height="15.6" rx="2.4" />
    <path d="M3.2 9.6h17.6M8 3.2v3.6M16 3.2v3.6" />
    <path d="M7.4 13.2h4.2M7.4 16.8h7.4" />
    <circle cx="17" cy="13.2" r="1.5" />
  </>,
  <>
    <rect x="2.6" y="5.2" width="18.8" height="13.6" rx="2.4" />
    <path d="M2.6 9.4h18.8" />
    <path d="M12 11.4l1.36 2.76 3.04.44-2.2 2.14.52 3.03L12 17.48l-2.72 1.43.52-3.03-2.2-2.14 3.04-.44z" />
  </>,
  <>
    <path d="M3.6 20.4h16.8" />
    <path d="M7.6 20.4V13.4M12 20.4V7.8M16.4 20.4V16.2" strokeWidth="2.2" />
    <path d="M6 10.6l3.6-3.2 3.4 2.1 4.6-4.6" />
  </>,
  <>
    <rect x="2.8" y="3.4" width="7.4" height="6.2" rx="1.6" />
    <rect x="13.8" y="14.4" width="7.4" height="6.2" rx="1.6" />
    <path d="M10.2 6.5h4.3a3 3 0 0 1 3 3v4.9" />
    <path d="M15.5 12.9l2 2 2-2" />
    <path d="M13.8 17.5H9.5a3 3 0 0 1-3-3V9.6" />
    <path d="M8.5 11.1l-2-2-2 2" />
  </>,
  <>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M15.6 8.4l-2.2 4.9-4.9 2.2 2.2-4.9z" />
  </>,
  <>
    <path d="M12 2.9l7.4 2.7v5.6c0 4.4-3.06 8.02-7.4 10.1-4.34-2.08-7.4-5.7-7.4-10.1V5.6z" />
    <path d="M8.9 11.9l2.3 2.3 4.1-4.5" />
  </>,
];

export function ServiceIcon({ index }: { index: number }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[index]}
    </svg>
  );
}

export const serviceIconCount = icons.length;
