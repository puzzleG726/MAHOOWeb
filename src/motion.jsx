import { useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { MotionContext } from "./motionContext.js";
import { createEntryTransition } from "./entryTransition.js";
export { useMotion } from "./motionContext.js";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

function createMotion() {
  const listeners = new Set();
  const startsInContent = ["#about", "#service", "#brands", "#contact"].includes(location.hash) || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const api = {
    smoother: null,
    entryProgress: startsInContent ? 1 : 0,
    entryOpen: !startsInContent,
    entryBusy: false,
    enter: () => {}, returnToTitle: () => {}, skipEntry: () => {},
    fieldState: { time: 0, x: 0, y: 0 },
    overlayOpen: false,
    layoutBusy: false,
    refreshPending: false,
    requestRefresh: () => {},
    getScroll: () => api.smoother ? api.smoother.scrollTop() : window.scrollY,
    subscribe: (callback) => { listeners.add(callback); return () => listeners.delete(callback); },
    notify: () => listeners.forEach(callback => callback()),
    scrollTo: (target, animate = false) => {
      const y = typeof target === "number" ? target : target?.getBoundingClientRect().top + api.getScroll() - 48;
      if (!Number.isFinite(y)) return;
      if (api.smoother) api.smoother.scrollTo(Math.max(0, y), animate);
      else window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
    },
    pause: () => {
      if (api.overlayOpen) return;
      const y = api.getScroll();
      api.lock = { y, overflow: document.body.style.overflow };
      api.overlayOpen = true;
      if (api.smoother) { api.smoother.scrollTop(y); api.smoother.paused(true); }
      document.body.style.overflow = "hidden";
    },
    resume: () => {
      if (!api.overlayOpen) return;
      document.body.style.overflow = api.lock?.overflow || "";
      api.overlayOpen = false;
      if (api.smoother) { api.smoother.paused(false); api.smoother.scrollTop(api.lock?.y || 0); }
      else window.scrollTo({ top: api.lock?.y || 0, behavior: "instant" });
      api.lock = null;
      if (api.refreshPending) api.requestRefresh();
    },
  };
  return api;
}

function MotionController({ api, reducedMotion, onEntryUpdate }) {
  useLayoutEffect(() => {
    let disposed = false, initialAnchor = true, keyboardNavigation = false;
    let entry;
    const keepEntry = () => { if (api.entryOpen && window.scrollY) api.scrollTo(0); };
    window.addEventListener("scroll", keepEntry, { passive: true });
    const pointerFocus = () => { keyboardNavigation = false; };
    const keyboardFocus = event => { if (event.key === "Tab") keyboardNavigation = true; };
    document.addEventListener("pointerdown", pointerFocus, true);
    document.addEventListener("keydown", keyboardFocus, true);
    const media = gsap.matchMedia();
    const refresh = gsap.delayedCall(0.09, () => {
      if (disposed) return;
      if (api.overlayOpen || api.layoutBusy) { api.refreshPending = true; return; }
      api.refreshPending = false;
      entry?.refresh();
      ScrollTrigger.refresh();
      api.notify();
    }).pause();
    api.requestRefresh = () => refresh.restart(true);

    media.add({ all: "all", fine: "(pointer: fine)", pin: "(pointer: fine) and (min-width: 1025px) and (min-height: 700px)", reduce: "(prefers-reduced-motion: reduce)" }, context => {
      const motionAllowed = !reducedMotion && !context.conditions.reduce;
      const restoredScroll = api.entryOpen ? 0 : api.overlayOpen ? api.lock.y : window.scrollY;
      if (context.conditions.fine && motionAllowed) {
        // Only intentional keyboard navigation may scroll a newly focused element into view.
        // Browser focus restoration and dialog focus return must preserve the reading position.
        api.smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 0.8, smoothTouch: 0, effects: false, autoResize: false, normalizeScroll: false, onFocusIn: () => keyboardNavigation && !(api.overlayOpen || api.restoringFocus) });
        api.smoother.scrollTop(restoredScroll);
        if (api.overlayOpen || api.entryOpen) api.smoother.paused(true);
      }
      const pinning = context.conditions.pin && motionAllowed;
      document.documentElement.classList.toggle("has-chapter-pins", pinning);
      if (pinning) {
        for (const [id, endTrigger, start, end] of [
          ["service", ".worksGrid", "top 14%", "top 30%"],
          ["brands", ".brandsGrid", "top 18%", "top 55%"],
        ]) {
          gsap.timeline({ scrollTrigger: { id: `${id}-float`, trigger: `#${id} [data-motion-pin]`, start, endTrigger: `#${id} ${endTrigger}`, end, pin: true, pinSpacing: false, scrub: true, invalidateOnRefresh: true } })
            .to(`#${id} [data-motion-body]`, { y: () => -innerHeight * 0.1, opacity: 0.28, ease: "none", duration: 0.45 }, 0.55);
        }
      }
      api.requestRefresh();
      return () => {
        const y = api.overlayOpen ? api.lock.y : api.getScroll();
        api.smoother?.kill(); api.smoother = null;
        document.documentElement.classList.remove("has-chapter-pins");
        window.scrollTo({ top: y, behavior: "instant" });
      };
    });

    entry = createEntryTransition(api, onEntryUpdate, reducedMotion);

    const anchor = () => {
      const target = document.getElementById(location.hash.slice(1));
      if (target && ["about", "service", "brands", "contact"].includes(target.id)) {
        api.skipEntry();
        ScrollTrigger.refresh();
        api.scrollTo(target, false);
      }
    };
    const settle = () => {
      if (disposed) return;
      entry.refresh(); api.requestRefresh(); keepEntry();
      if (initialAnchor) { initialAnchor = false; anchor(); }
    };
    document.fonts.ready.then(settle);
    let lastWidth = 0, lastHeight = 0;
    const resize = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width), height = Math.round(entry.contentRect.height);
      if (width !== lastWidth || height !== lastHeight) { lastWidth = width; lastHeight = height; api.requestRefresh(); }
    });
    resize.observe(document.querySelector("#smooth-content"));
    const onRefresh = () => api.notify();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    window.addEventListener("hashchange", anchor);
    const onResize = () => { entry.refresh(); api.requestRefresh(); };
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true; refresh.kill(); resize.disconnect();
      entry.destroy();
      window.removeEventListener("scroll", keepEntry);
      document.removeEventListener("pointerdown", pointerFocus, true); document.removeEventListener("keydown", keyboardFocus, true);
      window.removeEventListener("hashchange", anchor); window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      media.revert(); api.requestRefresh = () => {};
    };
  }, [api, reducedMotion, onEntryUpdate]);
  return null;
}

export function MotionProvider({ reducedMotion, onEntryUpdate, children }) {
  const api = useMemo(createMotion, []);
  return <MotionContext.Provider value={api}>{children}<MotionController api={api} reducedMotion={reducedMotion} onEntryUpdate={onEntryUpdate} /></MotionContext.Provider>;
}
