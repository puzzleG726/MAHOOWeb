import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createStudioEnvironment, disposeObject } from "./sceneUtils.js";

export default function FooterCanvas({ reducedMotion }) {
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 4);
    const environment = createStudioEnvironment(renderer); scene.environment = environment.texture;
    const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(-2, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1.5); fill.position.set(4, 1, 2); scene.add(fill);
    const group = new THREE.Group(); group.position.set(0, -0.22, 0); scene.add(group);
    let visible = false, disposed = false, frame = 0, model;
    const pointer = new THREE.Vector2();
    const render = () => {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      if (model) {
        group.rotation.y += ((reducedMotion ? 0 : pointer.x * 0.12) - group.rotation.y) * 0.06;
        group.rotation.x += ((reducedMotion ? 0 : -pointer.y * 0.07) - group.rotation.x) * 0.06;
      }
      renderer.render(scene, camera);
      if (!reducedMotion) requestFrame();
    };
    function requestFrame() { if (!frame && visible && !disposed && !document.hidden) frame = requestAnimationFrame(render); }
    const resize = () => {
      const width = container.clientWidth, height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
      group.scale.setScalar(width <= 768 ? 3 : Math.min(4.7, camera.aspect * 2.2)); requestFrame();
    };
    const move = (event) => { if (!visible || reducedMotion || event.pointerType === "touch") return; const rect = container.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2); };
    new GLTFLoader().load("/mahoologo.glb", gltf => {
      if (disposed) { disposeObject(gltf.scene); return; }
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3());
      model.position.sub(box.getCenter(new THREE.Vector3()));
      const normalizer = new THREE.Group(); normalizer.add(model); normalizer.scale.setScalar(1 / size.x); group.add(normalizer);
      model.traverse(child => { if (child.isMesh) { child.material.dispose(); child.material = new THREE.MeshPhysicalMaterial({ color: 0x45494d, metalness: 1, roughness: 0.23, clearcoat: 0.5, clearcoatRoughness: 0.18, envMapIntensity: 2 }); } });
      requestFrame();
    }, undefined, () => {});
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) requestFrame(); else { cancelAnimationFrame(frame); frame = 0; } }); observer.observe(container);
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else requestFrame(); };
    window.addEventListener("pointermove", move, { passive: true }); document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
      window.removeEventListener("pointermove", move); document.removeEventListener("visibilitychange", visibility);
      disposeObject(scene); environment.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, [reducedMotion]);
  return <div id="footer-canvas" ref={containerRef} aria-hidden="true" />;
}
