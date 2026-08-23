// Ambient background motion for the themed color palettes (src/lib/validations/color-palette.ts).
// Pure CSS animation, no client JS: every variant always renders (cheap,
// SSR-safe, no hydration mismatch) and `[data-palette]`/`.theme-decor-*`
// rules in globals.css show only the one matching the html element's
// data-palette attribute. `position: fixed; z-index: -1` keeps it behind
// normal page content while still painted above the plain body background.
//
// Hello Kitty and Spider-Man get their *motifs* animated (bows/hearts;
// webs and a dangling spider) rather than the characters themselves —
// Sanrio's and Marvel's actual character designs aren't ours to reproduce,
// even redrawn from scratch. Ocean and Forest have no such constraint, so
// those get literal waves/fish and trees/birds.

const HELLO_KITTY_BOWS = [
  { left: "4%", size: 30, duration: 16, delay: -2 },
  { left: "14%", size: 20, duration: 12, delay: -7 },
  { left: "24%", size: 38, duration: 19, delay: -4 },
  { left: "36%", size: 24, duration: 14, delay: -10 },
  { left: "48%", size: 32, duration: 17, delay: -1 },
  { left: "58%", size: 18, duration: 11, delay: -6 },
  { left: "68%", size: 36, duration: 20, delay: -13 },
  { left: "80%", size: 22, duration: 13, delay: -9 },
  { left: "92%", size: 34, duration: 18, delay: -5 },
];

const HELLO_KITTY_HEARTS = [
  { left: "10%", size: 16, duration: 13, delay: -3 },
  { left: "30%", size: 12, duration: 10, delay: -8 },
  { left: "44%", size: 18, duration: 15, delay: -5 },
  { left: "63%", size: 14, duration: 11, delay: -9 },
  { left: "75%", size: 20, duration: 16, delay: -2 },
  { left: "88%", size: 13, duration: 12, delay: -12 },
];

const FOREST_TREES = [
  { left: "2%", scale: 0.8, delay: -1 },
  { left: "12%", scale: 1.1, delay: -3 },
  { left: "88%", scale: 1, delay: -2 },
  { left: "96%", scale: 0.75, delay: -4 },
];

const FOREST_BIRDS = [
  { top: "12%", duration: 22, delay: -4 },
  { top: "20%", duration: 28, delay: -14 },
  { top: "8%", duration: 25, delay: -20 },
];

type DecorVars = React.CSSProperties & Record<`--${string}`, string | number>;

const OCEAN_BUBBLES = [
  { left: "8%", size: 10, duration: 14, delay: -2 },
  { left: "22%", size: 16, duration: 18, delay: -9 },
  { left: "37%", size: 8, duration: 12, delay: -5 },
  { left: "55%", size: 14, duration: 16, delay: -11 },
  { left: "70%", size: 10, duration: 13, delay: -3 },
  { left: "85%", size: 18, duration: 19, delay: -7 },
];

function Bow({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <path
        d="M12 12 2 5v14l10-7Z M12 12l10-7v14l-10-7Z"
        fill="currentColor"
        fillOpacity={0.55}
      />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" fillOpacity={0.75} />
    </svg>
  );
}

/** A little ribbon bouquet anchored in a corner — three overlapping bows
 * with a gentle idle sway, instead of one lone bow drifting past. */
function BowCluster() {
  return (
    <div className="decor-bow-cluster">
      <span className="decor-bow-cluster__item decor-bow-cluster__item--1">
        <Bow size={54} />
      </span>
      <span className="decor-bow-cluster__item decor-bow-cluster__item--2">
        <Bow size={38} />
      </span>
      <span className="decor-bow-cluster__item decor-bow-cluster__item--3">
        <Bow size={30} />
      </span>
    </div>
  );
}

function Heart({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <path
        d="M12 20 3 12.5C.5 10 1 6 4.5 4.6 7 3.5 9.5 4.3 12 7c2.5-2.7 5-3.5 7.5-2.4C23 6 23.5 10 21 12.5L12 20Z"
        fill="currentColor"
        fillOpacity={0.5}
      />
    </svg>
  );
}

function CornerWeb({ corner }: { corner: "top-left" | "bottom-right" }) {
  const flip = corner === "bottom-right" ? "rotate(180deg)" : undefined;
  return (
    <svg
      className={`decor-web decor-web--${corner}`}
      viewBox="0 0 160 160"
      width={160}
      height={160}
      fill="none"
      style={{ transform: flip }}
    >
      <g stroke="currentColor" strokeOpacity={0.35} strokeWidth={1}>
        {[0, 18, 36, 54, 72, 90].map((angle) => (
          <line
            key={angle}
            x1="0"
            y1="0"
            x2={160 * Math.cos((angle * Math.PI) / 180)}
            y2={160 * Math.sin((angle * Math.PI) / 180)}
          />
        ))}
        {[30, 60, 95, 135].map((r) => (
          <path
            key={r}
            d={`M ${r} 0 Q ${r * 0.78} ${r * 0.78} 0 ${r}`}
            fill="none"
          />
        ))}
      </g>
    </svg>
  );
}

/** A heart traced in web strands — concentric heart-shaped rings plus
 * spokes radiating from the center, the way an orb web radiates from its
 * hub. An original geometric mashup, not anyone's character art. */
function HeartWeb() {
  const heartPath =
    "M50 82 12 46C-2 32 2 10 20 4 34 -1 46 6 50 18 54 6 66 -1 80 4 98 10 102 32 88 46Z";
  const spokes: [number, number][] = [
    [50, 8],
    [26, 14],
    [10, 34],
    [8, 50],
    [20, 66],
    [50, 82],
    [80, 66],
    [92, 50],
    [90, 34],
    [74, 14],
  ];

  return (
    <svg viewBox="0 0 100 90" width={130} height={117} fill="none" className="decor-heart-web">
      <g stroke="currentColor" strokeWidth={1} strokeLinecap="round">
        {[1, 0.72, 0.44].map((scale, i) => (
          <path
            key={scale}
            d={heartPath}
            strokeOpacity={0.45 - i * 0.08}
            transform={`translate(50 45) scale(${scale}) translate(-50 -45)`}
          />
        ))}
        {spokes.map(([x, y]) => (
          <line key={`${x}-${y}`} x1="50" y1="45" x2={x} y2={y} strokeOpacity={0.3} />
        ))}
      </g>
    </svg>
  );
}

function Spider() {
  return (
    <div className="decor-spider">
      <div className="decor-spider__thread" />
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
        <g stroke="currentColor" strokeWidth={1.3} strokeLinecap="round">
          <line x1="12" y1="12" x2="3" y2="6" />
          <line x1="12" y1="12" x2="2" y2="12" />
          <line x1="12" y1="12" x2="3" y2="18" />
          <line x1="12" y1="12" x2="21" y2="6" />
          <line x1="12" y1="12" x2="22" y2="12" />
          <line x1="12" y1="12" x2="21" y2="18" />
        </g>
        <ellipse cx="12" cy="12" rx="4.2" ry="3.4" fill="currentColor" />
        <circle cx="12" cy="7.5" r="2.4" fill="currentColor" />
      </svg>
    </div>
  );
}

function Wave({ variant }: { variant: 1 | 2 }) {
  return (
    <svg
      className={`decor-wave decor-wave--${variant}`}
      viewBox="0 0 1600 120"
      preserveAspectRatio="none"
    >
      <path
        d="M0 60 C 100 100, 200 20, 300 60 S 500 100, 600 60 S 800 20, 900 60 S 1100 100, 1200 60 S 1400 20, 1500 60 L1600 120 L0 120 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Fish() {
  return (
    <svg viewBox="0 0 32 20" width={32} height={20} fill="none" className="decor-fish__svg">
      <path
        d="M2 10c4-6 14-8 20-4-2 1-2 7 0 8-6 4-16 2-20-4Z"
        fill="currentColor"
        fillOpacity={0.55}
      />
      <path d="M2 10 0 6v8l2-4Z" fill="currentColor" fillOpacity={0.55} />
    </svg>
  );
}

function Tree({ scale }: { scale: number }) {
  return (
    <svg
      viewBox="0 0 40 60"
      width={40 * scale}
      height={60 * scale}
      fill="none"
      className="decor-tree__svg"
    >
      <rect x="17" y="42" width="6" height="16" fill="currentColor" fillOpacity={0.5} />
      <path d="M20 0 4 26h9L4 44h32L27 26h9L20 0Z" fill="currentColor" fillOpacity={0.6} />
    </svg>
  );
}

function Bird() {
  return (
    <svg viewBox="0 0 24 12" width={24} height={12} fill="none" className="decor-bird__svg">
      <path
        d="M0 6c3-4 6-4 9 0 1-3 3-5 3-5s2 2 3 5c3-4 6-4 9 0-3 2-6 2-9 0 0 3-3 5-3 5s-3-2-3-5c-3 2-6 2-9 0Z"
        fill="currentColor"
        fillOpacity={0.55}
      />
    </svg>
  );
}

export function ThemeDecor() {
  return (
    <div className="theme-decor" aria-hidden="true">
      <div className="theme-decor-hello-kitty text-[oklch(0.6_0.2_10)]">
        <BowCluster />
        {HELLO_KITTY_BOWS.map((bow, i) => (
          <span
            key={i}
            className="decor-float"
            style={
              {
                left: bow.left,
                "--decor-duration": `${bow.duration}s`,
                "--decor-delay": `${bow.delay}s`,
              } as DecorVars
            }
          >
            <Bow size={bow.size} />
          </span>
        ))}
        {HELLO_KITTY_HEARTS.map((heart, i) => (
          <span
            key={i}
            className="decor-float text-[oklch(0.75_0.15_350)]"
            style={
              {
                left: heart.left,
                "--decor-duration": `${heart.duration}s`,
                "--decor-delay": `${heart.delay}s`,
              } as DecorVars
            }
          >
            <Heart size={heart.size} />
          </span>
        ))}
      </div>

      <div className="theme-decor-spider-man text-[oklch(0.15_0_0)]">
        <CornerWeb corner="top-left" />
        <CornerWeb corner="bottom-right" />
        <div className="decor-heart-web-wrap text-[oklch(0.5_0.21_25)]">
          <HeartWeb />
        </div>
        <div className="decor-spider-drop decor-spider-drop--a">
          <Spider />
        </div>
        <div className="decor-spider-drop decor-spider-drop--b">
          <Spider />
        </div>
        <div className="decor-spider-drop decor-spider-drop--c">
          <Spider />
        </div>
        <div className="decor-spider-drop decor-spider-drop--d">
          <Spider />
        </div>
      </div>

      <div className="theme-decor-ocean text-[oklch(0.55_0.14_220)]">
        {OCEAN_BUBBLES.map((bubble, i) => (
          <span
            key={i}
            className="decor-bubble"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              "--decor-duration": `${bubble.duration}s`,
              "--decor-delay": `${bubble.delay}s`,
            } as DecorVars}
          />
        ))}
        <div className="decor-fish" style={{ top: "22%" }}>
          <Fish />
        </div>
        <div className="decor-fish decor-fish--slow" style={{ top: "38%" }}>
          <Fish />
        </div>
        <div className="decor-wave-layer text-[oklch(0.65_0.1_195_/_45%)]">
          <Wave variant={1} />
        </div>
        <div className="decor-wave-layer decor-wave-layer--front text-[oklch(0.5_0.13_220_/_60%)]">
          <Wave variant={2} />
        </div>
      </div>

      <div className="theme-decor-forest">
        <div className="decor-trees text-[oklch(0.35_0.1_150)]">
          {FOREST_TREES.map((tree, i) => (
            <span
              key={i}
              className="decor-tree"
              style={
                {
                  left: tree.left,
                  "--decor-sway-delay": `${tree.delay}s`,
                } as DecorVars
              }
            >
              <Tree scale={tree.scale} />
            </span>
          ))}
        </div>
        {FOREST_BIRDS.map((bird, i) => (
          <span
            key={i}
            className="decor-bird text-[oklch(0.3_0.05_140)]"
            style={
              {
                top: bird.top,
                "--decor-duration": `${bird.duration}s`,
                "--decor-delay": `${bird.delay}s`,
              } as DecorVars
            }
          >
            <Bird />
          </span>
        ))}
      </div>
    </div>
  );
}
