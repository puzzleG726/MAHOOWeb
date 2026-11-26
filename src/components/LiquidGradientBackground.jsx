import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { createMetalField, createFragmentEnvironment } from "./sceneUtils.js";
import { createParticleHighlights } from "./ParticleHighlights.js";
import { createFragmentHelix } from "./FragmentHelix.js";
import { createGradientField } from "./GradientField.js";
import { getSceneSettings, subscribeSceneSettings } from "../sceneSettings.js";
import { useMotion } from "../motion.jsx";

const smooth = THREE.MathUtils.smoothstep;

export default function LiquidGradientBackground({ reducedMotion }) {
  const container = useRef(null);
  const motion = useMotion();
  useEffect(() => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: "high-performance" }); } catch { return; }
    const root = container.current;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.setAttribute("aria-hidden", "true"); root.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(44, 1, 0.1, 160);
    scene.background = new THREE.Color(0x060708);
    scene.fog = new THREE.Fog(0x060708, 26, 65);
    const field = createMetalField();
    // The entry field covers the spatial scene only during the existing glass transition.
    field.material.transparent = true; field.renderOrder = 100;
    field.material.uniforms.uCover = { value: 1 };
    field.material.fragmentShader = "uniform float uCover;\n" + field.material.fragmentShader.replace("vec4(col, 1.0)", "vec4(col, uCover)");
    scene.add(field);
    const gradient = createGradientField(); scene.add(gradient);
    const environment = createFragmentEnvironment(renderer); scene.environment = environment.texture;
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const key = new THREE.DirectionalLight(0xf7f9fa, 1.6); key.position.set(-3, 4, 7); scene.add(key);
    const rim = new THREE.DirectionalLight(0xe7ecf0, 1.1); rim.position.set(4, 1, -2); scene.add(rim);
    const helix = createFragmentHelix(scene);
    const highlights = createParticleHighlights(renderer, scene, camera);
    const pointer = new THREE.Vector2(), pointerTarget = new THREE.Vector2();
    const interaction = { pointer: new THREE.Vector2(), active: false };
    let width = innerWidth, height = innerHeight, time = 0, disposed = false, lost = false, frame = 0, settingsFrame = 0;
    const measure = () => {
      if (disposed) return;
      const content = document.querySelector("#smooth-content");
      helix.rebuild({ width, height, length: content?.scrollHeight || document.body.scrollHeight, settings: getSceneSettings() });

      requestFrame();
    };
    const render = (_, elapsedMs = 16.67) => {
      frame = 0;
      if (disposed || document.hidden || lost || motion.overlayOpen) { interaction.active = false; return; }
      const delta = Math.min(elapsedMs / 1000, 0.05), scroll = motion.getScroll();
      if (!reducedMotion) { time += delta; pointer.lerp(pointerTarget, 1 - Math.exp(-8 * delta)); }
      motion.fieldState.time = time; motion.fieldState.x = pointer.x; motion.fieldState.y = pointer.y;
      field.material.uniforms.uTime.value = time;
      field.material.uniforms.uTravel.value = reducedMotion ? 0 : scroll / Math.max(height, 1);
      field.material.uniforms.uGrid.value = reducedMotion ? 0 : 1 - motion.entryProgress;
      field.material.uniforms.uPointer.value.copy(pointer);
      const reveal = smooth(motion.entryProgress, 0.5, 1);
      const settings = getSceneSettings();
      const pose = helix.update(camera, scroll, pointer, reveal, reducedMotion, settings, time, interaction, delta);
      gradient.material.uniforms.uPointer.value.copy(pointer);
      gradient.material.uniforms.uStrength.value = settings.gradientStrength;
      gradient.material.uniforms.uIridescence.value = settings.iridescence;
      gradient.material.uniforms.uMouseStrength.value = settings.pointerStrength;
      gradient.material.uniforms.uTravel.value = reducedMotion ? 0 : pose.travel;
      gradient.material.uniforms.uGrain.value = settings.grain;
      const cover = 1 - smooth(motion.entryProgress, 0.5, 1);
      field.visible = cover > 0.001; field.material.uniforms.uCover.value = cover;
      highlights.render();
    };
    function requestFrame() { if (reducedMotion && !frame && !disposed) frame = requestAnimationFrame(() => render(0, 16.67)); }
    const resize = () => {
      width = innerWidth; height = innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width <= 768 ? 1 : 1.5)); renderer.setSize(width, height); highlights.resize(width, height);
      camera.aspect = width / height;
      camera.fov = width <= 768 ? 48 : 44; camera.updateProjectionMatrix();
      field.material.uniforms.uResolution.value.set(width, height); gradient.material.uniforms.uResolution.value.set(width,height); measure();
    };
    const move = event => {
      if (event.target instanceof Element && event.target.closest(".sceneControls")) { interaction.active = false; return; }
      interaction.active = !reducedMotion && !motion.overlayOpen && event.pointerType !== "touch";
      if (interaction.active) {
        pointerTarget.set(event.clientX / innerWidth * 2 - 1, 1 - event.clientY / innerHeight * 2);
        interaction.pointer.copy(pointerTarget);
      }
    };
    const reset = () => { pointerTarget.set(0, 0); interaction.active = false; };
    const visibility = () => { if (!document.hidden) { reset(); requestFrame(); } };
    const contextLost = event => { event.preventDefault(); lost = true; renderer.domElement.style.opacity = "0"; };
    resize();
    if (!reducedMotion) gsap.ticker.add(render);
    const unsubscribe = motion.subscribe(measure);
    let previousSettings = getSceneSettings();
    const unsubscribeSettings = subscribeSceneSettings(next => {
      const rebuild = ["density","particleSize","helixWidth","helixPitch","depth","scatter"].some(key => next[key] !== previousSettings[key]);
      previousSettings = next;
      if (rebuild && !settingsFrame) settingsFrame = requestAnimationFrame(() => { settingsFrame = 0; measure(); });
      requestFrame();
    });
    window.addEventListener("resize", resize); window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("pointermove", move, { passive: true }); document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset); document.addEventListener("visibilitychange", visibility);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    return () => {
      disposed = true; cancelAnimationFrame(frame); gsap.ticker.remove(render); unsubscribe(); unsubscribeSettings(); cancelAnimationFrame(settingsFrame);
      window.removeEventListener("resize", resize); window.removeEventListener("scroll", requestFrame); window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset); window.removeEventListener("blur", reset); document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      highlights.dispose(); helix.dispose(); gradient.geometry.dispose(); gradient.material.dispose(); field.geometry.dispose(); field.material.dispose(); environment.dispose();
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, [reducedMotion, motion]);
  return <div className="liquidGradientBackground" ref={container} aria-hidden="true" />;
}
