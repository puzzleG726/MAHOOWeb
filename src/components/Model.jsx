import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Center, MeshTransmissionMaterial, useGLTF } from "@react-three/drei";

export default function Model({ motion, transmissionBuffer }) {
  const group = useRef();
  const { viewport, size } = useThree();
  const gltf = useGLTF(`${import.meta.env.BASE_URL}mahoologo.glb`);
  const meshes = useMemo(() => {
    const result = []; gltf.scene.traverse(child => { if (child.isMesh) result.push(child); }); return result;
  }, [gltf]);
  useFrame((_, delta) => {
    if (!group.current || motion.entryBusy || motion.entryProgress > 0) return;
    const alpha = 1 - Math.exp(-7 * Math.min(delta, 0.05));
    const yaw = -0.1 + motion.fieldState.x * 0.22;
    const pitch = 0.02 - motion.fieldState.y * 0.1;
    group.current.rotation.y += (yaw - group.current.rotation.y) * alpha;
    group.current.rotation.x += (pitch - group.current.rotation.x) * alpha;
  });
  const scale = viewport.width * (size.width <= 768 ? 0.65 : 0.32) / 0.225;
  return <Center>
    <group ref={group} scale={scale} rotation={[0.02, -0.1, 0]}>
      {meshes.map((child, index) => <mesh key={index} geometry={child.geometry} position={child.position} rotation={child.rotation} scale={[1, 1, 1.6]}>
        <MeshTransmissionMaterial buffer={transmissionBuffer} transmission={1} roughness={0.07} thickness={0.14} ior={1.1}
          chromaticAberration={0.32} anisotropicBlur={0.02} samples={8} resolution={size.width <= 768 ? 256 : 768} backside={false} />
      </mesh>)}
    </group>
  </Center>;
}
