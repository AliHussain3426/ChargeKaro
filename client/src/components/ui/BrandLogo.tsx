import { useId } from 'react';

/**
 * ChargeKaro brand mark — the blue charging "C" with a bolt, speed lines and a plug.
 * Colours are driven by CSS variables so the same mark works on light and dark surfaces.
 */
export default function BrandLogo({ className = 'brand-logo' }: { className?: string }) {
  const maskId = `ck-ring-opening-${useId().replace(/:/g, '')}`;
  return (
    <svg
      className={className}
      viewBox="0 0 240 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ChargeKaro logo"
      focusable="false"
    >
      <defs>
        <mask id={maskId}>
          <rect width="240" height="200" fill="#fff" />
          <path d="M115 100 L260 -13 L260 213 Z" fill="#000" />
        </mask>
      </defs>

      {/* Charging ring */}
      <circle
        cx="115"
        cy="100"
        r="66"
        fill="none"
        stroke="var(--ck-navy)"
        strokeWidth="22"
        mask={`url(#${maskId})`}
      />

      {/* Speed lines */}
      <rect x="35" y="52" width="60" height="10" rx="5" fill="var(--ck-blue)" stroke="#fff" strokeWidth="3" />
      <rect x="14" y="84" width="52" height="10" rx="5" fill="var(--ck-blue)" />
      <rect x="40" y="116" width="30" height="10" rx="5" fill="var(--ck-blue)" />

      {/* Lightning bolt */}
      <g transform="translate(115 100) rotate(16) scale(4 5.4) translate(-12 -12)">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="var(--ck-blue)" />
      </g>

      {/* Plug */}
      <path d="M145 100 L162 82 L162 118 Z" fill="var(--ck-navy)" />
      <rect x="160" y="81" width="26" height="38" rx="8" fill="var(--ck-navy)" />
      <rect x="186" y="91" width="16" height="5" rx="2.5" fill="var(--ck-navy)" />
      <rect x="186" y="104" width="16" height="5" rx="2.5" fill="var(--ck-navy)" />
    </svg>
  );
}
