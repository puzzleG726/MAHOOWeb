import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AboutSection from "./components/AboutSection.jsx";
import BrandSection from "./components/BrandSection.jsx";
import ContactSection from "./components/ContactSection.jsx";
import Header from "./components/Header.jsx";
import ServiceSection from "./components/ServiceSection.jsx";
import { translations } from "./data/content.js";
import { MotionProvider } from "./motion.jsx";
import { ExperienceContext } from "./experience.jsx";

const BodyScene = lazy(() => import("./components/LiquidGradientBackground.jsx"));
const knownAnchor = () => ["#about", "#service", "#brands", "#contact"].includes(location.hash);

export default function App() {
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [phase, setPhase] = useState(() => knownAnchor() || matchMedia("(prefers-reduced-motion: reduce)").matches ? "content" : "intro");
  const phaseRef = useRef(phase);
  const updateEntry = useCallback(value => {
    const next = value <= 0.005 ? "intro" : value >= 0.995 ? "content" : "transitioning";
    if (next !== phaseRef.current) { phaseRef.current = next; setPhase(next); }
  }, []);
  useLayoutEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    if (!knownAnchor()) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return () => { history.scrollRestoration = previous; };
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  // Content reveals keep their own visibility lifecycle when the hero is revisited.
  const experience = useMemo(() => ({ phase: "content", reducedMotion }), [reducedMotion]);
  const t = translations.en;
  return (
    <ExperienceContext.Provider value={experience}>
      <MotionProvider reducedMotion={reducedMotion} onEntryUpdate={updateEntry}>
        <div id="app" data-phase={phase}>
          <Suspense fallback={null}><BodyScene reducedMotion={reducedMotion} /></Suspense>
          {!reducedMotion && <Header phase={phase} />}
          <div id="smooth-wrapper"><div id="smooth-content" className="siteContent" inert={phase !== "content" ? true : undefined}>
            <main className="story">
              <AboutSection copy={t.aboutCopy} />
              <ServiceSection language="en" />
              <BrandSection />
            </main>
            <ContactSection t={t} />
          </div></div>
        </div>
      </MotionProvider>
    </ExperienceContext.Provider>
  );
}
