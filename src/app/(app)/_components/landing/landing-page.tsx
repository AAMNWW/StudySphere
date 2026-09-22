/** The signed-out landing page.
 *
 * Read top to bottom it tells one story: here's the mess (chaos) → here's
 * the workspace that replaces it (features) → here's what it's made of
 * (stats, tools, career) → here's how you start (steps) → the honest small
 * print (privacy, FAQ) → the ask (CTA).
 *
 * The anchor ids (#features, #how-it-works, #tools, #pricing, #faq,
 * #privacy) are linked from the header nav and the site footer — keep them
 * when rearranging sections. */

import { CareerSection } from "./career-section";
import { ChaosSection } from "./chaos-section";
import { CtaSection } from "./cta-section";
import { FaqSection } from "./faq-section";
import { FeatureShowcase } from "./feature-showcase";
import { GallerySection } from "./gallery-section";
import { HeroSection } from "./hero-section";
import { IntroSplash } from "./intro-splash";
import { MarqueeStrip } from "./marquee-strip";
import { PrivacySection } from "./privacy-section";
import { ScrollProgress } from "./scroll-progress";
import { StatsSection } from "./stats-section";
import { StepsSection } from "./steps-section";
import { ToolsSection } from "./tools-section";

export function LandingPage() {
  return (
    <main>
      <IntroSplash />
      <ScrollProgress />
      <HeroSection />
      <MarqueeStrip />
      <ChaosSection />
      <FeatureShowcase />
      <StatsSection />
      <ToolsSection />
      <CareerSection />
      <StepsSection />
      <GallerySection />
      <PrivacySection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
