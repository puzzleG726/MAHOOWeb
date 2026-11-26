import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

function imageBox(rect, width, height, cover) {
  const scale = Math[cover ? "max" : "min"](rect.width / width, rect.height / height);
  return { width: width * scale, height: height * scale, left: (rect.width - width * scale) / 2, top: (rect.height - height * scale) / 2 };
}

export default function GalleryViewer({ items, initial, reducedMotion, onClosed }) {
  const [index, setIndex] = useState(() => Math.max(0, items.findIndex(item => item.id === initial.id)));
  const [loaded, setLoaded] = useState(null), [failed, setFailed] = useState(null);
  const dialog = useRef(null), frame = useRef(null), image = useRef(null), ghost = useRef(null), ghostImage = useRef(null);
  const controls = useRef(null), metadata = useRef(null), shade = useRef(null);
  const animation = useRef(null), phase = useRef("opening"), resized = useRef(false), current = useRef(null);
  const item = items[index]; current.current = item;
  const loadedCurrent = loaded === item.id || (image.current?.complete && image.current?.naturalWidth > 0 && image.current?.getAttribute("src") === item.imageUrl);

  const settleOpen = () => {
    animation.current?.kill();
    gsap.killTweensOf(frame.current);
    gsap.set(ghost.current, { display: "none" });
    gsap.set(frame.current, { opacity: 1 });
    gsap.set([controls.current, metadata.current], { opacity: 1, y: 0 });
    gsap.set(shade.current, { opacity: 1 });
    phase.current = "open";
    if (dialog.current) dialog.current.dataset.state = "open";
  };
  const close = () => {
    if (phase.current === "closing") return;
    settleOpen(); phase.current = "closing"; dialog.current.dataset.state = "closing";
    const card = document.querySelector(`[data-work-id="${current.current.id}"] .workThumb`);
    const target = card?.getBoundingClientRect();
    const rect = frame.current.getBoundingClientRect();
    const canReturn = target && target.width > 0 && target.top >= 0 && target.bottom <= innerHeight && !resized.current && image.current?.naturalWidth;
    const finish = () => { dialog.current?.close(); onClosed(); };
    if (reducedMotion) { finish(); return; }
    const timeline = gsap.timeline({ onComplete: finish }); animation.current = timeline;
    timeline.to([controls.current, metadata.current], { opacity: 0, duration: 0.12 }, 0)
      .to(shade.current, { opacity: 0, duration: canReturn ? 0.42 : 0.2 }, 0);
    if (canReturn) {
      const width = image.current.naturalWidth, height = image.current.naturalHeight;
      ghostImage.current.src = current.current.imageUrl;
      gsap.set(ghost.current, { display: "block", left: rect.left, top: rect.top, width: rect.width, height: rect.height });
      gsap.set(ghostImage.current, imageBox(rect, width, height, false));
      gsap.set(frame.current, { opacity: 0 });
      timeline.to(ghost.current, { left: target.left, top: target.top, width: target.width, height: target.height, duration: 0.42, ease: "power3.inOut" }, 0)
        .to(ghostImage.current, { ...imageBox(target, width, height, true), duration: 0.42, ease: "power3.inOut" }, 0);
    } else timeline.to(frame.current, { opacity: 0, duration: 0.2 }, 0);
  };
  const step = direction => {
    if (phase.current === "closing") return;
    settleOpen();
    setIndex(previous => (previous + direction + items.length) % items.length);
  };

  useLayoutEffect(() => {
    const element = dialog.current; element.showModal(); element.dataset.state = "opening";
    const sourceImage = initial.opener.querySelector("img");
    const width = sourceImage.naturalWidth, height = sourceImage.naturalHeight;
    const rect = frame.current.getBoundingClientRect();
    const destination = imageBox(rect, width || rect.width, height || rect.height, false);
    const ready = sourceImage.complete && width > 0;
    if (ready) setLoaded(initial.id);
    const cleanup = () => { animation.current?.kill(); gsap.killTweensOf(frame.current); element.close(); };
    if (reducedMotion || !ready) { settleOpen(); return cleanup; }
    ghostImage.current.src = current.current.imageUrl;
    gsap.set(ghost.current, { display: "block", left: initial.rect.left, top: initial.rect.top, width: initial.rect.width, height: initial.rect.height });
    gsap.set(ghostImage.current, imageBox(initial.rect, width, height, true));
    gsap.set(frame.current, { opacity: 0 });
    gsap.set([controls.current, metadata.current], { opacity: 0, y: 6 });
    gsap.set(shade.current, { opacity: 0 });
    animation.current = gsap.timeline({ onComplete: settleOpen })
      .to(shade.current, { opacity: 1, duration: 0.25 }, 0)
      .to(ghost.current, { left: rect.left, top: rect.top, width: rect.width, height: rect.height, duration: 0.5, ease: "power3.inOut" }, 0)
      .to(ghostImage.current, { ...destination, duration: 0.5, ease: "power3.inOut" }, 0)
      .to(controls.current, { opacity: 1, y: 0, duration: 0.2 }, 0.4)
      .to(metadata.current, { opacity: 1, y: 0, duration: 0.15 }, 0.5);
    return cleanup;
  }, []);
  // Each navigation owns its own image node, so a late failed request cannot affect a newer image.
  useLayoutEffect(() => {
    if (phase.current === "open" && !reducedMotion) {
      const tween = gsap.fromTo(frame.current, { opacity: 0 }, { opacity: 1, duration: 0.18, overwrite: true });
      return () => tween.kill();
    }
  }, [index, reducedMotion]);
  useEffect(() => {
    const resize = () => { resized.current = true; if (phase.current === "opening") settleOpen(); };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return createPortal(<dialog className="workViewer" ref={dialog} aria-label="Works image viewer" aria-describedby="viewer-caption"
    onCancel={event => { event.preventDefault(); close(); }}
    onClick={event => { if (!event.target.closest(".viewerPanel")) close(); }}
    onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); step(event.key === "ArrowRight" ? 1 : -1); } }}>
    <div className="viewerShade" ref={shade} />
    <div className="viewerPanel">
      <div className="viewerTop" ref={controls}><span>{item.category}</span><span className="viewerCount">{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><button className="viewerClose" type="button" aria-label="Close image viewer" onClick={close}>×</button></div>
      <div className="viewerImageFrame" ref={frame}>
        <img key={item.id} ref={image} src={item.imageUrl} alt={`${item.category} image ${item.number}`} className="viewerImage" draggable="false" onLoad={() => setLoaded(item.id)} onError={() => setFailed(item.id)} style={{ visibility: failed === item.id ? "hidden" : undefined }} />
        {failed === item.id ? <span className="viewerStatus" role="status">Image unavailable</span> : !loadedCurrent ? <span className="viewerStatus" role="status">Loading image…</span> : null}
      </div>
      <div className="viewerMeta" ref={metadata} id="viewer-caption"><div className="viewerTags">{item.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div><div className="viewerNav"><button type="button" aria-label="Previous work image" onClick={() => step(-1)}>←</button><button type="button" aria-label="Next work image" onClick={() => step(1)}>→</button></div></div>
    </div>
    <div className="viewerTransition" ref={ghost} aria-hidden="true"><img ref={ghostImage} alt="" /></div>
  </dialog>, document.body);
}
