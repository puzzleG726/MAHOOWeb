import { createContext, useContext, useEffect, useRef, useState } from "react";
export const ExperienceContext = createContext({ phase: "content", reducedMotion: false });
export function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const { phase, reducedMotion } = useContext(ExperienceContext);
  useEffect(() => {
    if (phase !== "content" || !ref.current) return;
    if (reducedMotion) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "0px 0px -4% 0px" });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [phase, reducedMotion]);
  return { ref, className: `revealText${visible ? " is-revealed" : ""}` };
}
