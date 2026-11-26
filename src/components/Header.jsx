import { Component, lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useMotion } from "../motionContext.js";
const IntroCanvas = lazy(() => import("./IntroCanvas.jsx"));
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function Header({ phase }) {
  const motion = useMotion();
  const cursor = useRef(null), position = useRef(null);
  useLayoutEffect(() => {
    const node = cursor.current;
    position.current = { x: gsap.quickTo(node, "x", { duration: 0.16, ease: "power3.out" }), y: gsap.quickTo(node, "y", { duration: 0.16, ease: "power3.out" }) };
    return () => { position.current.x.tween.kill(); position.current.y.tween.kill(); gsap.killTweensOf(node); };
  }, []);
  const move = (event, entering = false) => {
    if (innerWidth <= 768 || event.pointerType === "touch" || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const button = event.currentTarget, rect = button.getBoundingClientRect();
    const radius = cursor.current.offsetWidth / 2 + 12;
    const x = Math.max(radius, Math.min(innerWidth - radius, event.clientX)) - rect.left;
    const y = Math.max(radius, Math.min(innerHeight - radius, event.clientY)) - rect.top;
    if (entering) {
      position.current.x.tween.pause(); position.current.y.tween.pause();
      gsap.set(cursor.current, { x, y });
      button.classList.add("is-hovering");
    } else { position.current.x(x); position.current.y(y); }
  };
  useEffect(() => {
    if (phase !== "intro") return;
    const keyboard = event => {
      if (!["Enter", " "].includes(event.key) || event.altKey || event.metaKey || event.ctrlKey || event.target.closest?.("button, a, input, textarea, select")) return;
      event.preventDefault(); motion.enter();
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [phase, motion]);
  return (
    <header className="intro" aria-label="Mahoo Lab introduction" aria-hidden={phase === "content" ? true : undefined}>
      <div className="introCanvas" aria-hidden="true">
        <SceneBoundary><Suspense fallback={null}><IntroCanvas active={phase !== "content"} /></Suspense></SceneBoundary>
      </div>
      <div className="introIdentity" aria-hidden="true"><span>MAHOO LAB</span><span>CREATIVE TECHNOLOGY</span></div>
      <button className="entryControl" type="button" aria-label="Click to Continue" onClick={() => motion.enter()} disabled={phase !== "intro"}
        onPointerEnter={event => move(event, true)} onPointerMove={move} onPointerLeave={event => event.currentTarget.classList.remove("is-hovering")}>
        <span className="entryCursor" ref={cursor} aria-hidden="true"><span className="entryCursorDisc"><span>Click to<br />Continue</span></span></span>
      </button>
    </header>
  );
}
