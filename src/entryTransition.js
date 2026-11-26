import gsap from "gsap";
import { getTitleFontSize } from "./motionContext.js";

// Entry owns time; chapter scrolling never writes to this timeline or the glass scene.
export function createEntryTransition(api, onUpdate, reducedMotion) {
  const stage = document.querySelector(".aboutStage");
  const slot = document.querySelector(".heroNameSlot");
  const initialProgress = api.entryProgress;
  let timeline, context, lock, disposed = false, rebuilding = false;
  const publish = value => {
    api.entryProgress = value;
    document.documentElement.style.setProperty("--entry-progress", value);
    onUpdate(value);
  };
  const lockEntry = () => {
    if (!lock) lock = { overflow: document.body.style.overflow, overscroll: document.body.style.overscrollBehavior };
    api.entryOpen = true;
    api.scrollTo(0);
    api.smoother?.paused(true);
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
  };
  const unlockEntry = () => {
    api.entryOpen = false;
    if (lock) {
      document.body.style.overflow = lock.overflow;
      document.body.style.overscrollBehavior = lock.overscroll;
      lock = null;
    }
    if (!api.overlayOpen) api.smoother?.paused(false);
    api.scrollTo(0);
  };
  const focus = selector => requestAnimationFrame(() => {
    if (disposed) return;
    api.restoringFocus = true;
    document.querySelector(selector)?.focus({ preventScroll: true });
    requestAnimationFrame(() => { api.restoringFocus = false; });
  });
  const finish = () => {
    api.entryBusy = false; publish(1); unlockEntry();
    api.requestRefresh(); focus("#about h1");
  };
  const showTitle = () => {
    api.entryBusy = false; publish(0); lockEntry(); focus(".entryControl");
  };
  const buildAt = progress => {
    rebuilding = true;
    context?.revert();
    context = gsap.context(() => {
      timeline = gsap.timeline({ paused: true, onUpdate: () => { if (!rebuilding) publish(timeline.progress()); }, onComplete: finish, onReverseComplete: showTitle });
      timeline.fromTo(".heroName", {
        x: innerWidth / 2 - (slot.getBoundingClientRect().left - stage.getBoundingClientRect().left + slot.offsetWidth / 2),
        y: innerHeight / 2 - (slot.getBoundingClientRect().top - stage.getBoundingClientRect().top + slot.offsetHeight / 2),
        scale: getTitleFontSize(innerWidth) / parseFloat(getComputedStyle(slot).fontSize),
        transformOrigin: "50% 50%",
      }, { x: 0, y: 0, scale: 1, duration: 0.75, ease: "power3.inOut" }, 0.26)
        // Fade the stationary glass before the wordmark underneath starts moving.
        .fromTo(".introCanvas", { opacity: 1 }, { opacity: 0, duration: 0.32, ease: "power2.inOut" }, 0)
        .fromTo(".entryControl, .introIdentity", { opacity: 1 }, { opacity: 0, duration: 0.18, ease: "power2.out" }, 0)
        .fromTo(".heroPrefix", { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" }, 0.78)
        .fromTo("#about .eyebrow, #about .copy, .titleReturn", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, stagger: 0.02, ease: "power2.out" }, 0.88)
        .set(".intro", { autoAlpha: 0 }, 1.24);
      timeline.progress(progress, true);
    });
    rebuilding = false; publish(progress);
  };
  if (reducedMotion) { api.entryBusy = false; publish(1); unlockEntry(); }
  else {
    buildAt(initialProgress);
    if (initialProgress < 1) lockEntry();
    if (initialProgress > 0 && initialProgress < 1) {
      api.entryBusy = true;
      if (api.entryDirection === -1) timeline.reverse(); else timeline.play();
    }
  }
  api.enter = () => {
    if (reducedMotion || api.entryBusy || !api.entryOpen) return;
    api.entryBusy = true; api.entryDirection = 1; timeline.play();
  };
  api.returnToTitle = () => {
    if (reducedMotion || api.entryBusy || api.entryOpen || api.overlayOpen) return;
    api.entryBusy = true; api.entryDirection = -1;
    lockEntry(); timeline.reverse();
  };
  api.skipEntry = () => {
    timeline?.progress(1, true).pause(); api.entryBusy = false;
    publish(1); unlockEntry();
  };
  return {
    refresh: () => {
      if (!timeline || disposed) return;
      // Re-measure responsive typography without restarting an in-flight click animation.
      const progress = timeline.progress();
      const active = api.entryBusy;
      buildAt(progress);
      if (active) { if (api.entryDirection === -1) timeline.reverse(); else timeline.play(); }
    },
    destroy: () => {
      disposed = true; timeline?.kill(); context?.revert();
      if (lock) {
        document.body.style.overflow = lock.overflow;
        document.body.style.overscrollBehavior = lock.overscroll;
      }
      api.enter = api.returnToTitle = api.skipEntry = () => {};
    },
  };
}
