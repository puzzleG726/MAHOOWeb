import { useContext } from "react";
import { ExperienceContext } from "../experience.jsx";
import { useMotion } from "../motionContext.js";

export default function AboutSection({ copy }) {
  const motion = useMotion();
  const { reducedMotion } = useContext(ExperienceContext);
  return (
    <section className="section" id="about">
      <div className="aboutStage" data-motion-pin>
        {!reducedMotion && <button className="titleReturn" type="button" onClick={() => motion.returnToTitle()}>Back to title <span aria-hidden="true">↖</span></button>}
        <div className="sectionInner aboutFloat" data-motion-body>
          <div className="aboutHeading">
            <div className="eyebrow">01 / Introduction</div>
            <h1 className="headline" tabIndex={-1} aria-label="We Are Mahoo Lab.">
              <span className="headlineLine heroPrefix">We Are</span>
              <span className="headlineLine"><span className="heroNameSlot"><span className="heroName">Mahoo Lab.</span></span></span>
            </h1>
          </div>
          <div className="aboutDetail">
            <div className="diceAnchor aboutDice" aria-hidden="true" />
            <p className="copy">{copy}</p>
          </div>
        </div>
      </div>
      <div className="diceAnchor aboutRouteAnchor" data-dice-anchor="about" aria-hidden="true" />
    </section>
  );
}
