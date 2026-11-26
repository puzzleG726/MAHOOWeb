import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { serviceCards, servicesData, translations } from "../data/content.js";
import { ExperienceContext } from "../experience.jsx";
import { useMotion } from "../motion.jsx";
import GalleryViewer from "./GalleryViewer.jsx";

gsap.registerPlugin(Flip);

export default function ServiceSection({ language }) {
  const { reducedMotion } = useContext(ExperienceContext);
  const motion = useMotion();
  const [filter, setFilter] = useState("all");
  const [selection, setSelection] = useState(null);
  const gridRef = useRef(null), cards = useRef(new Map());
  const flipState = useRef(null), flipAnimation = useRef(null), viewerOpen = useRef(false);
  const t = translations[language];
  const items = useMemo(() => serviceCards.flatMap(service => servicesData[service.key].gallery.map((image, index) => ({
    id: `${service.key}-${index}`, serviceKey: service.key, category: t[service.labelKey],
    imageUrl: image.imageUrl, tags: image.tags[language], number: index + 1,
  }))), [language, t]);
  const visibleItems = useMemo(() => items.filter(item => filter === "all" || item.serviceKey === filter), [items, filter]);

  const selectFilter = (key) => {
    if (key === filter || viewerOpen.current) return;
    Flip.killFlipsOf([...cards.current.values()], true);
    flipAnimation.current?.kill();
    gsap.killTweensOf([...cards.current.values()]);
    gsap.set([...cards.current.values()], { opacity: 1 });
    flipState.current = Flip.getState([...cards.current.values()]);
    setFilter(key);
  };
  useLayoutEffect(() => {
    if (!flipState.current) return;
    motion.layoutBusy = true;
    const complete = () => { motion.layoutBusy = false; motion.requestRefresh(); };
    if (reducedMotion) { flipState.current = null; complete(); return; }
    flipAnimation.current = Flip.from(flipState.current, {
      duration: 0.35, ease: "power2.inOut", absolute: true, scale: true, prune: true,
      onEnter: elements => gsap.fromTo(elements, { opacity: 0 }, { opacity: 1, duration: 0.25 }),
      onLeave: elements => gsap.to(elements, { opacity: 0, duration: 0.18 }),
      onComplete: complete, onInterrupt: complete,
    });
    flipState.current = null;
  }, [filter, reducedMotion, motion]);
  useLayoutEffect(() => () => {
    flipAnimation.current?.kill(); motion.layoutBusy = false;
    if (viewerOpen.current) motion.resume();
  }, [motion]);

  const open = (item, event) => {
    if (viewerOpen.current || motion.layoutBusy) return;
    viewerOpen.current = true;
    motion.pause();
    const opener = event.currentTarget;
    setSelection({ id: item.id, opener, rect: opener.querySelector(".workThumb").getBoundingClientRect() });
  };
  const movePreviewCursor = event => {
    if (event.pointerType === "touch") return;
    const thumb = event.currentTarget, rect = thumb.getBoundingClientRect();
    const label = thumb.querySelector(".workOpen");
    const x = Math.max(8, Math.min(rect.width - label.offsetWidth - 8, event.clientX - rect.left + 14));
    const y = Math.max(8, Math.min(rect.height - label.offsetHeight - 8, event.clientY - rect.top + 14));
    thumb.style.setProperty("--cursor-x", `${x}px`);
    thumb.style.setProperty("--cursor-y", `${y}px`);
  };
  const closed = () => {
    const opener = selection?.opener;
    motion.restoringFocus = true;
    viewerOpen.current = false; setSelection(null); motion.resume();
    requestAnimationFrame(() => {
      opener?.focus({ preventScroll: true });
      requestAnimationFrame(() => { motion.restoringFocus = false; });
    });
  };
  return <section className="section worksSection" id="service">
    <div className="sectionInner">
      <div className="worksHeaderStage">
        <div className="worksHeaderPin" data-motion-pin>
          <div className="worksHeader" data-motion-body>
            <div className="eyebrow">02 / What we do</div>
            <h2 className="worksTitle">WORKS</h2>
            <div className="workFilters" aria-label="Filter works by service">
              <button type="button" className={`workFilter ${filter === "all" ? "is-active" : ""}`} aria-pressed={filter === "all"} onClick={() => selectFilter("all")}>All works</button>
              {serviceCards.map(service => <button key={service.key} type="button" className={`workFilter ${filter === service.key ? "is-active" : ""}`} aria-pressed={filter === service.key} onClick={() => selectFilter(service.key)}>
                <img src={service.icon} className="workFilterIcon" alt="" />{t[service.labelKey]}
              </button>)}
            </div>
          </div>
        </div>
      </div>
      <div className="worksGrid" ref={gridRef} aria-label="Works gallery">
        {items.map(item => {
          const visible = filter === "all" || filter === item.serviceKey;
          return <button type="button" key={item.id} ref={element => { if (element) cards.current.set(item.id, element); else cards.current.delete(item.id); }}
            className="workCard" data-work-id={item.id} style={{ display: visible ? undefined : "none" }}
            aria-hidden={!visible || undefined} tabIndex={visible ? 0 : -1} aria-label={`View ${item.category} image ${item.number}`} onClick={event => open(item, event)}>
            <span className="workThumb" onPointerEnter={movePreviewCursor} onPointerMove={movePreviewCursor}><img src={item.imageUrl} alt={`${item.category} image ${item.number}`} loading="lazy" decoding="async" draggable="false" onLoad={() => motion.requestRefresh()} />
              <span className="workOpen" aria-hidden="true">View image <span>↗</span></span>
            </span>
          </button>;
        })}
      </div>
      <div className="diceAnchor galleryRouteAnchor" data-dice-anchor="gallery" aria-hidden="true" />
    </div>
    <div className="diceAnchor worksRouteAnchor" data-dice-anchor="service" aria-hidden="true" />
    {selection && <GalleryViewer items={visibleItems} initial={selection} reducedMotion={reducedMotion} onClosed={closed} />}
  </section>;
}
