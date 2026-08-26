/** Three soft, slowly-drifting pastel blobs behind a hero/CTA section — see
 * the `.hero-orb*` rules in globals.css. Purely decorative, so it's
 * `aria-hidden` and needs its container to be `relative` (or `overflow-hidden`
 * itself already clips via `inset: 0`). */
export function HeroOrbs() {
  return (
    <div className="hero-orbs" aria-hidden>
      <div className="hero-orb hero-orb--1" />
      <div className="hero-orb hero-orb--2" />
      <div className="hero-orb hero-orb--3" />
    </div>
  );
}
