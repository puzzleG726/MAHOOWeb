import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { metalVertexShader, metalFragmentShader } from "../shaders/liquidGradientShaders.js";
export function createStudioEnvironment(renderer, illuminatedRoom = false) {
  const room = new RoomEnvironment(illuminatedRoom ? renderer : null);
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(room, 0.04);
  room.dispose(); generator.dispose();
  return target;
}
export function createFragmentEnvironment(renderer) {
  const studio = new THREE.Scene();
  // Local studio cards give the mineral planes neutral silver reflections.
  studio.background = new THREE.Color().setScalar(0.16);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const card = (position, width, height, intensity) => {
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(intensity), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position); mesh.scale.set(width, height, 1); mesh.lookAt(0, 0, 0);
    studio.add(mesh);
  };
  card([-4, 2, 5], 1.4, 8, 2.4);
  card([5, 0, -2], 0.7, 6, 2);
  card([0, 5, 1], 5, 0.8, 2.2);
  card([0, -1, 7], 7, 5, 0.35);
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(studio, 0.025);
  studio.traverse(object => object.material?.dispose()); geometry.dispose(); generator.dispose();
  return target;
}
export function createMetalField(grid = 0) {
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uTravel: { value: 0 }, uResolution: { value: new THREE.Vector2(1280, 720) }, uPointer: { value: new THREE.Vector2() }, uGrid: { value: grid }, uPulse: { value: 0 } },
    vertexShader: metalVertexShader, fragmentShader: metalFragmentShader,
    depthTest: false, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false; mesh.renderOrder = -100;
  return mesh;
}
export function disposeObject(object) {
  object?.traverse(child => {
    child.geometry?.dispose();
    const materials = child.material ? (Array.isArray(child.material) ? child.material : [child.material]) : [];
    materials.forEach(material => material.dispose());
  });
}
