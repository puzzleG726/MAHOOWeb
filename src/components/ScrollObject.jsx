import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";

export default function ScrollObject(props) {
  const groupRef = useRef();
  const { scene } = useGLTF("/BlackDice.glb");

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.003;
      groupRef.current.rotation.y += 0.008;
    }
  });

  return (
    <Center>
      <primitive ref={groupRef} object={scene} scale={2.4} {...props} />
    </Center>
  );
}

useGLTF.preload("/BlackDice.glb");
