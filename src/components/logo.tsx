/** The app's mark — paired with the "Academique" wordmark everywhere it
 * appears. Inline SVG (not an <img>) since it's original hand-drawn vector
 * art: crisper at any size than a rasterized PNG, and it never has to round-
 * trip through a network request (so it can't get caught by the auth proxy
 * matcher the way a `public/` asset can — see src/proxy.ts). */
export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 320" aria-hidden="true" className={className}>
      <g fill="none" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M55,258 L145,244 L145,290 L55,278 Z" />
        <path d="M235,258 L145,244 L145,290 L235,278 Z" />
        <path d="M75,262 L128,253" />
        <path d="M75,271 L128,262" />
        <path d="M162,253 L215,262" />
        <path d="M162,262 L215,271" />

        <path d="M100,178 Q150,164 196,178 L206,244 Q150,258 92,244 Z" />
        <path d="M94,182 Q73,208 80,248" />
        <path d="M184,186 Q214,166 220,128" />
      </g>
      <circle cx="80" cy="249" r="8" fill="#fdf8f5" stroke="#1a1a1a" strokeWidth="6" />

      <g stroke="#ae5a84" strokeWidth="8" strokeLinecap="round">
        <line x1="220" y1="128" x2="242" y2="82" />
      </g>
      <g fill="none" stroke="#fdf8f5" strokeWidth="5" strokeLinecap="round">
        <line x1="221" y1="112" x2="234" y2="107" />
      </g>
      <g stroke="#ae5a84" strokeWidth="5" strokeLinecap="round">
        <line x1="252" y1="68" x2="258" y2="56" />
        <line x1="262" y1="80" x2="276" y2="76" />
        <line x1="250" y1="90" x2="256" y2="102" />
      </g>

      <path
        d="M111,120 C108,92 126,68 155,68 C184,68 201,92 197,122 C195,142 182,158 155,160 C128,158 113,140 111,120 Z"
        fill="#fdf8f5"
        stroke="#1a1a1a"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      <path
        d="M108,118 C104,84 126,54 156,54 C188,56 206,80 202,112 C196,116 194,108 188,104 C170,120 178,100 168,90 C160,102 150,92 146,78 C138,92 140,104 128,100 C124,112 128,120 116,120 Z"
        fill="#1a1a1a"
      />
      <path
        d="M116,112 C104,108 90,118 92,140 C94,160 110,172 130,166 C122,150 124,128 134,112 Z"
        fill="#1a1a1a"
      />
      <g fill="#fdf8f5">
        <path d="M120,104 L126,116 L132,102 Z" />
        <path d="M136,96 L142,110 L148,94 Z" />
        <path d="M152,90 L158,104 L164,88 Z" />
        <path d="M168,92 L174,106 L180,90 Z" />
      </g>

      <g fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinejoin="round">
        <rect x="118" y="112" width="34" height="26" rx="8" />
        <rect x="160" y="112" width="34" height="26" rx="8" />
        <path d="M152,122 L160,122" />
        <path d="M118,122 L104,118" />
        <path d="M194,122 L208,118" />
      </g>

      <g stroke="#1a1a1a" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M128,126 Q135,130 142,126" />
        <path d="M170,126 Q177,130 184,126" />
        <path d="M148,146 Q155,150 162,146" />
      </g>

      <g fill="#e8a5a5" opacity="0.55">
        <ellipse cx="122" cy="140" rx="7" ry="4.5" />
        <ellipse cx="188" cy="140" rx="7" ry="4.5" />
      </g>
    </svg>
  );
}
