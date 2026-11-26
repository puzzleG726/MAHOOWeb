import { useContext, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ExperienceContext } from "../experience.jsx";
import { useMotion } from "../motionContext.js";
import "../line-text-animation.css";

gsap.registerPlugin(SplitText);

export default function LineTextAnimation({ children, as: Tag = "h1", className = "" }) {
  const headingRef = useRef(null), played = useRef(false), completed = useRef(false);
  const { phase, reducedMotion } = useContext(ExperienceContext);
  const motion = useMotion();

  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (phase !== "content" || !heading) return;
    if (reducedMotion) {
      played.current = completed.current = true;
      heading.dataset.lineState = "complete";
      return;
    }
    let disposed = false, split, tween, observer;
    const setup = () => {
      if (disposed) return;
      const accessibleText = (heading.children.length
        ? Array.from(heading.children, child => child.textContent).join(" ")
        : heading.textContent).replace(/\s+/g, " ").trim();
      split = SplitText.create(heading, {
        type: "lines", mask: "lines", autoSplit: true, aria: "auto",
        linesClass: "line-text-animation__line",
        onSplit: self => {
          heading.setAttribute("aria-label", accessibleText);
          motion?.requestRefresh();
          if (completed.current) {
            gsap.set(self.lines, { yPercent: 0 });
            heading.dataset.lineState = "complete";
            return;
          }
          heading.dataset.lineState = played.current ? "animating" : "waiting";
          tween = gsap.fromTo(self.lines, { yPercent: 110 }, {
            yPercent: 0, duration: 0.85, stagger: 0.08, ease: "power4.out", paused: !played.current,
            onStart: () => { heading.dataset.lineState = "animating"; },
            onComplete: () => { completed.current = true; heading.dataset.lineState = "complete"; },
          });
          // SplitText preserves this animation's progress when responsive lines are rebuilt.
          return tween;
        },
      });
      if (!played.current) {
        observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting || played.current) return;
          played.current = true;
          heading.dataset.lineRuns = "1";
          tween?.play(); observer.disconnect();
        }, { rootMargin: "0px 0px -12% 0px" });
        observer.observe(heading);
      }
    };
    document.fonts.ready.then(setup);
    return () => {
      disposed = true; observer?.disconnect(); tween?.kill(); split?.revert();
    };
  }, [phase, reducedMotion, children, motion]);

  return <Tag ref={headingRef} tabIndex={Tag === "h1" ? -1 : undefined}
    className={`${className} line-text-animation__heading`} data-line-state="pending">{children}</Tag>;
}
