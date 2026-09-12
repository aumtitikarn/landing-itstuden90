/** ไอคอนที่ใช้ซ้ำหลายที่ */
export function LineIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.5 2 2 5.7 2 10.2c0 4 3.6 7.4 8.4 8.05.33.07.78.22.9.5.1.26.07.66.03.92l-.14.87c-.05.26-.2 1.02.9.55 1.1-.46 5.9-3.47 8.05-5.95C21.6 13.5 22 11.9 22 10.2 22 5.7 17.5 2 12 2z" />
    </svg>
  );
}

export function PhoneIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

export function MailIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3 6.5l9 6.5 9-6.5" />
    </svg>
  );
}

export function ArrowOutIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3.2 9.4h17.6M3.2 14.6h17.6" />
      <path d="M12 3a15 15 0 0 1 0 18A15 15 0 0 1 12 3z" />
    </svg>
  );
}

export function BrandMarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3.5" width="16" height="12" rx="1.6" stroke="#F0B429" strokeWidth="1.6" />
      <rect x="6.6" y="6" width="3" height="4" rx=".6" fill="#F0B429" />
      <path
        d="M11.4 6.4h6M11.4 8.4h6M11.4 10.4h6M6.6 12.4h10.8"
        stroke="#F0B429"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M2 19.6l2.2-2.4h15.6l2.2 2.4H2z" fill="#F0B429" />
    </svg>
  );
}
