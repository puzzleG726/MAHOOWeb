import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollFlipThree.css";

gsap.registerPlugin(Flip, ScrollTrigger);

const MODEL_URL = "/BlackDice.glb";

export default function ScrollFlipThree() {
  const rootRef = useRef(null);
  const initialRef = useRef(null);
  const secondMarkerRef = useRef(null);
  const thirdMarkerRef = useRef(null);
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const initial = initialRef.current;
    const secondMarker = secondMarkerRef.current;
    const thirdMarker = thirdMarkerRef.current;

    if (!root || !initial || !secondMarker || !thirdMarker) return undefined;

    const canvas = document.createElement("canvas");
    canvas.className = "scrollFlipThreeCanvas";
    initial.appendChild(canvas);
    canvasRef.current = canvas;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 20);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(2.5, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8aa0ff, 1.2);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let flipContext;
    let model;
    let disposed = false;

    const render = () => {
      renderer.render(scene, camera);
    };

    const resizeRenderer = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    const normalizeModel = (object) => {
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();

      box.getSize(size);
      box.getCenter(center);
      object.position.sub(center);

      const largestAxis = Math.max(size.x, size.y, size.z) || 1;
      object.scale.setScalar(14 / largestAxis);
    };

    const buildTimeline = () => {
      if (!model) return;

      flipContext?.revert();
      flipContext = gsap.context(() => {
        const secondState = Flip.getState(secondMarker);
        const thirdState = Flip.getState(thirdMarker);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: 0,
            end: "+=1800",
            scrub: 2,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .add(
            Flip.fit(canvas, secondState, {
              duration: 1,
              ease: "none",
            }),
            0,
          )
          .to(
            model.rotation,
            {
              x: `+=${Math.PI}`,
              y: `+=${Math.PI}`,
              duration: 1,
              ease: "none",
            },
            "<",
          )
          .addLabel("mid", "+=0.3")
          .add(
            Flip.fit(canvas, thirdState, {
              duration: 1,
              ease: "none",
            }),
            "mid",
          )
          .to(
            model.rotation,
            {
              x: `+=${Math.PI}`,
              y: `+=${Math.PI}`,
              duration: 1,
              ease: "none",
            },
            "<",
          );
      }, root);
    };

    const loader = new GLTFLoader();
    loader.load(MODEL_URL, (gltf) => {
      if (disposed) return;

      model = gltf.scene;
      normalizeModel(model);
      modelGroup.add(model);
      resizeRenderer();
      buildTimeline();
      ScrollTrigger.refresh();
    });

    const handleResize = () => {
      resizeRenderer();
      buildTimeline();
      ScrollTrigger.refresh();
    };

    gsap.ticker.add(render);
    resizeRenderer();
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(render);
      flipContext?.revert();
      renderer.dispose();
      canvas.remove();
      canvasRef.current = null;
    };
  }, []);

  return (
    <section className="scrollFlipThreeLayer" ref={rootRef} aria-hidden="true">
      <div
        className="scrollFlipThreeSlot scrollFlipThreeInitial"
        ref={initialRef}
      />
      <div className="scrollFlipThreeSlot scrollFlipThreeSecond">
        <div className="scrollFlipThreeMarker" ref={secondMarkerRef} />
      </div>
      <div className="scrollFlipThreeSlot scrollFlipThreeThird">
        <div className="scrollFlipThreeMarker" ref={thirdMarkerRef} />
      </div>
    </section>
  );
}
