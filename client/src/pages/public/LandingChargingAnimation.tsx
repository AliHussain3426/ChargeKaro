export default function LandingChargingAnimation() {
  return (
    <div className="lp-charge-anim" role="img" aria-label="Animated charging plug connecting to a socket with sparks">
      <div className="lp-charge-glow" />
      <svg className="lp-charge-svg" viewBox="0 0 520 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lpPlugGrad" x1="120" y1="120" x2="240" y2="220" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E3A8A" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="lpSocketGrad" x1="300" y1="110" x2="420" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>
          <filter id="lpSparkGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient energy rings */}
        <circle className="lp-charge-ring lp-charge-ring--a" cx="290" cy="160" r="54" />
        <circle className="lp-charge-ring lp-charge-ring--b" cx="290" cy="160" r="74" />
        <circle className="lp-charge-ring lp-charge-ring--c" cx="290" cy="160" r="96" />

        {/* Plug (male) group - moves right to connect */}
        <g className="lp-charge-plug">
          {/* Cable moves with plug */}
          <path
            className="lp-charge-cable"
            d="M30 235 C 95 235, 110 190, 150 178 C 185 168, 205 170, 225 165"
            stroke="#334155"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            className="lp-charge-cable-inner"
            d="M30 235 C 95 235, 110 190, 150 178 C 185 168, 205 170, 225 165"
            stroke="#64748B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="170" y="132" width="78" height="56" rx="14" fill="url(#lpPlugGrad)" />
          <rect x="182" y="144" width="54" height="32" rx="8" fill="rgba(255,255,255,.12)" />
          {/* Pins */}
          <rect x="246" y="145" width="18" height="8" rx="3" fill="#E2E8F0" />
          <rect x="246" y="167" width="18" height="8" rx="3" fill="#E2E8F0" />
          {/* Plug detail */}
          <circle cx="200" cy="160" r="7" fill="rgba(255,255,255,.18)" />
          <path d="M197 160h6M200 157v6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Socket (female) group */}
        <g className="lp-charge-socket">
          <rect x="292" y="118" width="92" height="84" rx="20" fill="url(#lpSocketGrad)" />
          <rect x="304" y="130" width="68" height="60" rx="14" fill="#111827" />
          {/* Socket holes */}
          <rect x="300" y="144" width="10" height="10" rx="3" fill="#93C5FD" className="lp-charge-port lp-charge-port--top" />
          <rect x="300" y="166" width="10" height="10" rx="3" fill="#93C5FD" className="lp-charge-port lp-charge-port--bottom" />
          {/* Socket icon */}
          <path d="M338 148l-10 14h9l-2 12 12-16h-9l0-10z" fill="#60A5FA" className="lp-charge-socket-bolt" />
          {/* Status light */}
          <circle cx="366" cy="134" r="4" fill="#22C55E" className="lp-charge-status" />
        </g>

        {/* Sparks */}
        <g className="lp-charge-sparks" filter="url(#lpSparkGlow)">
          <path className="lp-spark lp-spark--1" d="M286 160l-18-12" stroke="#FCD34D" strokeWidth="3.4" strokeLinecap="round" />
          <path className="lp-spark lp-spark--2" d="M286 160l-22 0" stroke="#FBBF24" strokeWidth="3.6" strokeLinecap="round" />
          <path className="lp-spark lp-spark--3" d="M286 160l-18 12" stroke="#F59E0B" strokeWidth="3.4" strokeLinecap="round" />
          <path className="lp-spark lp-spark--4" d="M286 152l-12-20" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
          <path className="lp-spark lp-spark--5" d="M286 168l-12 20" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
          <path className="lp-spark lp-spark--6" d="M286 160l-10-6" stroke="#FEF08A" strokeWidth="2.8" strokeLinecap="round" />
          <path className="lp-spark lp-spark--7" d="M286 160l-10 6" stroke="#FEF08A" strokeWidth="2.8" strokeLinecap="round" />
          <circle className="lp-spark-dot lp-spark-dot--1" cx="266" cy="146" r="3.4" fill="#FDE68A" />
          <circle className="lp-spark-dot lp-spark-dot--2" cx="260" cy="160" r="3.2" fill="#FCD34D" />
          <circle className="lp-spark-dot lp-spark-dot--3" cx="266" cy="174" r="3" fill="#FBBF24" />
        </g>

        {/* Connection flash */}
        <circle className="lp-charge-flash" cx="286" cy="160" r="28" fill="#BFDBFE" />
      </svg>

      <div className="lp-charge-label">
        <span className="lp-charge-label-dot" />
        <span>Live connection</span>
      </div>
    </div>
  );
}