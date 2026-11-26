import { useContext, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { brandLogos } from "../data/content.js";
import { ExperienceContext } from "../experience.jsx";
import BlockRevealText from "./BlockRevealText.jsx";

const transitionOrder = [0, 5, 2, 7, 4, 1, 6, 3];

function ImageStepTransition({ logos, setTrackRef, slotIndex }) {
  return (
    <div className="brandLogoSlot" style={{ "--slot-index": slotIndex }}>
      <div ref={setTrackRef} className="brandLogoStepTrack">
        {[...logos, logos[0]].map((logo, index) => (
          <div className="brandLogoStep" key={`${logo.src}-${index}`}>
            <img src={logo.src} alt={logo.alt} draggable="false" />
          </div>
        ))}
      </div>
    </div>
  );
}

function chunkLogos(logos, size) {
  return Array.from({ length: Math.ceil(logos.length / size) }, (_, index) =>
    logos.slice(index * size, index * size + size),
  );
}

export default function BrandSection() {
  const { phase, reducedMotion } = useContext(ExperienceContext);
  const sectionRef = useRef(null);
  const logoGroups = useMemo(() => chunkLogos(brandLogos, 5).slice(0, 8), []);
  const tracksRef = useRef([]);
  const positionsRef = useRef(
    Array.from({ length: logoGroups.length }, () => 0),
  );

  useEffect(() => {
    if (phase !== "content" || reducedMotion) return;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(sectionRef.current);
    let orderIndex = 0;

    const animateNextSlot = () => {
      if (!visible || document.hidden) return;
      const groupIndex = transitionOrder[orderIndex];
      const track = tracksRef.current[groupIndex];

      orderIndex = (orderIndex + 1) % transitionOrder.length;

      if (!track) return;

      const nextPosition = positionsRef.current[groupIndex] + 1;

      gsap.to(track.children, {
        yPercent: -100 * nextPosition,
        duration: 0.45,
        ease: "power3",
        overwrite: true,
        onComplete: () => {
          if (nextPosition === logoGroups[groupIndex].length) {
            gsap.set(track.children, { yPercent: 0 });
            positionsRef.current[groupIndex] = 0;
            return;
          }

          positionsRef.current[groupIndex] = nextPosition;
        },
      });
    };

    const intervalId = window.setInterval(animateNextSlot, 1800);

    return () => {
      window.clearInterval(intervalId); observer.disconnect();
      tracksRef.current.forEach(track => {
        if (track) { gsap.killTweensOf(track.children); gsap.set(track.children, { yPercent: 0 }); }
      });
      positionsRef.current.fill(0);
    };
  }, [logoGroups, phase, reducedMotion]);

  return (
    <section className="section brandsSection" id="brands" ref={sectionRef}>
      <div className="brandsPanel">
        <div className="brandsHeaderStage"><div data-motion-pin>
        <div className="brandsHeader" data-motion-body>
          <div className="eyebrow">03 / Our Customers</div>
          <BlockRevealText className="brandsTitle" delay={0}>
            50+ Brand Partners
          </BlockRevealText>
          <BlockRevealText className="brandsTitle" delay={0.14}>
            200+ Large-scale Projects
          </BlockRevealText>
          <BlockRevealText className="brandsTitle" delay={0.28}>
            Global Reach & Local Impact
          </BlockRevealText>
        </div>
        </div></div>
        <div className="brandsGrid" aria-label="Brand partner logos">
          {logoGroups.map((logos, index) => (
            <ImageStepTransition
              key={logos[0].src}
              logos={logos}
              setTrackRef={(element) => {
                tracksRef.current[index] = element;
              }}
              slotIndex={index}
            />
          ))}
        </div>
      </div>
      <div className="diceAnchor brandsRouteAnchor" data-dice-anchor="brands" aria-hidden="true" />
    </section>
  );
}
