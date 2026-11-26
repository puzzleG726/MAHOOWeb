import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Model from "./Model.jsx";
import { createMetalField, createStudioEnvironment } from "./sceneUtils.js";
import { getTitleFontSize, useMotion } from "../motionContext.js";

function IntroScene({ motion }) {
  const { gl, scene, camera, size, viewport } = useThree();
  const text = useRef(), buffered = useRef(false);
  const field = useMemo(() => createMetalField(1), []);
  const backdrop = useMemo(() => new THREE.Scene(), []);
  const target = useMemo(() => new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false }), []);
  useEffect(() => {
    const environment = createStudioEnvironment(gl);
    scene.environment = environment.texture;
    return () => { scene.environment = null; environment.dispose(); };
  }, [gl, scene]);
  useEffect(() => {
    const dpr = Math.min(gl.getPixelRatio(), 1);
    target.setSize(Math.round(size.width * dpr), Math.round(size.height * dpr));
    buffered.current = false;
    field.material.uniforms.uResolution.value.set(size.width, size.height);
  }, [size.width, size.height, gl, target, field]);
  useEffect(() => () => { target.dispose(); field.geometry.dispose(); field.material.dispose(); }, [target, field]);
  useFrame(() => {
    // Freeze the refraction source along with the glass pose during a click transition.
    if (buffered.current && (motion.entryBusy || motion.entryProgress > 0)) return;
    const { time, x, y } = motion.fieldState;
    field.material.uniforms.uTime.value = time;
    field.material.uniforms.uPointer.value.set(x, y);
    field.material.uniforms.uGrid.value = 1;
    if (text.current) {
      const unit = viewport.getCurrentViewport(camera, [0, 0, -0.65]).width / size.width;
      text.current.position.set(0, 0, -0.65);
      text.current.fontSize = getTitleFontSize(size.width) * unit;
    }
    const tone = gl.toneMapping;
    gl.toneMapping = THREE.NoToneMapping;
    gl.setRenderTarget(target); gl.clear(); gl.render(backdrop, camera);
    gl.setRenderTarget(null); gl.toneMapping = tone;
    buffered.current = true;
  }, -1);
  return <>
    {createPortal(<>
      <primitive object={field} />
      <Text ref={text} font={`${import.meta.env.BASE_URL}fonts/SpaceGrotesk-Variable.ttf`} fontSize={1} letterSpacing={-0.065} color="#e8e9e9" anchorX="center" anchorY="middle">Mahoo Lab.</Text>
    </>, backdrop)}
    <ambientLight intensity={0.35} />
    <directionalLight position={[1, 3, 4]} intensity={2.5} />
    <Model motion={motion} transmissionBuffer={target.texture} />
  </>;
}

export default function IntroCanvas({ active }) {
  const motion = useMotion();
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}
    gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    frameloop={hidden || !active ? "never" : "always"} fallback={null}>
    <Suspense fallback={null}><IntroScene motion={motion} /></Suspense>
  </Canvas>;
}
